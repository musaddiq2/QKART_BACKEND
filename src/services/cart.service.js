const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
//const { response } = require("../app");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const cart =  await Cart.findOne({email: user.email});

  if(!cart){
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart")
  }
  return cart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */

/**/
const createCart = async (user) => {
  const newCart = await Cart.create({
    email: user.email,
  });
  if (!newCart) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Cart creation failed"
    );
  }
  return newCart;
};

const addProductToCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({ email: user.email });
  if (!cart) {
    //no cart for user, create new cart
    cart = await createCart(user);
  }
  //cart exists for user
  // Check if product available in product DB
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product doesn't exist in Database"
    );
  } else {
    const productAlreadyInCart = await cart.cartItems.filter(
      (obj) => obj.product._id == productId
    );
    if (productAlreadyInCart.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Product already in cart. Use the cart sidebar to update or remove product from cart"
      );
    } else {
      // product does not exists in cart, add the Product
      cart.cartItems.push({ product, quantity });
    }
    cart = await cart.save();
    return cart;
  }
};
/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  const cart = await Cart.findOne({ email: user.email });
  if (!cart) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User does not have a cart. Use POST to create cart and add a product"
    );
  } else {
    const productInDB = await Product.findById(productId);
    if (!productInDB) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Product doesn't exist in database"
      );
    }
    const productInCart = await cart.cartItems.filter(
      (obj) => obj.product._id == productId
    );
    if (!productInCart.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Product not in Cart");
    }

    const index = await cart.cartItems.findIndex(
      (obj) => obj.product._id == productId
    );
    const cartItem = cart.cartItems[index];
    cartItem.quantity = quantity;
    cart.cartItems[index] = cartItem;
    await cart.save();
    return cart;
  }
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  const cart = await Cart.findOne({ email: user.email });

  if (!cart) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User does not have a cart. Use POST to create cart and add a product"
    );
  } else {
    const productInCart = cart.cartItems.find(
      (obj) => obj.product._id == productId
    );

    if (!productInCart) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Product not in Cart");
    }

    const index = cart.cartItems.findIndex(
      (obj) => obj.product._id == productId
    );

    if (index > -1) {
      cart.cartItems.splice(index, 1);
    }

    await cart.save();
    return cart;
  }
};

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
 // console.log("checkout",user);
  const cart = await Cart.findOne({ email: user.email });

  let wallet =  user.walletMoney;
  if (!cart) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Cart is not present for the user"
    );
  }
  if (!cart.cartItems.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User's cart does not have any products"
    );
  }
  let address = await user.hasSetNonDefaultAddress();
  console.log(address,"address from model");
  if (!address) {
    console.log("hello");
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User must specify a valid address"
    );
  }
  let total = 0;
  cart.cartItems.forEach((item) => {
    total = total + (item.product.cost * item.quantity);
  });

  if (wallet < total) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Wallet Balance is insufficient"
    );
  }

  user.walletMoney = wallet - total;
  cart.cartItems = [];
  await cart.save();
  return cart;
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
