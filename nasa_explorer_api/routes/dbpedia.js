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

/****************************/
/** DBPEDIA SPARQL QUERIES **/
/****************************/

router.get('/missionInfo/:uri', function(req,res){
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

router.get('/personInfoMin/:uri', function(req,res){
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

router.get('/personInfo/:uri', function(req,res){
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

module.exports = router;
