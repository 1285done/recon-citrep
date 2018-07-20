
var universeapi = require('../eveapi.js').universeapi;
var esi = require('../eveapi.js').eveswagger;
const setup = require('../setup.js');
const users = require('../models/users.js')(setup);
const citadels = require('../models/citadels.js')(setup);
var _ = require('lodash');

exports.form = function (req, res) {
	res.render("form.html", {
		report: true,
		user: req.user
	});
};


exports.submitted = function (req, res) {
	//Send request to database, also, use ESI to get info on inputted data (ex, Goonswarm Federation -> Alliance ID)
	var reply = "";
	var CitadelObject = {};
	citadels.findCitadel(req.body.citname, req.body.type, req.body.system, function(result){
	if (!result) {
		reply = "Thank you for submitting this citadel.";
		esi.solarSystems.search(req.body.system).then(result => {
			//System Name -> System ID
			console.log(result);
			//Switch to swagger API because eve-swagger is using out-of-date endpoints.
			universeapi.getUniverseSystemsSystemId(result[0], '', function (err, data, res1) {
				//System ID -> Constellation ID
				console.log(data.constellation_id);
				universeapi.getUniverseConstellationsConstellationId(data.constellation_id, '', function (err, data2, res2) {
					//Constellation ID -> Region ID + Constellation Name
					console.log(data2.name);
					console.log(data2.region_id);
					universeapi.getUniverseRegionsRegionId(data2.region_id, '', function (err, data3, res3) {
						//Region ID -> Region Name
						console.log(data3.name);
						CitadelObject.region = data3.name;
						CitadelObject.constellation = data2.name;
						CitadelObject.system = data.name.toUpperCase();
						CitadelObject.type = req.body.type;
						CitadelObject.citname = req.body.citname;
						CitadelObject.corp = req.body.corp;
						CitadelObject.alliance = req.body.alliance;
						CitadelObject.power = req.body.power;
						CitadelObject.fit = req.body.fit;
						CitadelObject.vulnday = req.body.vulnday;
						CitadelObject.vulnhour = req.body.vulnhour;
						CitadelObject.moondata = req.body.moondata;
						submitData(CitadelObject, req.user);
					});
				});
				//console.log(res);
			});
			//esi.solarSystems(result[0]).info().then(result2 => {
			//	console.log(result2);
			//});

		}).catch(error => {
			console.error(error);
		});
	} else {
		if(users.isRoleNumeric(req.user, 4)){
			console.log("//update citadel forcefully")
		}
		//console.log("hi")
		reply = "This citadel has already been reported, please contact scassany maricadie on jabber if you think this is in error."
	}
});

	res.send(reply);

}

function submitData(citadelObject, user) {
	citadels.generateNewCitadel(citadelObject, user, function(){});
	//db.get('citadels').push(citadelObject).write();
}
function foundCitadel(name, type, system){
	
}