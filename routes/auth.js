// Routes: The layer responsible for defining the endpoints (URLs) of your API and mapping HTTP requests (e.g., GET, POST, PUT, DELETE) to specific controller actions.

const express = require('express');
const authController = require('../controllers/auth');
//const testController = require('../controllers/test');
const router = express.Router(); // router initialization

// API middleware
const rateLimiter = require('../helpers/rateLimiter');
const verifyToken = require('../helpers/verifyToken');

// ROUTES
// router -> URL, middlewares, controller

// [POST] Register
router.post("/register", rateLimiter(5, 10), authController.register);

// [POST] Login
router.post("/login", rateLimiter(5, 10), authController.login);

// [POST] Generate Access Token
router.post("/generateAccessToken", authController.generateAccessToken)

// // [GET] Check Access Token
// router.get("/checkAccessToken", [rateLimiter(5, 10), verifyToken], authController.checkAccessToken)

// // [POST] Confirm Email Token
// router.post("/confirmEmailToken", verifyToken, authController.confirmEmailToken)

// // [POST] Reset Password 
// router.post("/resetPassword", authController.resetPassword)

// // [POST] Reset Password Confirm
// router.post("/resetPasswordConfirm", authController.resetPasswordConfirm)

// // [POST] Change Email
// router.post('/changeEmail', [rateLimiter(5, 10), verifyToken], authController.changeEmail);

// // [POST] Change Email Confirm
// router.post('/changeEmailConfirm', [rateLimiter(5, 10), verifyToken], authController.changeEmailConfirm);

// // Test routes:
// router.post("/generateTestToken", testController.generateTestToken)
// router.get("/checkTestToken", [rateLimiter(5, 10), verifyToken], testController.checkTestToken)

module.exports = router;