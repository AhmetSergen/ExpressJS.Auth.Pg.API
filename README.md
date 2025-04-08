# ExpressJS.Auth.Pg.API

This is a boilerplate project for running Authorization API with ExpressJS.
You need PostgreSQL installed to run project. Required DB queries to initialize DB tables can be found in db_create_table_queries.sql file. 
Mailtrap is used for SMTP mail service. Update .env file according to your connection string
For request examples check rest-client.http file. 

You may open/close logging SQL queries on console log in database.js file via changing logging: property. 

**!!! Change SECRET_ACCESS_TOKEN and SECRET_REFRESH_TOKEN when deploying production.**

Run stated commands in command terminal inside project folder to intialize, build and run the project: 

## Start Project

Start Project by running one of the methods listed below: 

### Install Dependencies
*That reads package.json and installs all required packages (dependencies) into the node_modules folder.*

    npm install

### Run by npm script
*Runs the command script for defined property in package.json*

    npm run start

### Start server without script

    node server.js

### Start server without script (with nodemon)
*nodemon is a tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected.*

    nodemon server.js

### Start server by default 
*This runs a predefined command specified in the "start" property of a package's "scripts" object. If the "scripts" object does not define a "start" property, npm will run "node server.js".*

    npm start


## Installed Deps

Installed dependecy packages and descriptions are listed below: 

### Initialize node project
*Initialized node package manager. Create a package.json file.*

    npm init -y

### Install express:
*Express.js is a minimal and flexible Node.js web application framework that provides a list of features for building web and mobile applications easily. It simplifies the development of server-side applications by offering an easy-to-use API for routing, middleware, and HTTP utilities.*

    npm install express --save

### Install npm nodemon (node monitor package)
*Nodemon is a tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected.*

    npm i nodemon --save-dev

### Env package
*Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env*

    npm install dotenv

### Install Sequelize for postgresql
*Sequelize is a modern TypeScript and Node.js ORM for Oracle, Postgres, MySQL, MariaDB, SQLite and SQL Server, and more. Featuring solid transaction support, relations, eager and lazy loading, read replication and more.*

    npm install sequelize pg pg-hstore dotenv

### Express Rate Limit
*Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset.*

    npm i express-rate-limit

### Install jwt
*An implementation of JSON Web Tokens. Used for generating and verifying tokens.*

    npm i jsonwebtoken

### Install joi
*Schema description language and data validator for JavaScript.*

    npm i joi --save

### Install bcrypt
*bcrypt is a popular npm package used for password hashing. It utilizes the bcrypt hashing algorithm, which is designed to be slow and computationally intensive, making it resistant to brute-force attacks even with the increasing computational power of modern hardware.*

    npm i bcrypt --save

### Install uuid
*For the creation of RFC9562 (formerly RFC4122) UUIDs (Universally Unique Identifier)*

    npm i uuid --save

### Install nodemailer for smtp
*Nodemailer is a module for Node.js applications that allows easy email sending.*

    npm i nodemailer

### Install moment.js
*A JavaScript date library for parsing, validating, manipulating, and formatting dates.*

    npm i moment