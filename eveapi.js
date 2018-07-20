var esi = require('eve-swagger');
var esi2 = esi({
	service: 'https://esi.tech.ccp.is',
	source: 'tranquility',
	agent: 'Scassany Maricadie | eve-swagger-js',
	language: 'en-us',
	timeout: 6000,
	minTime: 0,
	maxConcurrent: 0
});
var swagger = require('eve_swagger_interface')

var universeapi = new swagger.UniverseApi();
var characterapi = new swagger.CharacterApi();
var allianceapi = new swagger.AllianceApi();

exports.universeapi = universeapi;
exports.characterapi = characterapi;
exports.allianceapi = allianceapi;
exports.eveswagger = esi;