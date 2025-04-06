// Controllers: The layer responsible for business like handling requests, performing operations by interacting with the model, and sending responses back to the client.

const jwt = require("jsonwebtoken");
const validation = require("../helpers/validation");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const moment = require("moment");
const User = require('../models/user.model'); 
const UserToken = require('../models/user-tokens.model'); 

const register = async (req, res) => {
  try {
    const { error } = validation.registerSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      res.status(400).json({
        status: 400, // Bad Request
        messsage: "INPUT_ERRORS",
        errors: error.details,
        original: error._original,
      });
    } else {
      existingUser = await User.findOne({ where: { email: req.body.email } });

      if (existingUser) {
        res.status(409).json({
          status: 409, // Conflict
          message: "EMAIL_ALREADY_EXISTS",
        });
      }

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      
      // Create new user instance. Returns the inserted user record as object
      const newUser = await User.create({
        email: req.body.email,
        password: hashedPassword,
        emailConfirmed: false,
        emailToken: uuidv4(),
        passwordResetToken: null,
        passwordResetProvisional: null, 
        passwordResetExpiry: null,
      });

      // Generate access token:
      const accessToken = jwt.sign(
        {
          _id: newUser.id,
          email: newUser.email,
        },
        process.env.SECRET_ACCESS_TOKEN,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
      );

      // Generate refresh token:
      const refreshToken = jwt.sign(
        {
          _id: newUser.id,
          email: newUser.email,
        },
        process.env.SECRET_REFRESH_TOKEN,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
      );

      // Assign the refresh token to user with foreign key
      await UserToken.create({
        userId: newUser.id,  // FK to tb_users
        refreshToken: refreshToken,
      });

      // Send Email Confirmation
      await sendEmailConfirmation({
        email: newUser.email,
        emailToken: newUser.emailToken,
      });

      res
        .status(200)
        .header()
        .json({
          success: {
            status: 200, // Success
            message: "REGISTER_SUCCESS",
            accessToken: accessToken, // Access token should be received as a cookie on the front end.
            refreshToken: refreshToken,
            user: {
              id: newUser.id,
              email: newUser.email,
            },
          },
        });
    }
  } catch (err) {
    let errorStatus;
    let errorMessage;

    if (err.keyPattern?.email === 1) {
      errorStatus = 409;
      errorMessage = "EMAIL_ALREADY_EXISTS";
    } else {
      errorStatus = 400;
      errorMessage = err;
    }

    res.status(errorStatus).json({ error: { status: errorStatus, message: errorMessage } });
  }
};

const login = async (req, res) => {
  try {
    console.log("# login");
    const { error } = validation.loginSchema.validate(req.body); // Extract error property from returned object

    if (error) {
      console.log("# error: ", error);
      res.status(400).json({
        status: 400,
        messsage: "INPUT_ERRORS",
        errors: error.details,
        original: error._original,
      });
    } else {
      console.log("# else");
      //const user = await User.findOne({ email: req.body.email }); // old
      const user = await User.findOne({ where: { email: req.body.email } });

      if(!user) {
        res.status(404).json({
          status: 404, // Not Found
          message: "USER_NOT_FOUND",
        });

        return;
      }

      console.log("# user: ", user);
      console.log("# user.id: ", user.id);

      const userTokens = await UserToken.findAll({ where: { id: user.id } });

      console.log("# userTokens: ", userTokens);

      // Check if the email is correct
      if (user) {

        console.log("# if user true");

        // Check if password is correct
        const validatePassword = await bcrypt.compare(
          req.body.password,
          user.password
        );

        console.log("validatePassword: ", validatePassword);

        if (validatePassword) {
          // Generate access & refresh token
          const accessToken = jwt.sign(
            {
              _id: user.id,
              username: user.username,
              email: user.email,
            },
            process.env.SECRET_ACCESS_TOKEN,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
          );

          const refreshToken = jwt.sign(
            {
              _id: user.id,
              username: user.username,
              email: user.email,
            },
            process.env.SECRET_REFRESH_TOKEN,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
          );

          if (await addRefreshToken(user, userTokens, refreshToken)) {
            res.status(200).json({
              success: {
                status: 200,
                message: "LOGIN_SUCCESS",
                accessToken: accessToken,
                refreshToken: refreshToken,
              },
            });
          } else {
            res.status(500).json({
              error: {
                status: 500,
                message: "SERVER_ERROR",
              },
            });
          }
          
        } else {
          res
            .status(403)
            .json({ error: { status: 403, message: "INVALID_PASSWORD" } });
        }
      } else {
        res
          .status(404)
          .json({ error: { status: 404, message: "USER_NOT_FOUND" } });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: { status: 400, message: "BAD_REQUEST" } });
  }
};

const generateAccessToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;

    // Verify if the token is valid - if not, dont authorise, ask to re-authenticate
    try {
      const decodeRefreshToken = jwt.verify(
        refreshToken,
        process.env.SECRET_REFRESH_TOKEN
      );

      console.log("# decodeRefreshToken: ", decodeRefreshToken);

      const user = await User.findOne({ where: { email: decodeRefreshToken.email } });

      // const existingRefreshTokens = user.security.tokens; // Old
      const existingRefreshTokens = await UserToken.findAll({ where: { userId: user.id } });

      console.log("# existingRefreshTokens: ", existingRefreshTokens);

      // Check if refresh token is in document
      if (
        existingRefreshTokens.some(
          (token) => token.refreshToken === refreshToken
        )
      ) {
        // Generate new access token
        const accessToken = jwt.sign(
          {
            _id: user.id,
            email: user.email,
          },
          process.env.SECRET_ACCESS_TOKEN,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        // Send new access token
        res.status(200).json({
          success: {
            status: 200,
            message: "ACCESS_TOKEN_GENERATED",
            accessToken: accessToken,
          },
        });
      } else {
        res
          .status(401)
          .json({ error: { status: 401, message: "INVALID_REFRESH_TOKEN" } });
      }
    } catch (err) {
      res
        .status(401)
        .json({ error: { status: 401, message: "INVALID_REFRESH_TOKEN" } });
    }
  } catch (err) {
    res.status(400).json({ error: { status: 400, message: "BAD_REQUEST" } });
  }
};

const checkAccessToken = async (req, res) => {
  console.log("# checkAccessToken");
  res.status(200).json({
    success: {
      status: 200,
      message: "ACCESS_TOKEN_CONFIRMED",
      accessToken: req.accessToken,
    },
  });
};

const confirmEmailToken = async (req, res) => {
  try {
    const reqEmailToken = req.body.emailToken;

    console.log("# reqEmailToken: ", reqEmailToken);

    if (reqEmailToken !== null) {
      const accessToken = req.header("Authorization").split(" ")[1];
      const decodedAccessToken = jwt.verify(
        accessToken,
        process.env.SECRET_ACCESS_TOKEN
      );

      // Check if user exists
      const user = await User.findOne({ where: { email: decodedAccessToken.email }});

      console.log("# user: ", user.emailToken);

      // Check if email is already confirmed
      if (!user.emailConfirmed) {
        // Check if provided email token matches user's email token
        if (reqEmailToken === user.emailToken) {
          // await User.updateOne( // Old
          //   { email: decodedAccessToken.email },
          //   { $set: { emailConfirmed: true, emailToken: null } }
          // );

          await User.update(
            { 
              emailConfirmed: true, 
              emailToken: null 
            },
            { 
              where: { email: decodedAccessToken.email } 
            }
          );
          res
            .status(200)
            .json({ success: { status: 200, message: "EMAIL_CONFIRMED" } });
        } else {
          res
            .status(401)
            .json({ error: { status: 401, message: "INVALID_EMAIL_TOKEN" } });
        }
      } else {
        res
          .status(200)
          .json({ error: { status: 200, message: "EMAIL_ALREADY_CONFIRMED" } });
      }
    } else {
      res.status(400).json({ error: { status: 400, message: "BAD_REQUEST" } });
    }
  } catch (err) {
    res.status(400).json({ error: { status: 400, message: "BAD_REQUEST" } });
  }
};

