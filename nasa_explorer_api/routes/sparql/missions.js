var dbpediaSparql = require('dbpedia-sparql-client').default;
var express = require('express');
var SparqlClient = require('sparql-client-2')
var router = express.Router();

var endpoint = 'http://localhost:7200/repositories/NASA'

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

var client = new SparqlClient( endpoint, {defaultParameters: {format: 'json'}})
                .register({
                    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                    nasa: 'http://purl.org/net/schemas/space/',
                    foaf: 'http://xmlns.com/foaf/0.1/',
                    dc: 'http://purl.org/dc/elements/1.1/'
                })

/* GET Mission Names */
router.get('/missionNames', function(req, res, next) {
    const query = `
    SELECT ?mission ?missionName  WHERE {
      ?mission rdf:type nasa:Mission . 
      ?mission dc:title ?missionName .
    } ORDER BY ?mission LIMIT 100 `
  
    client.query(query)
          .execute()
          .then(data => {res.jsonp(transformResult(data))})
          .catch(err => {res.jsonp(err)})
  });

router.get('/:missionName', function(req, res) {
  const query = `SELECT ?dbpediaURI  WHERE {
    ?mission rdf:type nasa:Mission;
			 dc:title "${req.params.missionName}" .
   	?mission owl:sameAs ?dbpediaURI;
}`

  client.query(query)
    .execute()
    .then(data => {res.jsonp(transformResult(data))})
    .catch(err => {res.jsonp(err)})
})

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

/* GET Mission Count */
router.get('/missionCount', function(req, res, next) {
  const query = `
    SELECT (count(DISTINCT ?mission) as ?count) WHERE {
        ?mission rdf:type nasa:Mission . 
    } LIMIT 100`

  client.query(query)
        .execute()
        .then(data => {res.jsonp(transformResult(data))})
        .catch(err => {console.log(err);res.jsonp(err)})
});

module.exports = router;
