var fs = require("fs");

//Lowdash for utilities
var _ = require('lodash');
var request = require('request')
function getAllOreReproProducts(options) {
    return new Promise(function (resolve, reject) {
        console.log(options)
        var index = 0;
        var key = [];
        var oreobjects = []
        fs.readFile("./test/moonore.txt", 'utf-8', function (err, data) {
            if(err) console.log(err)
            key = data.split("\r\n")[0].split("\t")
            //console.log(key)
            data.split("\r\n").forEach(function (element) {
                if (!index == 0) {
                    //if (element.split("\t")[1] !== undefined) {
                    var indox = 0;
                    var moonobj = {
                        ore: "",
                        contents: []
                    }
                    var split = element.split("\t")
                    split.forEach(val => {
                        if (key[indox] == -1) {
                            moonobj.ore = val
                        } else {
                            //console.log((options.zerofill || !val == '0') + " vs " + (!(!options.zerofill && val == '0')))
                            if (!(!options.zerofill && val == '0')) {
                                //console.log(options.zerofill || !val == '0')
                                moonobj.contents.push({
                                    mineral: key[indox],
                                    value: val
                                })
                                //console.log(false + "ORE: " + moonobj.ore + " mineral: " + key[indox] + " value: " + val)
                            }

                        }

                        //console.log( + " --- " + val)
                        indox++
                        if (indox == key.length) {
                            indox = 0;
                            //console.log(moonobj)
                            oreobjects.push(moonobj)
                        }

                    })
                    // CitadelObject.moondata[index] = {
                    //     "ore": split[1],
                    //     "amount": parseFloat(split[2]),
                    //     "id": split[3]
                    // }

                }
                index++;
                if (index == data.split("\r\n").length) {
                    resolve(oreobjects)
                    index = 0
                }
                //}
            });
        })
    })
}

exports.getOreValueByIDAndAmount = function(id, amount, options) {
return new Promise(function(parentresolve, parentreject){
    var opt = {
        zerofill: options.zerofill || false
    }

    getAllOreReproProducts(opt).then(function (value) {
        var obj = _.find(value, function (obj) {return obj.ore == id})

        
        var promise2;
        promise1 = new Promise(function(resolve, reject){
            array = []
            //console.log(obj.contents)
            obj.contents.forEach(ob => {
                console.log(ob)
            
            getNameFromID(ob.mineral).then(name => {
                array.push({name: name, amount: ob.value})
                if(array.length == obj.contents.length){
                    console.log(array)
                    resolve(array)
                } 
            })            
        })
        })
        promise1.then(function(data){
            var string = ""
            var ind = 0;
            var smpr = new Promise(function(resolve){
                data.forEach(o => {
                    string += o.name + " " + o.amount*amount + "\n"
                    ind++
                    if(ind == data.length){
                        resolve(string)
                        ind = 0
                    } 
                })
            })
            smpr.then(string => {
                console.log(string)
                var options = {
                    url: `https://evepraisal.com/appraisal.json?market=jita&persist=no&raw_textarea=${string}`,
                    headers: {
                        'User-Agent': "Scassany_Maricadie | Project Citrep"
                    }
                }
                promise2 = new Promise(function (resolve, reject){
                    request.post(options, function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            //console.log(JSON.parse(body).appraisal)
                            //console.log(JSON.parse(body))
                            resolve(JSON.parse(body).appraisal.totals.sell)
                        }else{
                            reject(err)
                        }
            
                    })
                });
                promise2.then(data => {parentresolve(data)}, err => console.log(err))
            })
            
        }, err => console.log(err))
        
        
        //Promise.all([promise2]).then(data => console.log(data))




    })
})
}

function getNameFromID(id){
   return new Promise(function(resolve, reject){
       request.get(`https://esi.evetech.net/latest/universe/types/${id}/?datasource=tranquility&language=en-us`, function(err, res, body){
           resolve(JSON.parse(body).name)
       })
    })
}
// getOreValueByIDAndAmount(45491, 55, {zerofill: false}).then(data => console.log(data))
// getOreValueByIDAndAmount(45492, 33, {
//      zerofill: false
// }).then(data => console.log(data))