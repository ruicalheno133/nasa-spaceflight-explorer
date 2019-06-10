var dbpediaSparql = require('dbpedia-sparql-client').default;
var express = require('express');
var SparqlClient = require('sparql-client-2')
var router = express.Router();

var endpoint = 'http://localhost:7200/repositories/NASA'

var groupCrew = (data) => {
  var crewArray = data.map(o => {return {photo: o.crewMemberPhoto, name: o.crewMemberName }}) 

  var newData = data[0] 
  delete newData.crew
  delete newData.crewMemberPhoto 
  delete newData.crewMemberName

  newData.crew = crewArray;

  return newData;
}

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

module.exports = router;