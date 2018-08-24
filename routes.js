const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
	extended: true
});
var fs = require("fs");
const path = require('path');
const url = require('url');
var request = require('request')

const setup = require('./setup.js');
const users = require('./models/users.js')(setup);

const search_controller = require('./controllers/search.js')
const form_controller = require('./controllers/form.js')
const userman_controller = require('./controllers/userman.js')
const admin_whitelistController = require('./controllers/whitelistcontroller.js')
const admin_usersController = require('./controllers/userman.js')

router.get('/', function (req, res) {
	//console.log(req);
	res.render('index.html', {
		user: req.user
	});
})


router.get('/logout', function (req, res) {
	req.logout();
	res.status(401).redirect(`/`);
});

router.get('/err', function (req, res) {
	res.send(req.body);
});

//search
router.post('/search', urlencodedParser, search_controller.search)
router.get('/search', urlencodedParser, search_controller.getsearch);

//submit
router.post('/thank', urlencodedParser, form_controller.submitted)
router.get('/form', urlencodedParser, form_controller.form);

//whitelist
router.post('/admin/whitelist', admin_whitelistController.store);
router.get('/userman', urlencodedParser, admin_whitelistController.index)
router.post('/admin/whitelist/:whitelistID', admin_whitelistController.revoke);

//User Management
router.post('/admin/user', admin_usersController.setPermission);

//File Management
router.get('/fa.css', function (req, res) {
	fs.readFile('/public/includes/fontawesome/css/all.min.css', function (err, data) {
		res.send(data);
	})
})

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace);
}

//Redirect evepraisal call from clientside javascript to server side, return the result.
router.get('/appraisal.json', function(req, res){
	//Anti-Kahanis measures.
	if (!users.isRoleNumeric(req.user, 0)) {
		res.status(401).send("Not Allowed");
		return;
	}
	var urll = replaceAll(req.url, '\\^','\n')
	console.log(req.url + " || " + urll)
	var options = {
			url: `https://evepraisal.com${urll}`,
			headers: {
				'User-Agent': "Scassany_Maricadie | Project Citrep"
			}
	}
	request.post( options, function(err, response, body){
		if (!err && response.statusCode == 200) {
			//console.log(JSON.parse(body).appraisal)
			res.status(200).send(JSON.parse(body))
	}
	})
	console.log(req.url)

})



router.get('/*.*', function(req, res){
	console.log(`${req.method} ${req.url}`);
	// parse URL
	const parsedUrl = url.parse(req.url);
	// extract URL path
	let pathname = `.${parsedUrl.pathname}`;
	// maps file extention to MIME types
	const mimeType = {
	  '.ico': 'image/x-icon',
	  '.html': 'text/html',
	  '.js': 'text/javascript',
	  '.json': 'application/json',
	  '.css': 'text/css',
	  '.png': 'image/png',
	  '.jpg': 'image/jpeg',
	  '.wav': 'audio/wav',
	  '.mp3': 'audio/mpeg',
	  '.svg': 'image/svg+xml',
	  '.pdf': 'application/pdf',
	  '.doc': 'application/msword',
	  '.eot': 'appliaction/vnd.ms-fontobject',
	  '.ttf': 'aplication/font-sfnt'
	};
	fs.exists(pathname, function (exist) {
	  if(!exist) {
		// if the file is not found, return 404
		res.statusCode = 404;
		res.end(`File ${pathname} not found!`);
		return;
	  }
	  // if is a directory, then look for index.html
	  if (fs.statSync(pathname).isDirectory()) {
		pathname += '/index.html';
	  }
	  // read file from file system
	  fs.readFile(pathname, function(err, data){
		if(err){
		  res.statusCode = 500;
		  res.end(`Error getting the file: ${err}.`);
		} else {
		  // based on the URL path, extract the file extention. e.g. .js, .doc, ...
		  const ext = path.parse(pathname).ext;
		  // if the file is found, set Content-type and send data
		  res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
		  res.end(data);
		}
	  });
	});
	
})

//Search
router.post('/citadel/:citadelid', search_controller.getDetails);
router.post('/update', search_controller.updateCitadel);

module.exports = router;