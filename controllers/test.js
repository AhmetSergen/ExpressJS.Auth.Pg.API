// Controllers: The layer responsible for business like handling requests, performing operations by interacting with the model, and sending responses back to the client.
// Test controller for simple generate and check access token functions. Unnecessary for live production  

const jwt = require("jsonwebtoken");

const generateTestToken = async (req, res) => {
  const accessToken = jwt.sign(
    {
      email: "testToken@testToken.com",
    },
    process.env.SECRET_ACCESS_TOKEN,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );

  res.send(accessToken);
};

const checkTestToken = async (req, res) => {
  try {
    /*
    You may write some testing codes here
    */

    res.status(200).json({success: {status: 200, message: 'TOKEN_CHECK_SUCCESS'}});
  } catch (err) {
    res.send(err);
  }
};

module.exports = {
  generateTestToken, 
  checkTestToken
};
