const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
	extended: true
});
var fs = require("fs");

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

//Search
router.post('/citadel/:citadelid', search_controller.getDetails);
router.post('/update', search_controller.updateCitadel);

module.exports = router;