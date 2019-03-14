module.exports = (req, res) => {
  res.status(400).json({errorInfo: "Code 400 - bad request"});
};
