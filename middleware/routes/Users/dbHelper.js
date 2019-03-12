const db = require("../../../data/dbConfig");

module.exports = {
  registerUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  deleteUser,
  updateUserPassword
};

function registerUser(userInfo) {
  return db("Users").insert(userInfo);
}

function getAllUsers() {
  return db("Users").select("UserID", "UserEmail");
}

function getUserByEmail(UserEmail) {
  return db("Users")
    .where({ UserEmail })
    .first();
}

function getUserById(UserID) {
  return db("Users")
    .where({ UserID })
    .first();
}

function deleteUser(UserID) {
  return db("Users")
    .delete()
    .where({ UserID });
}

function updateUserPassword(UserID, UserPassword) {
  return db("Users")
    .update({ UserPassword })
    .where({ UserID });
}