const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email }});

    if(!user) { // If email does not belong to any user
      res
      .status(404)
      .json({ error: { status: 404, message: "EMAIL_NOT_FOUND" } });
      return;
    }

    // TODO: eski parola ile teyit et, emaile ait parolayı kullanicidan al ve kontrol et

    if (
      req.body.provisionalPassword.length >= 6 &&
      req.body.provisionalPassword.length <= 255
    ) {
      // Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(
        req.body.provisionalPassword,
        salt
      );

      // Generate new password reset token
      const passwordResetToken = uuidv4();
      const expiresIn = moment().add(10, "m").toISOString();

      console.log("# expiresIn: ", expiresIn);

      // Update user with password token
      await User.update(
        {
          passwordResetToken: passwordResetToken,
          passwordResetProvisional: hashedPassword,
          passwordResetExpiry: expiresIn,
        },
        {
          where: { email: req.body.email },
        }
      );


      // await User.findOneAndUpdate( // Old
      //   { email: req.body.email },
      //   {
      //     $set: {
      //       "security.passwordReset": {
      //         token: passwordResetToken,
      //         provisionalPassword: hashedPassword,
      //         expiry: expiresIn,
      //       },
      //     },
      //   }
      // );



      await sendPasswordResetConfirmation({
        email: req.body.email,
        passwordResetToken: passwordResetToken,
      });

      res.status(200).json({
        success: { status: 200, message: "PASSWORD_RESET_EMAIL_SENT" },
      });

    } else {
      res
        .status(400)
        .json({ error: { status: 400, message: "PASSWORD_INPUT_ERROR" } });
    }
  } catch (err) {
    res.status(400).json({ error: { status: 400, message: "BAD_REQUEST", messageDetail: err} });
  }
};

const resetPasswordConfirm = async (req, res) => {
  console.log("# enter");
  try {
    console.log("# try");

    const user = await User.findOne({ where: { email: req.body.email }});
    //console.log("user:", user);
    console.log("# log2");
    console.log("# user.passwordResetToken",user.passwordResetToken);
    console.log("# req.body.passwordResetToken", req.body.passwordResetToken);


    // Check if supplied passwordResetToken matches with the user's stored one
    if (user.passwordResetToken === req.body.passwordResetToken) {
      console.log("# MATCHED");
      //console.log("# user",user);
      console.log("# user.passwordResetExpiry",user.passwordResetExpiry);
      console.log("# new date", new Date());
      console.log("# new Date(user.passwordResetExpiry)", new Date(user.passwordResetExpiry));
      console.log("# user.passwordResetExpiry", user.passwordResetExpiry);


      // Check if password reset token is expired
      if (new Date() <= new Date(user.passwordResetExpiry)) {
        console.log("# log3");

        await User.update(
          {
            password: user.passwordResetProvisional, // New password
            passwordResetToken: null,
            passwordResetProvisional: null,
            passwordResetExpiry: null,
          },
          { where: { email: req.body.email}, }
        );

        
        // await User.update( // Old
        //   { email: req.body.email },
        //   {
        //     $set: {
        //       password: user.security.passwordReset.provisionalPassword,
        //       "security.passwordReset.token": null,
        //       "security.passwordReset.provisionalPassword": null,
        //       "security.passwordReset.expiry": null,
        //     },
        //   }
        // );

        res.status(200).json({
          success: { status: 200, message: "PASSWORD_RESET_SUCCESS" },
        });
      } else { // Password reset token is expired
        console.log("# Expired");

        await User.updateOne( // TODO: çevir
          {
            passwordResetToken: null,
            passwordResetProvisional: null,
            passwordResetExpiry: null,
          },
          { where: {email: req.body.email}, }
        );


        // await User.updateOne( // Old
        //   { email: req.body.email },
        //   {
        //     $set: {
        //       "security.passwordReset.token": null,
        //       "security.passwordReset.provisionalPassword": null,
        //       "security.passwordReset.expiry": null,
        //     },
        //   }
        // );

        res
          .status(401)
          .json({
            error: { status: 401, message: "PASSWORD_RESET_TOKEN_EXPIRED" },
          });
      }
    } else {
      res
      .status(401)
      .json({
        error: { status: 401, message: "INVALID_PASSWORD_RESET_TOKEN" },
      });
    }
  } catch (err) {
    res.status(400).json({ error: { status: 400, message: "BAD_REQUEST", messageDetail: err } });
  }
};


