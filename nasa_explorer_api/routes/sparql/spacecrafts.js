var dbpediaSparql = require('dbpedia-sparql-client').default;
var express = require('express');
var SparqlClient = require('sparql-client-2')
var router = express.Router();

var endpoint = 'http://localhost:7200/repositories/NASA'

/* Group json to get a list of crewMembers */
var groupCrew = (data) => {
  var crewArray = data.map(o => {return {photo: o.crewMemberPhoto, name: o.crewMemberName }}) 

  var newData = data[0] 
  delete newData.crew
  delete newData.crewMemberPhoto 
  delete newData.crewMemberName

  newData.crew = crewArray;

  return newData;
}

/* Clean json result */
var transformResult = (data) => {
    var newData; 

    var vars = data.head.vars

    newData = data.results.bindings.map((o) => {
        var newObject = {};

        for (v in vars) {
          if(o[vars[v]]) newObject[vars[v]] =  o[vars[v]].value 
        }
        return newObject
    })

    return newData
}

/* Sparql Client */
var client = new SparqlClient( endpoint, {defaultParameters: {format: 'json'}})
                .register({
                    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                    nasa: 'http://purl.org/net/schemas/space/',
                    foaf: 'http://xmlns.com/foaf/0.1/',
                    dc: 'http://purl.org/dc/elements/1.1/'
                })

/* GET Spacecrafts URIs and Names */
router.get('/', function(req, res, next) {
  const query = `
  SELECT ?spacecraftURI ?spacecraftName  WHERE {
    ?spacecraftURI rdf:type nasa:Spacecraft . 
    ?spacecraftURI foaf:name ?spacecraftName .
  } ORDER BY ?spacecraftName` //TODO: remove limit

  client.query(query)
        .execute()
        .then(data => {res.jsonp(transformResult(data))})
        .catch(err => {res.jsonp(err)})
});

/* GET Spacecrafts Count */
router.get('/spacecraftCount', function(req, res, next) {
  const query = `
  SELECT (count(DISTINCT ?spacecraft) as ?count) WHERE {
      ?spacecraft rdf:type nasa:Spacecraft . 
  }`

client.query(query)
      .execute()
      .then(data => {res.jsonp(transformResult(data))})
      .catch(err => {console.log(err);res.jsonp(err)})
  });

/* GET Spacecraft Information */
router.get('/:spacecraftURI', function(req, res) {
  const query = `SELECT * WHERE {
    <${req.params.spacecraftURI}> rdf:type nasa:Spacecraft ;
			   foaf:name ?name .
         OPTIONAL { <${req.params.spacecraftURI}> dc:description ?description }.
         OPTIONAL { <${req.params.spacecraftURI}> nasa:agency ?agency }.
         OPTIONAL { <${req.params.spacecraftURI}> nasa:internationalDesignator ?internationalDesignator } .
         OPTIONAL { <${req.params.spacecraftURI}> foaf:homepage ?homepage }.
         OPTIONAL { <${req.params.spacecraftURI}> foaf:depiction ?depiction }.
         OPTIONAL { <${req.params.spacecraftURI}> nasa:mass ?mass }.
         OPTIONAL { <${req.params.spacecraftURI}> nasa:alternateName ?alternateName }.
         OPTIONAL { 
           <${req.params.spacecraftURI}> nasa:launch ?launch.
           ?launch nasa:launchsite ?launchSite;
                              nasa:launched ?launchDate;
                              nasa:launchvehicle ?launchVehicle.
            ?launchSite nasa:place ?place.
          }.
}`

  client.query(query)
    .execute()
    .then(data => {res.jsonp(transformResult(data))})
    .catch(err => {res.jsonp(err)})
})

module.exports = router;
