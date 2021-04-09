var passport = require('passport');

module.exports = function (req, res, next) {
    passport.authenticate('oauth-bearer', { session: false }, function (err, user, info) {
        if (err || !user) {
            ErrorCodeHandler.getErrorJSONData({ 'code': 400, 'res': res, 'text': err?err:"User UnAuthorized" });
            return;
        }
        req.tokenInfo = info
        req.user = user
        next()
    })(req, res, next);
}