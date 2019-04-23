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



router.get('/:launchURI', function(req, res) {
  const query = `SELECT Distinct ?launchDate ?place ?launchVehicle  WHERE {
    <${req.params.launchURI}> nasa:launched ?launchDate;
                                                    nasa:launchsite ?launchSite;
                                                    nasa:launchvehicle ?launchVehicle .
    ?launchSite nasa:place ?place.
} `

  client.query(query)
    .execute()
    .then(data => {res.jsonp(transformResult(data))})
    .catch(err => {console.log(err);res.jsonp(err)})
})

/* GET Launch Count */
router.get('/launchCount', function(req, res, next) {
  const query = `
  SELECT (count(DISTINCT ?launch) as ?count) WHERE {
    ?launch rdf:type nasa:Launch . 
  } LIMIT 100`

client.query(query)
      .execute()
      .then(data => {console.log(data);res.jsonp(transformResult(data))})
      .catch(err => {console.log(err);res.jsonp(err)})
  });

module.exports = router;
