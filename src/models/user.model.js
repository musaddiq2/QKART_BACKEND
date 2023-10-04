const mongoose = require("mongoose");
// NOTE - "validator" external library and not the custom middleware at src/middlewares/validate.js
const validator = require("validator");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: {
      type: String,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
    },
    walletMoney: {
      type: Number,
      required: true,
      default: config.default_wallet_money,
    },
    address: {
      type: String,
      default: config.default_address,
    },
  },
  // Create createdAt and updatedAt fields automatically
  {
    timestamps: true,
  }
);

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement the isEmailTaken() static method
/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */
 userSchema.statics.isEmailTaken = async function (email) {
  // CRIO_SOLUTION_START_MODULE_UNDERSTAND  ING_BASICS
  const user = await this.findOne({ email });
  //use !!user to return falsy values
  return !!user;
  // CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS
};

userSchema.methods.isPasswordMatch = async function (password) {
  // CRIO_SOLUTION_START_MODULE_AUTH
  const user = this;
  // console.log(password,"pass");
  // console.log(this.password,"this pass");
  // console.log(await bcrypt.compare(password, user.password));
  return await bcrypt.compare(password, user.password);
  // CRIO_SOLUTION_END_MODULE_AUTH
};

// CRIO_SOLUTION_START_MODULE_AUTH
// userSchema.pre("save", async function (next) {
//   const user = this;
//   if (user.isModified("password")) {
//     user.password = await bcrypt.hash(user.password, await bcrypt.genSalt());
//   }
//   next();
// });

/**
 * Check if user have set an address other than the default address
 * - should return true if user has set an address other than default address
 * - should return false if user's address is the default address
 *
 * @returns {Promise<boolean>}
 */
userSchema.methods.hasSetNonDefaultAddress = async function () {
  const user = this;
   return user.address !== config.default_address;
};

/*
 * Create a Mongoose model out of userSchema and export the model as "User"
 * Note: The model should be accessible in a different module when imported like below
 * const User = require("<user.model file path>").User;
 */
/**
 * 
 */

const User = mongoose.model("User", userSchema);


module.exports.User = User;
module.exports = {
  User,
};
