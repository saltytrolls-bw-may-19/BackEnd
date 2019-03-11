/* Server imports */

const express = require("express"); // For setting up the Express server itself

const cors = require("cors"); // Set up CORS policy - allows interaction with client app
const helmet = require("helmet"); // For security
const morgan = require("morgan"); // For logging

// Set up express server
const server = express();

// Built-in middleware to be able to work with JSON files
server.use(express.json());

// Applying third party middleware
server.use(cors());
server.use(helmet());
server.use(morgan("dev")); // Log setting for developer use

module.exports = server;
