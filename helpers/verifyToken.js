// This middleware gets Authorization token in request header and checks if it is valid

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    console.log("# verifyToken");
    try {
        const accessToken = req.header('Authorization').split(' ')[1]; // Split "Bearer ey..." auth string and take second index.

        console.log("# token: ", accessToken);
        if(accessToken) {
            try{
                req.user = jwt.verify(accessToken, process.env.SECRET_ACCESS_TOKEN); // try to verify token
                req.accessToken = accessToken;
                next();
            } catch (err) {
                res.status(401).json({error: {status: 401, message: "INVALID_TOKEN"}});
            }
        } else {
            res.status(400).json({error: {status: 400, message: "ACCESS_DENIED"}});
        }
    } catch (err) {
        res.status(400).json({error: {status: 400, message: "ACCESS_DENIED"}});
    }
}

module.exports = verifyToken;