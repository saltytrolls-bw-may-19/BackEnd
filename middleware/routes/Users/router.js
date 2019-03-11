const router = require("express").Router();
const bcrypt = require("bcrypt");

const dbHelper = require("./dbHelper");

router.post("/register", async (req, res) => {
  console.log("\nAttempting to register new user...");

  const userInfo = req.body;

  if (!userInfo.UserName) {
    res.status(422).json({ msg: "Username was not supplied." });
  } else if (!userInfo.UserPassword) {
    res.status(422).json({ msg: "Password was not supplied." });
  } else {
    try {
      console.log("Securing password...")
      userInfo.UserPassword = bcrypt.hashSync(userInfo.UserPassword, 12);

      console.log("Adding user to registration records....")
      await dbHelper.registerUser(userInfo);

      res.status(201).json({ msg: `${userInfo.UserName} has been registered.` });
    } catch (err) {
      res.status(500).json({ msg: err.toString() });
    }
  }
});

module.exports = router;
