const db = require("../../../data/dbConfig");

module.exports = {
  registerUser,
  getUsers,
  deleteUser,
  updateUserPassword
};

function registerUser(userInfo) {
  return db("Users").insert(userInfo);
}

function getUsers(user) {
  if (user) {
    return db("Users")
      .where({ UserEmail: user.UserEmail })
      .first();
  }
  return db("Users").select("UserID", "UserEmail");
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
