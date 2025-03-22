// ExpressJS.Auth.Pg.API - MRC (Model Route Controller)
const express = require("express");
const app = express();
const sequelize = require('./config/database');
const port = process.env.PORT;

// Routes
const authRoutes = require("./routes/auth");

// adds middleware that parses incoming requests with JSON payloads
app.use(express.json());

// Declare api category endpoints
app.use("/api/auth", authRoutes);

app.listen(port, () => console.log('Server running on port', port));

// TODO: test: create test user using connection
// detects parameters in .env file
const User = require('./models/user.model');
(async () => {
  try {
    const newUser = await User.create({
      email: 'test3@example.com',
      password: 'hashedpassword123',
    });
    console.log('User created:', newUser.toJSON());
  } catch (error) {
    console.error('Error creating user:', error);
  }
})();



// Use PostgreSQL connection string as connection uri to create a connection to mongoDB
// sequelize.sync({ force: true }).then(() => {
//     console.log('Database synced');
//   });


// mongoose
//   .connect(
//     `${process.env.DB_PROTOCOL}://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?${process.env.DB_PARAMS}`
//   )
//   .then(() => {
//     app.listen(port, () => {
//       console.log("API listening to https://localhost:" + port);
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// process.on("SIGINT", () => {
//   mongoose.connection.close(() => {
//     console.log("Mongoose disconnected on app termination.");
//     process.exit(0);
//   });
// });
