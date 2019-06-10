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

/* GET Missions URIs and Names */
router.get('/missions', function(req, res, next) {
    const query = `
    SELECT ?missionURI ?missionName  WHERE {
      ?missionURI rdf:type nasa:Mission . 
      ?missionURI dc:title ?missionName .
    } ORDER BY ?missionName LIMIT 100 `
  
    client.query(query)
          .execute()
          .then(data => {res.jsonp(transformResult(data))})
          .catch(err => {res.jsonp(err)})
  });

/* GET Spacecrafts URIs and Names */
router.get('/spacecrafts', function(req, res, next) {
  const query = `
  SELECT ?spacecraftURI ?spacecraftName  WHERE {
    ?spacecraftURI rdf:type nasa:Spacecraft . 
    ?spacecraftURI foaf:name ?spacecraftName .
  } ORDER BY ?spacecraftName LIMIT 100` //TODO: remove limit

  client.query(query)
        .execute()
        .then(data => {res.jsonp(transformResult(data))})
        .catch(err => {res.jsonp(err)})
});

/* GET Mission dbpediaURI */
router.get('/missions/:missionURI', function(req, res) {
  const query = `SELECT ?name ?dbpediaURI  WHERE {
       <${req.params.missionURI}> owl:sameAs ?dbpediaURI;
                                  dc:title ?name .
}`

console.log(query)

  client.query(query)
    .execute()
    .then(data => {res.jsonp(transformResult(data))})
    .catch(err => {console.log(err); res.jsonp(err)})
})

/* GET People info */
router.get('/peopleInfo', function(req, res, next) {
  const query = `
  SELECT Distinct (SAMPLE(?name) AS ?name) ?dbpediaURI WHERE {
    ?person rdf:type foaf:Person.
    ?person owl:sameAs ?dbpediaURI .
    ?person foaf:name ?name .
} GROUP BY ?dbpediaURI` 

client.query(query)
.execute()
.then(data => {res.jsonp(transformResult(data))})
.catch(err => {res.jsonp(err)})
});

/* GET Spacecraft Information */
router.get('/spacecrafts/:spacecraftURI', function(req, res) {
  const query = `SELECT ?name ?description ?agency ?internationalDesignator ?homepage ?depiction ?mass ?alternateName ?launch WHERE {
    <${req.params.spacecraftURI}> rdf:type nasa:Spacecraft ;
			   foaf:name ?name .
         OPTIONAL { <${req.params.spacecraftURI}> dc:description ?description }.
         OPTIONAL { <${req.params.spacecraftURI}> nasa:agency ?agency }.
         OPTIONAL { <${req.params.spacecraftURI}> nasa:internationalDesignator ?internationalDesignator } .
         OPTIONAL { <${req.params.spacecraftURI}> foaf:homepage ?homepage }.
         OPTIONAL { <${req.params.spacecraftURI}> foaf:depiction ?depiction }.
         OPTIONAL { <${req.params.spacecraftURI}> nasa:mass ?mass }.
         OPTIONAL { <${req.params.spacecraftURI}> nasa:alternateName ?alternateName }.
         OPTIONAL { <${req.params.spacecraftURI}> nasa:launch ?launch }.
}`

  client.query(query)
    .execute()
    .then(data => {res.jsonp(transformResult(data))})
    .catch(err => {res.jsonp(err)})
})

/* GET Launch Information */
router.get('/launches/:launchURI', function(req, res) {
  const query = `SELECT Distinct ?launchDate ?place ?launchVehicle  WHERE {
    <${req.params.launchURI}> nasa:launchsite ?launchSite;
                              nasa:launched ?launchDate;
                              nasa:launchvehicle ?launchVehicle .
    ?launchSite nasa:place ?place.
} `

  client.query(query)
    .execute()
    .then(data => {res.jsonp(transformResult(data))})
    .catch(err => {console.log(err);res.jsonp(err)})
})

