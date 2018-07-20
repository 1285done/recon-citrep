var http = require("http");

//express
var express = require('express');
var app = express();



var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
	extended: true
});
var fs = require("fs");

//Lowdash for utilities
var _ = require('lodash');

process.on('uncaughtException', function (exception) {
	console.log(exception);
})

//Import ESI APIs
var universeapi = require('./eveapi.js').universeapi;
var esi = require('./eveapi.js').eveswagger;


//Auth Try #2
const setup = require('./setup.js');
const data = setup.data;
const settings = setup.settings;

var citadelThing;

require('./dbHandler').connect(function () {
	const session = require('express-session');
	const mongoStore = require('connect-mongo')(session);
	const cookieParser = require('cookie-parser');
	const oauthListen = require('./sso.js');
	const users = require('./models/users.js')(setup);
	const citadels = require('./models/citadels.js')(setup);
	const passport = require('passport');
	//Extend some stuff
	app.use(session({
		store: new mongoStore({
			db: require('./dbHandler.js').db
		}),
		secret: data.sessionSecret,
		cookie: {
			maxAge: 604800 * 1000
		}, //Week long cookies.
		resave: true,
		saveUninitialized: true
	}))
	app.use(cookieParser());
	app.use(session({
		secret: data.sessionSecret
	}));
	passport.serializeUser(function (user, done) {
		done(null, user);
	});

	passport.deserializeUser(function (user, done) {
		done(null, user);
	});

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(oauthListen);
	app.use('/includes', express.static('public/includes'));
	app.use(require('./middleware/userSession.js')(setup).refresh);
	app.use(require('./middleware/whitelist.js')(setup).check);
	//Templating shit
	var nunjucks = require('nunjucks');

	var routeListen = require('./routes.js');
	app.use(routeListen)
	nunjucks.configure('views', {
		autoescape: true,
		express: app
	});
	app.listen(settings.port, () => console.log('eve-goonscout-bookmarks: accepting connections on socket', settings.port));

});





// Running Server Details.
//var server = app.listen(7798, function () {
//	var host = server.address().address
///	var port = server.address().port
//	console.log("Example app listening at %s:%s Port", host, port)
///});




/*app.get('/search', function (req, res) {
	res.render('search.html', {search: true});
});*/

app.get('/space.jpg', function (req, res) {
	fs.readFile('space.jpg', function (err, data) {
		res.send(data);
	})
});

app.get('/login.png', function (req, res) {
	fs.readFile('login.png', function (err, data) {
		res.send(data);
	})
});


//yeet420