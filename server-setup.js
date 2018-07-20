exports.oauth = {
	clientID: "47ab6cf4c9b34c1eba63d5284554fd3f",
	secretKey: "qcAU5X0wcluoJfouDYFmJOsk2vBWGRc9kbXvZUcg",
	callbackURL: "http://scassany.space/auth/provider/callback",
	scopes: ['publicData'],
	userAgent: 'project-citrep',
	baseSSOUrl: "login.eveonline.com"
};

exports.data = {
	mongoDbURL: "mongoDB://127.0.0.1:7797",
	mongoDbName: "eve-goons-waitlist",
	directory: "data", //Where data will be stored
	sessionSecret: "yeet"
};
exports.settings = {
	port: 7798
}