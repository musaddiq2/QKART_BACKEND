const express = require("express");
const compression = require("compression");
const cors = require("cors");
const httpStatus = require("http-status");
const userroutes = require("./routes/v1/user.route");
const { jwtStrategy } = require("./config/passport");
const passport = require("passport");
const routes = require("./routes/v1");
const { errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");
const helmet = require("helmet");
const app = express();

// set security HTTP headers - https://helmetjs.github.io/
app.use(helmet());



// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

passport.use("jwt", jwtStrategy);
// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options("*", cors());


app.use("/v1", routes);

app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

app.use(errorHandler);

module.exports = app;
