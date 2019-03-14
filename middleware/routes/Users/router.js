const router = require("express").Router();

const dbHelper = require("./dbHelper.js");

const bcrypt = require("bcrypt");
const jwtGenToken = require("../../auth/jwt/jwtGenToken.js");
const jwtRestrict = require("../../auth/jwt/jwtRestrict.js");

router.post("/register", async (req, res) => {
  console.log("\nAttempting to register new user...");

  const userInfo = req.body;

  console.log("Checking if all required fields were supplied...");
  if (!userInfo.UserEmail) {
    res.status(400).json({ msg: "Email address was not supplied." });
  } else if (!userInfo.UserPassword) {
    res.status(400).json({ msg: "Password was not supplied." });
  } else {
    try {
      console.log("Securing password...");
      userInfo.UserPassword = bcrypt.hashSync(userInfo.UserPassword, 12);

      console.log("Adding user to registration records....");
      await dbHelper.registerUser(userInfo);

      res
        .status(201)
        .json({ msg: `${userInfo.UserEmail} has been registered.` });
    } catch (err) {
      if (err.errno && err.errno === 19) {
        res.status(422).json({ msg: "Supplied email address was not unique." });
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
  if (!userInfo.UserEmail) {
    res.status(400).json({ msg: "Email address was not supplied." });
  } else if (!userInfo.UserPassword) {
    res.status(400).json({ msg: "Password was not supplied." });
  } else {
    try {
      console.log("Checking if a user match exists...");
      const userMatch = await dbHelper.getUserByEmail(userInfo.UserEmail);
      if (userMatch) {
        console.log("Checking if the correct password was supplied...");
        if (bcrypt.compareSync(userInfo.UserPassword, userMatch.UserPassword)) {
          console.log("Setting up token...");
          const token = await jwtGenToken(userMatch);
          res.status(200).json({
            UserID: userMatch.UserID,
            UserEmail: userMatch.UserEmail,
            token
          });
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
  res.status(200).json({ msg: "Authentication successful." });
});

router.delete("/:id", jwtRestrict, async (req, res) => {
  console.log("\nAttempting to delete the current user...");

  const { id } = req.params;
  const tokenId = req.decoded.subject;

  console.log(
    "Checking if the ID request parameter matches the given token..."
  );
  if (id === tokenId) {
    try {
      console.log("Checking if current user is recorded in the database...");
      const currentUser = await dbHelper.getUserById(id);
      if (!currentUser) {
        res
          .status(404)
          .json({ msg: "Current user is not recorded in the database." });
        return;
      }

      console.log("Performing user deletion operation...");
      const deletedUser = await dbHelper.deleteUser(id);

      console.log("Checking if current user was actually deleted...");
      if (deletedUser) {
        res.status(200).json({ msg: "User was successfully deleted." });
      } else {
        // 500 because the current user was supposed to exist before the API call and should be deleted only now
        res
          .status(500)
          .json({ msg: "An error occurred in deleting the current user." });
      }
    } catch (err) {
      res.status(500).json({ msg: err.toString() });
    }
  } else {
    // A user should only be able to delete himself/herself (based on their token) and not other users
    res.status(403).json({ msg: "You cannot perform this operation" });
  }
});

router.patch("/:id/password", jwtRestrict, async (req, res) => {
  console.log("\nAttempting to update the current user's password...");

  const { id } = req.params;
  let { UserPassword } = req.body;

  console.log("Checking if all required fields were supplied...");
  if (UserPassword) {
    console.log(
      "Checking if the ID request parameter matches the given token..."
    );
    const tokenId = req.decoded.subject;
    if (id === tokenId) {
      try {
        console.log("Checking if current user is recorded in the database...");
        const currentUser = await dbHelper.getUserById(id);
        if (currentUser) {
          console.log("Securing password...");
          UserPassword = bcrypt.hashSync(UserPassword, 12);

          console.log("Performing user password update operation...");
          const updatedUser = await dbHelper.updateUserPassword(
            id,
            UserPassword
          );

          console.log(
            "Checking if current user's password was actually updated..."
          );
          if (updatedUser) {
            res.status(200).json({ msg: "Password was successfully updated." });
          } else {
            // 500 because the current user was supposed to exist before the API call and should be deleted only now
            res.status(500).json({
              msg: "An error occurred in updating the current user's password."
            });
          }
        } else {
          res
            .status(404)
            .json({ msg: "Current user is not recorded in the database." });
        }
      } catch (err) {
        res.status(500).json({ msg: err.toString() });
      }
    } else {
      res.status(403).json({ msg: "You cannot perform this operation" });
    }
  } else {
    res.status(400).json({ msg: "Password was not supplied." });
  }
});

module.exports = router;
