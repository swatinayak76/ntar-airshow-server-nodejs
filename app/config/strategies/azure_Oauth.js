'use strict';

const passport = require("passport");
const oauth = require('./config');

const BearerStrategy = require('passport-azure-ad').BearerStrategy;
module.exports = function () {

    const options = {
        identityMetadata: `https://${oauth.metadata.authority}/${oauth.credentials.tenantID}/${oauth.metadata.version}/${oauth.metadata.discovery}`,
        issuer: `https://${oauth.metadata.authority}/${oauth.credentials.tenantID}/${oauth.metadata.version}`,
        clientID: oauth.credentials.clientID,
        audience: oauth.credentials.audience,
        validateIssuer: oauth.settings.validateIssuer,
        passReqToCallback: oauth.settings.passReqToCallback,
        loggingLevel: oauth.settings.loggingLevel
        //scope: config.resource.scope
    };

    const bearerStrategy = new BearerStrategy(options, (token, done) => {
        // Send user info using the second argument
        done(null, {}, token);
    }
    );


    passport.use(bearerStrategy);
}