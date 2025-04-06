# ExpressJS.Auth.Pg.API

You need PostgreSQL installed to run project.
Start Project by running one of the methods listed below.
Mailtrap is used for SMTP mail service.
For quick request examples rest-client.http file could be used.

!!! Change SECRET_ACCESS_TOKEN and SECRET_REFRESH_TOKEN when deploying production

## Start Project

### Run by npm script
npm run prod
npm run dev

### start server without script:
node server.js

### start server with nodemon(without script):
nodemon server.js

### start server (with script):
npm start


## Installed Deps

### initialize node project
npm init -y

### install express:
npm install express --save

### install npm nodemon (node monitor package)
npm i nodemon --save-dev

### env package
npm install dotenv

### install Sequelize for postgresql
npm install sequelize pg pg-hstore dotenv

### Express Rate Limit
npm i express-rate-limit

### install jwt
npm i jsonwebtoken

### install joi
npm i joi --save

### install bcrypt
npm i bcrypt --save

### install uuid
npm i uuid --save

### install nodemailer for smtp
npm i nodemailer

### install moment.js
npm i moment