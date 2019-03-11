const router = require("express").Router();
const bcrypt = require("bcrypt");

const dbHelper = require("./dbHelper");
const jwtGenToken = require("../../auth/jwt/jwtGenToken");
const jwtRestrict = require("../../auth/jwt/jwtRestrict");

router.post("/register", async (req, res) => {
  console.log("\nAttempting to register new user...");

  const userInfo = req.body;

  console.log("Checking if all required fields were supplied...");
  if (!userInfo.UserName) {
    res.status(422).json({ msg: "Username was not supplied." });
  } else if (!userInfo.UserPassword) {
    res.status(422).json({ msg: "Password was not supplied." });
  } else {
    try {
      console.log("Securing password...");
      userInfo.UserPassword = bcrypt.hashSync(userInfo.UserPassword, 12);

      console.log("Adding user to registration records....");
      await dbHelper.registerUser(userInfo);

      res
        .status(201)
        .json({ msg: `${userInfo.UserName} has been registered.` });
    } catch (err) {
      if (err.errno && err.errno === 19) {
        res.status(400).json({ msg: "Supplied username was not unique." })
      } else {
        res.status(500).json({ msg: err.toString() });
      }
    }
  }
});

router.post("/login", async (req, res) => {
  console.log("\nAttempting login...");

  const userInfo = req.body;

  console.log("Checking if all required fields were supplied...");
  if (!userInfo.UserName) {
    res.status(422).json({ msg: "Username was not supplied." });
  } else if (!userInfo.UserPassword) {
    res.status(422).json({ msg: "Password was not supplied." });
  } else {
    try {
      console.log("Checking if a user match exists...");
      const userMatch = await dbHelper.getUsers(userInfo);
      if (userMatch) {
        console.log("Checking if the correct password was supplied...");
        if (bcrypt.compareSync(userInfo.UserPassword, userMatch.UserPassword)) {
          console.log("Setting up token...");
          const token = await jwtGenToken(userMatch);
          res.status(200).json({token});
        } else {
          res.status(401).json("Invalid credentials.");
        }
      } else {
        res.status(401).json("Invalid credentials.");
      }
    } catch (err) {
      res.status(500).json({ msg: err.toString() });
    }
  }
});

// Middleware for JWT restriction is applied here; if user gets past that, then user is authenticated
router.get("/auth", jwtRestrict, (req, res) => {
  res.status(200).json({ msg: "Authentication successful."});
});

module.exports = router;
