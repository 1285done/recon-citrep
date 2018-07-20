const setup = require('../setup.js');
const log = require('../logger.js')(module);
const users = require('../models/users.js')(setup);

module.exports = function (setup) {
	//console.log("A"); 
	var module = {};

	module.refresh = function (req, res, next) {
		//console.log("B"); 
		if (typeof req.session.passport === "undefined" || typeof req.session.passport.user === "undefined") {
			next();
			return;
		}
		users.findAndReturnUser(req.session.passport.user.characterID, function (userData) {
			if (!userData) {
				req.logout();
				res.render("index.html");
				next();
			} else {
				req.session.passport.user = userData;
				req.session.save(function (err) {

					if (err) log.error("updateUserSession: Error for session.save", {
						err,
						'characterID': user.characterID
					});
					next();
				})
			}
		});
	}

	return module;
}