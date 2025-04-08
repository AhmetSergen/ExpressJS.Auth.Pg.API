const rateLimit = require("express-rate-limit");

const rateLimiter = (limit, timeFrameInMinutes) => {
  return rateLimit({
    max: limit,
    windowMs: timeFrameInMinutes * 60 * 1000,
    message: {
      error: {
        status: 429,
        message: "TOO_MANY_REQUESTS",
        expiry: timeFrameInMinutes,
      },
    },
  });
};

module.exports = rateLimiter;
