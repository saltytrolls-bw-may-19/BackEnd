/* Imports for the server */

const express = require("express"); // Import needed for setting up the Express server itself

const cors = require("cors"); // Set up CORS policy - allows interaction with client app
const helmet = require("helmet"); // For security
const morgan = require("morgan"); // For logging

// Importing routers
const rootRouter = require("./middleware/routes/root/router.js"); // Router for root URL of application ("/" route)
const UsersRouter = require("./middleware/routes/Users/router"); // For handling app users
const errorRouter = require("./middleware/routes/error/router.js"); // Router for handling bad requests

// Setting up the express server
const server = express();

// Built-in middleware to be able to work with JSON files
server.use(express.json());

// Applying third party middleware
server.use(cors());
server.use(helmet());
server.use(morgan("dev")); // Log setting for developer use

// Adding routers
server.use("/", rootRouter);
server.use("/api/users", UsersRouter);
server.use(errorRouter);

module.exports = server;
