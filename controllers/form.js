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
	citadels.findCitadel(req.body.citname, req.body.type, req.body.system, function (result) {
		if (!result) {
			reply = "Thank you for submitting this citadel.";
			esi.solarSystems.search(req.body.system).then(result => {
				//System Name -> System ID
				//console.log(result);
				//Switch to swagger API because eve-swagger is using out-of-date endpoints.
				universeapi.getUniverseSystemsSystemId(result[0], '', function (err, data, res1) {
					//System ID -> Constellation ID
					//console.log(data.constellation_id);
					universeapi.getUniverseConstellationsConstellationId(data.constellation_id, '', function (err, data2, res2) {
						//Constellation ID -> Region ID + Constellation Name
						//console.log(data2.name);
						//console.log(data2.region_id);
						universeapi.getUniverseRegionsRegionId(data2.region_id, '', function (err, data3, res3) {
							//Region ID -> Region Name
							//console.log(data3.name);
							CitadelObject.region = data3.name;
							CitadelObject.constellation = data2.name;
							CitadelObject.system = data.name.toUpperCase();
							CitadelObject.type = req.body.type;
							CitadelObject.citname = req.body.citname;
							CitadelObject.corp = req.body.corp;
							CitadelObject.alliance = req.body.alliance;
							CitadelObject.power = req.body.power;

							CitadelObject.vulnday = req.body.vulnday;
							CitadelObject.vulnhour = req.body.vulnhour;


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
									//console.log(split)
									CitadelObject.moondata[index] = {
										"ore": split[1],
										"amount": parseFloat(split[2] * 100).toFixed(2)
									}
									console.log(CitadelObject.moondata[index].ore + " : " + CitadelObject.moondata[index].amount)
									index++;

								} else {}
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
		} else {
			if (users.isRoleNumeric(req.user, 4)) {
				console.log("//update citadel forcefully")
			}
			//console.log("hi")
			reply = "This citadel has already been reported, please contact scassany maricadie on jabber if you think this is in error."
		}
	});

	res.send(reply);

}

function submitData(citadelObject, user) {
	citadels.generateNewCitadel(citadelObject, user, function () {});
	//db.get('citadels').push(citadelObject).write();
}

function foundCitadel(name, type, system) {

}