const db = require("../../../data/dbConfig");

module.exports = {
  registerUser,
  getUsers
};

function registerUser(userData) {
  return db("Users").insert(userData);
}

function getUsers(user) {
  if (user) {
    return db("Users")
      .where({ "UserEmail": user.UserEmail })
      .first();
  }
  return db("Users").select("UserID", "UserEmail");
}
