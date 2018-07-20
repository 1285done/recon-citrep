const setup = require('./setup.js');
const oauth = require('./setup.js').oauth;
const passport = require('passport');
const router = require('express').Router();
var Strategy = require('passport-eve').Strategy;
const users = require('./models/users.js')(setup);
/*
 * Passport Strategy
 */
passport.use(new Strategy({
        clientID: oauth.clientID,
        clientSecret: oauth.secretKey,
        callbackURL: oauth.callbackURL,

    },
    function (accessToken, refreshToken, profile, done) {
        users.findOrCreateUser(null, refreshToken, profile, function (user, err) {
            if (user === false) {
                done(err);
            } else {
                done(null, user);
            }
        })
    }
));

/*
 * Begin the SSO Auth Workflow
 */
router.get('/auth/eveonline',
    passport.authenticate('eve_online', {
        scope: oauth.scopes
    }));

/*
 * Callback function, success or failure redirect
 */
router.get('/auth/provider/callback',
    passport.authenticate('eve_online', {
        failureRedirect: '/err'
    }),
    function (req, res) {
        res.redirect('/');
    });

module.exports = router;