// // utils/cookieUtils.js
// const setTokenCookie = (res, token) => {
//   res.cookie("token", token, {
//     httpOnly: true,          // prevents JS access
//     secure: process.env.NODE_ENV === "production", // true on HTTPS
//     sameSite: "None",        // allow cross-site requests
//     maxAge: 24 * 60 * 60 * 1000, // 1 day
//   });
// };

// module.exports = setTokenCookie;

// utils/cookieUtils.js
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 🔒 Only true on HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", 
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};

module.exports = setTokenCookie;
