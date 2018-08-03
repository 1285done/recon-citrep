const setup = require('../setup.js');
const users = require('../models/users.js')(setup);
const citadels = require('../models/citadels.js')(setup);
const db = require('../dbHandler.js').db.collection('citadels');
const ObjectId = require('mongodb').ObjectID;
var _ = require('lodash');

exports.getsearch = function (req, res) {
	if (req.user.role.numeric == 0) {
		res.send(403);
	} else {
		res.render('search.html', {
			search: true,
			user: req.user
		});
	}

}

exports.search = function (req, res) {

	//Remove empty search params
	if (req.body.system == '') {
		delete req.body.system
	}
	if (req.body.type == 'All') {
		delete req.body.type;
	}
	if (req.body.citname == '') {
		delete req.body.citname;
	}
	if (req.body.corp == '') {
		delete req.body.corp;
	}
	if (req.body.alliance == '') {
		delete req.body.alliance;
	}
	if (req.body.power == 'Any') {
		delete req.body.power;
	}
	if (req.body.fit == '') {
		delete req.body.fit;
	}
	if (req.body.moondata == 'Any') {
		delete req.body.moondata;
	}
	if (req.body.vulnday == '') {
		delete req.body.vulnday;
	}
	if (req.body.vulnhourmin == '') {
		delete req.body.vulnhourmin;
	}
	if (req.body.vulnhourmax == ''){
		delete req.body.vulnhourmax;
	}
	if (req.body.region == '') {
		delete req.body.region;
	}
	if (req.body.constellation == '') {
		delete req.body.constellation;
	}


	//console.log(lowdb.get('citadels').value());

	
	db.find({}).toArray(function(err, results){
		//console.log(req.body)
		
	
	
	//Implement partial search
	//Filter name (if exists)
	if (req.body.hasOwnProperty('citname')) {
		console.log('filtering name');
		var removed = _.remove(results, function (value, index) {
			if (!_.includes(value.citname.toUpperCase(), req.body.citname.toUpperCase())) return true;
		});
	}
	//Filter type (if exists)
	if (req.body.hasOwnProperty('type')) {
		console.log('filtering type');
		var removed = _.remove(results, function (value, index) {
			if (!_.isEqual(value.type, req.body.type)) return true;
		});
	}
	if (req.body.hasOwnProperty('system')) {
		console.log('filtering system');
		var removed = _.remove(results, function (value, index) {
			if (!_.includes(value.system.toUpperCase(), req.body.system.toUpperCase())) return true;
		});
	}
	if (req.body.hasOwnProperty('corp')) {
		console.log('filtering corp');
		var removed = _.remove(results, function (value, index) {
			if (!_.includes(value.corp.toUpperCase(), req.body.corp.toUpperCase())) return true;
		});
	}
	if (req.body.hasOwnProperty('alliance')) {
		console.log('filtering alliance');
		var removed = _.remove(results, function (value, index) {
			if (!_.includes(value.alliance.toUpperCase(), req.body.alliance.toUpperCase())) return true;
		});
	}
	if (req.body.hasOwnProperty('moondata')) {
		console.log('filtering moondata');
		var removed = _.remove(results, function (value, index) {
			if (!_.isEqual(value.moondata, req.body.moondata)) return true;
		});
	}
	if (req.body.hasOwnProperty('power')) {
		console.log('filtering power');
		var removed = _.remove(results, function (value, index) {
			if (!_.isEqual(value.power, req.body.power)) return true;
		});
	}
	if (req.body.hasOwnProperty('fit')) {
		console.log('filtering fit');
		var removed = _.remove(results, function (value, index) {
			if (!_.includes(value.fit.toUpperCase(), req.body.fit.toUpperCase())) return true;
		});
	}
	if (req.body.hasOwnProperty('vulnday')) {
		console.log('filtering vulnday');
		var removed = _.remove(results, function (value, index) {
			if (!_.includes(value.vulnday.toUpperCase(), req.body.vulnday.toUpperCase())) return true;
		});
	}
	if (req.body.hasOwnProperty('vulnhourmin') || req.body.hasOwnProperty('vulnhourmax')) {
		var removed = _.remove(results, function (value, index) {
			console.log(value.vulnhour);
			if(value.vulnhour < req.body.vulnhourmin || value.vulnhour > req.body.vulnhourmax || value.vulnhour == undefined) return true;
			//if (!_.includes(value.vulnhour.toUpperCase(), req.body.vulnhour.toUpperCase())) return true;
		});
	}
	if (req.body.hasOwnProperty('region')) {
		console.log('filtering region');
		var removed = _.remove(results, function (value, index) {
			if (!_.includes(value.region.toUpperCase(), req.body.region.toUpperCase())) return true;
		});
	}
	if (req.body.hasOwnProperty('constellation')) {
		console.log('filtering constellation');
		var removed = _.remove(results, function (value, index) {
			if (!_.includes(value.constellation.toUpperCase(), req.body.constellation.toUpperCase())) return true;
		});
	}
	//console.log(results)
	//Print out the search boxes again, along with the found data.
	res.render('search.html', {
		results: results,
		search: true,
		user: req.user
	});

});

}
exports.getDetails = function(req, res){
	db.findOne({"_id": ObjectId(req.params.citadelid)}, function(err, result){
		if(result === undefined){
			res.send(404)
		}else{
			//console.log(result)
			res.send(result)
		}
	})
	
}

exports.updateCitadel= function(req, res){
	console.log(req.body)
	res.redirect("/search")
}