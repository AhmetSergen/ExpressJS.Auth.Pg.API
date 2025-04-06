// Controllers: The layer responsible for business like handling requests, performing operations by interacting with the model, and sending responses back to the client.
// test controller for simple generate and check access token functions.

const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate token:
const generateTestToken = async (req, res) => {
  const accessToken = jwt.sign(
    {
      email: "test@test.com",
    },
    process.env.SECRET_ACCESS_TOKEN,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );

  res.send(accessToken);
};

// Create a new user
const checkTestToken = async (req, res) => {
  try {
    const newUser = new User({
      email: "newTestUser@test.com",
      password: "test",
      emailConfirmed: false,
      emailToken: "test",
      security: {
        tokens: null,
        passwordReset: null,
      },
    });

    await newUser.save();

    res.send(newUser);
  } catch (err) {
    res.send(err);
  }
};

module.exports = {
  generateTestToken, 
  checkTestToken
};