const changeEmail = async (req, res) => {
  try {
    console.log("# changeEmail");
    if (validation.registerSchema.validate({email: req.body.provisionalEmail})) {
      console.log("# valid");

      // Decode Access Token
      const accessToken = req.header('Authorization').split(' ')[1];
      const decodedAccessToken = jwt.verify(accessToken, process.env.SECRET_ACCESS_TOKEN);

      console.log("# accessToken: ", accessToken);
      console.log("# decodedAccessToken: ", decodedAccessToken);

      // Check if email exists
      const provisionalEmailExists = await User.findOne({ where: {email: req.body.provisionalEmail}, attributes: ['id']});

      
      if (!provisionalEmailExists) {
        // Generate an email confirmation token
        const changeEmailToken = uuidv4();
        const changeEmailExpiry = moment().add(10, 'm').toISOString(); // Adds to UTC time // TODO: .env dosyasindan al

        console.log("# changeEmailExpiry: ", changeEmailExpiry);

        const [updatedCount, updatedRows] = await User.update(
          {
            changeEmailToken: changeEmailToken,
            changeEmailProvisional: req.body.provisionalEmail,
            changeEmailExpiry: changeEmailExpiry,
          },
          {
            where: { email: decodedAccessToken.email },
            returning: true, // Returns updated rows (PostgreSQL only)
          }
        );

        const updatedUser = updatedRows[0]; // this will be your updated user

        console.log("# update completed-UpdatedUser: ");

        // // Update user with change email token
        // const user = await User.findOneAndUpdate({email: decodedAccessToken.email}, { // Old
        //   $set: {
        //     'security.changeEmail': {
        //       token: changeEmailToken,
        //       provisionalEmail: req.body.provisionalEmail,
        //       expiry: expiresIn,
        //     },
        //   },
        // });

        //await changeEmailConfirmation({email: user.email, emailToken: changeEmailToken});

        await sendChangeEmailConfirmation(updatedUser);

        res.status(200).json({success: {status: 200, message: 'CHANGE_EMAIL_CONFIRMATION_SENT'}});
      } else {
        res.status(409).json({error: {status: 409, message: 'EMAIL_ALREADY_EXISTS'}});
      }
    } else {
      res.status(400).json({error: {status: 400, message: 'EMAIL_VALIDATION_ERROR'}});
    }
  } catch (err) {
    res.status(400).json({error: {status: 400, message: 'BAD_REQUEST'}});
  }
};


const changeEmailConfirm = async (req, res) => {
  console.log("# changeEmailConfirm");
  try {
    // Decode Access Token
    const accessToken = req.header('Authorization').split(' ')[1];
    const decodedAccessToken = jwt.verify(accessToken, process.env.SECRET_ACCESS_TOKEN);

    // Fetch user
    const user = await User.findOne({ where: {email: decodedAccessToken.email}});

    // Check if the email exists
    const emailExistsCheck = await User.findOne({ where: {email: user.changeEmailProvisional}});

    if (!emailExistsCheck) {
      if (user.changeEmailToken === req.body.changeEmailToken) {

        // Check if the change email token is not expired
        if (new Date() <= new Date(user.changeEmailExpiry)) {

          await User.update(
            {
              email: user.changeEmailProvisional,
              changeEmailToken: null,
              changeEmailProvisional: null,
              changeEmailExpiry: null,
            },
            { where: {email: decodedAccessToken.email}},
          );

          // await User.updateOne({email: decodedAccessToken.email}, { // Old
          //   $set: {
          //     'email': user.security.changeEmail.provisionalEmail,
          //     'security.changeEmail.token': null,
          //     'security.changeEmail.provisionalEmail': null,
          //     'security.changeEmail.expiry': null,
          //   },
          // });
          res.status(200).json({success: {status: 200, message: 'CHANGE_EMAIL_SUCCESS'}});
        } else {
          res.status(401).json({success: {status: 401, message: 'CHANGE_EMAIL_TOKEN_EXPIRED'}});
        }
      } else {
        res.status(401).json({success: {status: 401, message: 'INVALID_CHANGE_EMAIL_TOKEN'}});
      }
    } else { // Provisional email already exists. Abort email change process

      await User.update(
        {
          changeEmailToken: null,
          changeEmailProvisional: null,
          changeEmailExpiry: null,
        },
        { where: {email: decodedAccessToken.email}}
      );

      // await User.updateOne({email: decodedAccessToken.email}, { // Old
      //   $set: {
      //     'security.changeEmail.token': null,
      //     'security.changeEmail.provisionalEmail': null,
      //     'security.changeEmail.expiry': null,
      //   },
      // });

      res.status(409).json({error: {status: 409, message: 'PROVISIONAL_EMAIL_ALREADY_EXISTS'}});
    }
  } catch (err) {
    res.status(400).json({error: {status: 400, message: 'BAD_REQUEST'}});
  }
};

