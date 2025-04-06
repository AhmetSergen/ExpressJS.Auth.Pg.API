# ExpressJS.Auth.Pg.API

This is a boilerplate project for running Authorization API with ExpressJS.
You need PostgreSQL installed to run project. Required DB queries to initialize DB tables are stored in db_create_table_queries.sql file. 
Mailtrap is used for SMTP mail service. Update .env file according to your connection string
For request examples check rest-client.http file. 

!!! Change SECRET_ACCESS_TOKEN and SECRET_REFRESH_TOKEN when deploying production
You may open/close logging SQL queries on console log in database.js file via changing logging: property. 

Start Project by running one of the methods listed below: 

## Start Project

### Run by npm script
npm run dev

### Start server without script
node index.js

### Start server without script (with nodemon)
nodemon server.js

### Start server (with script)
npm start


## Installed Deps

### Initialize node project
npm init -y

### Install express:
npm install express --save

### Install npm nodemon (node monitor package)
npm i nodemon --save-dev

### Env package
npm install dotenv

### Install Sequelize for postgresql
npm install sequelize pg pg-hstore dotenv

### Express Rate Limit
npm i express-rate-limit

### Install jwt
npm i jsonwebtoken

### Install joi
npm i joi --save

### Install bcrypt
npm i bcrypt --save

### Install uuid
npm i uuid --save

### Install nodemailer for smtp
npm i nodemailer

### Install moment.js
npm i moment