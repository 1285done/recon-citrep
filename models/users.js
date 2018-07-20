const setup = require('../setup.js');
const cache = require('../cache.js')(setup);
const esi = require('eve-swagger');
const db = require('../dbHandler.js').db.collection('users');
const log = require('../logger.js')(module);
const day = 86400; //Day in seconds

module.exports = function (setup) {
    var module = {};

    //Create and manage users
    module.findOrCreateUser = function (users, refreshToken, characterDetails, cb) {
        //Update the users refresh token
        if (refreshToken) {
            console.log(characterDetails)
            db.updateOne({
                characterID: characterDetails.characterID
            }, {
                $set: {
                    refreshToken: refreshToken
                }
            }, function (err, result) {
                console.info("users.findOrCreateUser: Updating refreshToken for " + characterDetails.characterName);
            })
        } //Check if the user exists
        module.findAndReturnUser(characterDetails.characterID, function (userProfile) {
            //We found the user, return it back to the callback
            if (userProfile) {
                cb(userProfile);
            } else {
                log.info(`Creating a new user for ${characterDetails.characterName}.`);
                module.generateNewUser(refreshToken, characterDetails, function (userProfile, err) {
                    cb(userProfile, err);
                });
            }
        });
    };

    module.findAndReturnUser = function (checkID, cb) {
        //console.log(checkID);
        db.find({
            'characterID': Number(checkID)
        }).toArray(function (err, docs) {
            if (err) log.error("findAndReturnUser: Error for db.find.toArray", {
                err,
                checkID
            });
            if (docs.length === 0) {
                cb(false)
            } else {
                cb(docs[0])
            }
        });
    }

    module.getPilotAffiliation = function (id, cb) {
        esi.characters(id).info().then(function (data) {
            var allianceID = data.alliance_id || 0;

            //Get Corporation Info
            cache.get(data.corporation_id, day, function (corporation) {
                var corporation = {
                    "corporationID": corporation.id,
                    "name": corporation.name
                };

                //Return null if pilot isn't in an alliance
                if (allianceID == 0) {
                    cb(null, corporation);
                    return;
                }

                //Get Alliance Info
                cache.get(allianceID, day, function (alliance) {
                    var alliance = {
                        "allianceID": alliance.id,
                        "name": alliance.name
                    };

                    cb(alliance, corporation);
                })
            })
        }).catch(err => {
            log.error("users.getPilotAffiliation: Error for esi.characters.info", {
                err,
                id
            });
        });
    }


    module.generateNewUser = function (refreshToken, characterDetails, cb) {
        module.getPilotAffiliation(characterDetails.characterID, function (alliance, corporation) {
            //console.log(characterDetails)
            var newUserTemplate = {
                characterID: characterDetails.characterID,
                name: characterDetails.characterName,
                alliance: alliance,
                corporation: corporation,
                role: {
                    "numeric": 0,
                    "title": ""
                },
                settings: {},
                refreshToken: refreshToken,
                registrationDate: new Date(),
                userVersion: 1
            };
            db.insert(newUserTemplate, function (err, result) {
                if (err) log.error("generateNewUser: Error for db.insert", {
                    err,
                    name: characterDetails.characterName
                });
                cb(newUserTemplate);
            });
        })
    }



    /*
     * Return an array of linked characters.
     * @params: user{}, (int)
     * @return: bool
     */
    module.isRoleNumeric = function (user, atLeast) {
        return !!user && !!user.role && user.role.numeric >= atLeast;
    }

    /*
     * Change a users permission within mongo
     * @params characterID, permissionInt
     * @return 
     */
    module.setPermission = function (characterID, roleInt, cb) {
        db.updateOne({
            "characterID": characterID
        }, {
            $set: {
                "role.numeric": Number(roleInt),
                "role.title": setup.userPermissions[roleInt]
            }
        }, function (err) {
            if (err) {
                log.error("models/users.js - setPermission: Error updating user", err);
                cb(400);
            } else {
                cb(200);
            }
        });
    }

    /*
     * Return a list of all users with a role
     * higher than the generic user ( > 0)
     * @return [user{}]
     */
    module.getAccessList = function (userList) {
        db.find({
            "role.numeric": {
                $gt: 0
            }
        }).toArray(function (err, docs) {
            if (err) log.error("models.users - getAccessList: ", err);
            userList(docs);
        })
    }

    return module;
}