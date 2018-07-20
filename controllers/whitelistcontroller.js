var setup = require('../setup.js');
var whitelist = require('../models/whitelist.js')(setup);
var esi = require('eve-swagger');
const users = require('../models/users.js')(setup);

//Render whitelist Page
exports.index = function (req, res) {
    //console.log('test1')
    if (users.isRoleNumeric(req.user, 4)) {
        //console.log('test2')
        whitelist.get(function (activeWhitelist) {
            users.getAccessList(function (elevatedUsers) {
                //Timestamps & sort
                for (let i = 0; i < activeWhitelist.length; i++) {
                    activeWhitelist[i].createdAt = new Date(activeWhitelist[i].createdAt).toDateString();
                }
                activeWhitelist.sort(function (a, b) {
                    if (a.name > b.name) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
                elevatedUsers.sort(function (a, b) {
                    if (a.role.numeric < b.role.numeric) {
                        return 1;
                    } else if (a.role.numeric > b.role.numeric) {
                        return -1;
                    } else {
                        if (a.name > b.name) return 1;
                        return -1;
                    }
                });

                var userProfile = req.user;
                var sideBarSelected = 7;
                //console.log(activeWhitelist)
                res.render('userman.html', {
                    user: userProfile,
                    sideBarSelected,
                    activeWhitelist,
                    elevatedUsers,
                    userman: true
                });
            })
        })
    } else {
        //req.flash("content", {"class":"error", "title":"Not Authorised!", "message":"Only our Senior FC team has access to that page! Think this is an error? Contact a member of leadership."});
        res.status(403).redirect("/");
    }
}

/*
 * Adds an entity to the  whitelist
 * @params req{}
 * @return res{}
 */
exports.store = function (req, res) {
    if (!users.isRoleNumeric(req.user, 5)) {
        //req.flash("content", {"class":"error", "title":"Not Authorised!", "message":"You are not allowed to edit the whitelist. Think this is an error? Contact a member of leadership."});
        res.status(403).redirect('/admin/bans')

    }

    getEntity(req.body.alliance, null, function (entity) {
        if (!!!entity) {
            //req.flash("content", {"class":"error", "title":"Not Found:", "message":"We could not find the " + req.body.type.toLowerCase() + " " + req.body.name + "."});
            res.status(403).redirect('/userman')
            return;
        }

        var data = {
            "id": entity.id,
            "name": entity.name,
            "type": req.body.type,
            "whitelistAdmin": {
                "characterID": req.user.characterID,
                "name": req.user.name
            },
            "createdAt": Date.now(),
            "deletedAt": {}
        }

        whitelist.store(data, function (err) {
            if (!err) {
                //req.flash("content", {"class":"success", "title":"Access Granted:", "message": req.body.name + " has been added to the whitelist."});
                res.status(200).redirect('/userman')
            } else {
                // req.flash("content", {"class":"error", "title":"Woops!", "message": err});
                res.status(400).redirect('/userman');
            }
        })


    })
}

/*
 * Searches ESI for and returns entity
 * @access protected
 * @params name, type
 * @return entity{type, id, name}
 */
function getEntity(name, type, entity) {
    //set false to "Corporation" to allow corps to be whitelisted
    if (type == false) {
        esi.corporations.search.strict(name).then(function (corporationID) {
            if (!!corporationID) {
                entity({
                    "type": "Corporation",
                    "id": corporationID[0],
                    "name": name
                });
                return;
            }

            entity(null);
        })
    } else {
        esi.alliances.search.strict(name).then(function (allianceID) {
            if (!!allianceID) {
                entity({
                    "type": "Alliance",
                    "id": allianceID[0],
                    "name": name
                });
                return;
            }

            entity(null);
        })
    }
}

/*
 * Removes an entity from the whitelist
 * @params req{}
 * @return res{}
 */
exports.revoke = function (req, res) {
    if (!users.isRoleNumeric(req.user, 5)) {
        // req.flash("content", {"class":"error", "title":"Not Authorised!", "message":"You are not allowed to revoke bans. Think this is an error? Contact a member of leadership."});
        res.status(403).redirect('/admin/bans');
    }

    whitelist.revoke(req.params.whitelistID, function (result) {
        if (!result) {
            //   req.flash("content", {"class":"success", "title":"Success!", "message":"We have revoked their access."});
            res.status(200).redirect('/userman');
        } else {
            //   req.flash("content", {"class":"error", "title":"Woops!", "message":"We cannot revoke their access."});
            res.status(400).redirect('/admin/bans');
        }
    })
}