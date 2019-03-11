// Create express router
const router = require("express").Router();

// GET request for the root URL
router.get("/", (req, res) => {
  res.send("<h1>SaltyTrolls API</h1>\n<p>Welcome to the SaltyTrolls API!</p>");
});

module.exports = router;
