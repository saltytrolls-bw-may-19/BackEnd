require("dotenv").config();

// Set up the port to use for the server
const port = process.env.PORT || 5000;

// Import the server file and get it running
const server = require("./server.js");
server.listen(port, () =>
  console.log(`|\n-- SaltyTrolls server running on port ${port} --\n|`)
);