const addRefreshToken = async (user, userTokens, refreshToken) => {
  // Add new refresh token to tokens table. Existing refresh token count is limited.
  try {
    console.log("# addRefreshToken BEGIN");

    // const existingRefreshTokens = user.security.tokens; // old
    const existingRefreshTokens = userTokens;

    console.log("# existingRefreshTokens:", existingRefreshTokens);
    console.log("# existingRefreshTokens.length:", existingRefreshTokens.length);

    // Check if theres less than 5 (limit can be changed)
    if (existingRefreshTokens.length < process.env.REFRESH_TOKEN_STORAGE_COUNT) {
      console.log("# existingRefreshTokens.length < 5 BEGIN")

      // Push the new token
      // await User.updateOne( // Old
      //   { email: user.email },
      //   {
      //     $push: {
      //       "security.tokens": {
      //         refreshToken: refreshToken,
      //         createdAt: new Date(),
      //       },
      //     },
      //   }
      // );

      // Push the new token
      await UserToken.create({
        userId: user.id,  // Foreign key reference to `tb_users`
        refreshToken: refreshToken,
      });

      console.log("# UserToken create complete");

    } else { // Otherwise remove the last token 
      // Find the oldest token (ordered by created_at ASC)
      const oldestToken = await UserToken.findOne({
        where: { userId: user.id },
        order: [['created_at', 'ASC']], // Order by oldest first
      });

      console.log("# oldestToken:", oldestToken);
      
      // Remove oldest token for this user
      await UserToken.destroy({
        where: { id: oldestToken.id },
      });

      // Push the new token
      await UserToken.create({
        userId: user.id,  // Foreign key reference to `tb_users`
        refreshToken: refreshToken,
      });

      // // Otherwise remove the last token
      // await User.updateOne(
      //   { email: user.email },
      //   {
      //     $pull: {
      //       "security.tokens": {
      //         _id: existingRefreshTokens[0]._id,
      //       },
      //     },
      //   }
      // );


      // // Push the new token
      // await User.updateOne( // Old
      //   { email: user.email },
      //   {
      //     $push: {
      //       "security.tokens": {
      //         refreshToken: refreshToken,
      //         createdAt: new Date(),
      //       },
      //     },
      //   }
      // );


    }
    return true;
  } catch (err) {
    return false;
  }
};

const sendEmailConfirmation = async (user) => {
  var transport = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const info = await transport.sendMail({
    from: process.env.FROM_MAIL,
    to: user.email,
    subject: "Confirm Your Email",
    text: `Click the link to confirm your email: http://localhost:9000/confirm-email/${user.emailToken}`,
  });
};

const sendPasswordResetConfirmation = async (user) => {
  var transport = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const info = await transport.sendMail({
    from: process.env.FROM_MAIL,
    to: user.email,
    subject: "Reset Your Password",
    text: `Click the link to confirm your password reset: http://localhost:9000/confirm-password/${user.passwordResetToken}`,
  });
};

const sendChangeEmailConfirmation = async (user) => { // TODO: direkt user degil de ToEmail ve token al
  console.log("# sendChangeEmailConfirmation");
  var transport = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  console.log("# transport:");

  const info = await transport.sendMail({
    from: process.env.FROM_MAIL, // TODO: froım maili .env den al
    to: user.email,
    subject: "Change Your Email",
    text: `Click the link to confirm your email change: http://localhost:9000/confirm-change-email/${user.changeEmailToken}`,
  });

  console.log("# info:", info);
};

module.exports = {
  register,
  login,
  generateAccessToken,
  checkAccessToken,
  confirmEmailToken,
  resetPassword,
  resetPasswordConfirm,
  changeEmail,
  changeEmailConfirm
};
