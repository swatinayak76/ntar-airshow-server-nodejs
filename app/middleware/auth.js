const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  //get the token from the header if present
  token = req.headers.authorization
  //if no token found, return response (without going to the next middelware)
  if (!token) {
    ErrorCodeHandler.getErrorJSONData({ 'code': 9, 'res': res, 'data': { isLogin: false } });
    return;
  }

  try {
    //if can verify the token, set req.user and pass to next middleware
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
    req.user = decoded;

    next();
  } catch (ex) {
    //if invalid token
    ErrorCodeHandler.getErrorJSONData({ 'code': 14, 'res': res, 'data': { isLogin: false } });
    return;
  }
};