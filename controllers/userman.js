var setup = require('../setup.js');
var whitelist = require('../models/whitelist.js')(setup);
var esi = require('eve-swagger');
const users = require('../models/users.js')(setup);


/*
 * Give a user Permissions
 * @params req{}
 * @return res{}
 */
exports.setPermission = function (req, res) {
    if (!users.isRoleNumeric(req.user, 5)) {
        //TODO: Flash some info telling the user they aren't allowed to hit this
        res.status(403).redirect('/');
        return;
    }

    esi.characters.search.strict(req.body.pilotname).then(function (results) {
        users.findAndReturnUser(Number(results[0]), function (targetUser) {
            if (!targetUser) {
                //TODO: Flash some info saying we couldn't find that user
                res.status(400).redirect('/userman');
                return;
            }

            //Make sure an admin isn't trying to change their permission
            if (req.user.characterID == targetUser.characterID) {
                //TODO: Flash some info telling a user they can't change their own rank
                res.status(409).redirect('/userman');
                return;
            }

            //Change their permission
            users.setPermission(targetUser.characterID, req.body.roleselect, function (resCode) {
                res.status(resCode).redirect('/userman');
            })
        })
    }).catch(function (err) {
        log.error("controller/Users.js - setPermission: esi pilot search: ", {
            "target user": req.body.pilotname,
            "error": err
        });
        //TODO: Flash some info saying we can't find the user
        res.status(400).redirect('/userman');
    })
}