/****************************/
/** DBPEDIA SPARQL QUERIES **/
/****************************/

router.get('/dbpedia/missionInfo/:uri', function(req,res){
  const query = `SELECT * WHERE {
    <${req.params.uri}> rdfs:comment ?description;
                      dbo:thumbnail ?thumbnail;
                      dbp:crewMembers ?crew.
                      ?crew dbo:thumbnail ?crewMemberPhoto;
                            rdfs:label ?crewMemberName.
    FILTER (lang(?description) = 'en')
    FILTER (lang(?crewMemberName) = 'en')
    }`

 

  dbpediaSparql.client() 
              .query(query)
              .timeout(15000) // optional, defaults to 10000
              .asJson()       // or asXml()
              .then(data => { res.jsonp(groupCrew(transformResult(data)))})
              .catch(err => { res.jsonp(err)});
})

router.get('/dbpedia/personInfoMin/:uri', function(req,res){
  const query = `SELECT * WHERE {

    ?dbpediaURI dbo:thumbnail ?thumbnail ;
                        foaf:name ?name .
    FILTER (<${req.params.uri}> = ?dbpediaURI)
    }`


  dbpediaSparql.client() 
              .query(query)
              .timeout(15000) // optional, defaults to 10000
              .asJson()       // or asXml()
              .then(data => { res.jsonp(transformResult(data))})
              .catch(err => { res.jsonp(err)});
})

router.get('/dbpedia/personInfo/:uri', function(req,res){
  const query = `SELECT * WHERE {
    <${req.params.uri}> dbo:thumbnail ?thumbnail .
    OPTIONAL { <${req.params.uri}> dbo:abstract ?abstract . FILTER(LANG(?abstract) = 'en') .}
    OPTIONAL { <${req.params.uri}> dbo:birthDate ?birthDate . FILTER (REGEX(STR(?birthDate),"[0-9]{4}-[0-9]{2}-[0-9]{2}"))}
    OPTIONAL { <${req.params.uri}> dbo:deathDate ?deathDate . FILTER (REGEX(STR(?deathDate),"[0-9]{4}-[0-9]{2}-[0-9]{2}")).}
    OPTIONAL { <${req.params.uri}> foaf:name ?name .}
    OPTIONAL { <${req.params.uri}> <http://dbpedia.org/ontology/Astronaut/timeInSpace> ?timeInSpace .}

    }`


  dbpediaSparql.client() 
              .query(query)
              .timeout(15000) // optional, defaults to 10000
              .asJson()       // or asXml()
              .then(data => { res.jsonp(transformResult(data))})
              .catch(err => { res.jsonp(err)});
})

/****************************/
/********** COUNTS **********/
/****************************/

/* GET Mission Count */
router.get('/missionCount', function(req, res, next) {
  const query = `
    SELECT (count(DISTINCT ?mission) as ?count) WHERE {
        ?mission rdf:type nasa:Mission . 
    }`

  client.query(query)
        .execute()
        .then(data => {res.jsonp(transformResult(data))})
        .catch(err => {console.log(err);res.jsonp(err)})
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

/* GET Launch Count */
router.get('/launchCount', function(req, res, next) {
  const query = `
  SELECT (count(DISTINCT ?launch) as ?count) WHERE {
    ?launch rdf:type nasa:Launch . 
  }`

client.query(query)
      .execute()
      .then(data => {res.jsonp(transformResult(data))})
      .catch(err => {console.log(err);res.jsonp(err)})
  });

/* GET Launch Count */
router.get('/personCount', function(req, res, next) {
  const query = `
  SELECT (count(DISTINCT ?person) as ?count) WHERE {
    ?person rdf:type foaf:Person . 
  }`

client.query(query)
      .execute()
      .then(data => {res.jsonp(transformResult(data))})
      .catch(err => {console.log(err);res.jsonp(err)})
  });

module.exports = router;
