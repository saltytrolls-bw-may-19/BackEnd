const jwt = require("jsonwebtoken");

module.exports = user => {
  const payload = {
    subject: user.UserID,
    username: user.UserName,
  };
  const secret = process.env.JWT_SECRET_KEY || "JWT";
  const options = {
    expiresIn: "48h"
  };

  return new Promise((res, rej) => {
    const retFunc = (err, token) => (err ? rej(err) : res(token));
    return jwt.sign(payload, secret, options, retFunc);
  });
};
