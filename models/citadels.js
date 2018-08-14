const setup = require('../setup.js');
const cache = require('../cache.js')(setup);
const esi = require('eve-swagger');

const db = require('../dbHandler.js').db.collection('citadels');
const log = require('../logger.js')(module);

const day = 86400; //Day in seconds


module.exports = function (setup) {


    module.generateNewCitadel = function (citadelobject, characterDetails, cb) {

        //console.log(characterDetails)
        var newCitadelTemplate = {
            citname: citadelobject.citname,
            type: citadelobject.type,
            alliance: citadelobject.alliance,
            corp: citadelobject.corp,
            region: citadelobject.region,
            constellation: citadelobject.constellation,
            system: citadelobject.system,
            power: citadelobject.power,
            moondata: citadelobject.moondata,
            fit: citadelobject.fit,
            vulnerability: {
                day: citadelobject.vulnday,
                hour: citadelobject.vulnhour,
            },
            lastSubmittedDate: new Date(),
            submitters: [characterDetails.characterID]
        };
        db.insert(newCitadelTemplate, function (err, result) {
            if (err) log.error("generateNewCitadel: Error for db.insert", {
                err,
                name: citadelobject.citname
            });
            cb(newCitadelTemplate);
        });

    }

    module.getCitadel = function(id){
        db.find({
            '_id': ObjectId(id)
        }).toArray(function (err, docs) {
            if (err) log.error("findAndReturnUser: Error for db.find.toArray", {
                err,
                id
            });
            if (docs.length === 0) {
                return false;
            } else {
                return docs[0]
            }
        });
    }

    module.findCitadel = function(name, type, system, cb){
        db.findOne({'citname': name,
        'type': type,
        'system': system}, function(err, result){
            //console.log(result)
            if(result === undefined){
                cb(false)
            } else {
                cb(result)
            }
        })
        
    }

    return module;
}