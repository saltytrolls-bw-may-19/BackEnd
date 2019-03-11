const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY || "JWT", (err, decoded) => {
      if (err) {
        res.status(401).json({msg: "Unauthorized access"});
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(401).json({msg: "Unauthorized access"});
  }
};
