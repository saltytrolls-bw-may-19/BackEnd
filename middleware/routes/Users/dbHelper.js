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
      .where({ "UserName": user.UserName })
      .first();
  }
  return db("Users").select("UserID", "UserName");
}
