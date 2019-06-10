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

/* GET Missions URIs and Names */
router.get('/', function(req, res, next) {
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

/* GET Mission dbpediaURI */
router.get('/:missionURI', function(req, res) {
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

module.exports = router;
