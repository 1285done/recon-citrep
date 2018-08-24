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
	if (!users.isRoleNumeric(req.user, 0)) {
		res.status(401).send("Not Allowed");
		return;
	}

	//Send request to database, also, use ESI to get info on inputted data (ex, Goonswarm Federation -> Alliance ID)	
	citadels.findCitadel(req.body.citname, req.body.type, req.body.system, function (result) {
		if (result) {
			res.status(409).send("Duplicate");
			return;
		}

		esi.solarSystems.search(req.body.system).then(result => {
			//System Name -> System ID
			//Switch to swagger API because eve-swagger is using out-of-date endpoints.
			universeapi.getUniverseSystemsSystemId(result[0], '', function (err, systemObject) {
				//System ID -> Constellation ID
				universeapi.getUniverseConstellationsConstellationId(systemObject.constellation_id, '', function (err, constellationObject) {
					//Constellation ID -> Region ID + Constellation Name
					universeapi.getUniverseRegionsRegionId(constellationObject.region_id, '', function (err, regionObject) {
						//Region ID -> Region Name
						var CitadelObject = {
							"region": regionObject.name,
							"constellation": constellationObject.name,
							"system": systemObject.name.toUpperCase(),
							"type": req.body.type,
							"citname": req.body.citname,
							"corp": req.body.corp,
							"alliance": req.body.alliance,
							"power": req.body.power,
							"vulnday": req.body.vulnday,
							"vulnhour": req.body.vulnhour
						};

						CitadelObject.fit = {
							high: [],
							mid: [],
							low: [],
							rig: [],
							service: []
						};
						//Split data between power slots
						var splitt = req.body.fit.split("\r\n")
						var highs = _.takeWhile(splitt, function (o) {
							return o != "Medium Power Slots"
						})
						splitt = _.drop(splitt, highs.length)
						var mids = _.takeWhile(splitt, function (o) {
							return o != "Low Power Slots"
						})
						splitt = _.drop(splitt, mids.length)
						var lows = _.takeWhile(splitt, function (o) {
							return o != "Rig Slots"
						})
						splitt = _.drop(splitt, lows.length)
						var rigs = _.takeWhile(splitt, function (o) {
							return o != "Service Slots"
						})
						splitt = _.drop(splitt, rigs.length)
						var services = splitt;
						//Drop the label, add to object
						CitadelObject.fit.high = _.drop(highs, 1)
						CitadelObject.fit.mid = _.drop(mids, 1)
						CitadelObject.fit.low = _.drop(lows, 1)
						CitadelObject.fit.rig = _.drop(rigs, 1)
						CitadelObject.fit.service = _.drop(services, 1)




						//TODO: make an array of moongoo/%
						CitadelObject.moondata = []

						var index = 0;
						req.body.moondata.split("\n").forEach(function (element) {

							if (element.split("\t")[1] !== undefined) {
								var split = element.split("\t")


								CitadelObject.moondata[index] = {
									"ore": split[1],
									"amount": parseFloat(split[2]),
									"id": split[3]
								}
								console.log(CitadelObject.moondata[index].ore + " : " + CitadelObject.moondata[index].amount)
								index++;

							}
						});
						//CitadelObject.moondata = req.body.moondata;



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
	});

	res.send(200)

}

function submitData(citadelObject, user) {
	citadels.generateNewCitadel(citadelObject, user, function () {});
	//db.get('citadels').push(citadelObject).write();
}
