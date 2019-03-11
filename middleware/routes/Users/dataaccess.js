const db = require("../../../data/dbConfig");

module.exports = {
  registerUser
};

function registerUser(userData) {
  return db("Users").insert(userData);
}