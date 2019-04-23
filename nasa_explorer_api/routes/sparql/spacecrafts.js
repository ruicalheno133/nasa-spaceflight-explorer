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


/* GET Mission Names */
router.get('/spacecraftNames', function(req, res, next) {
  const query = `
  SELECT ?spacecraft ?spacecraftName  WHERE {
    ?spacecraft rdf:type nasa:Spacecraft . 
    ?spacecraft foaf:name ?spacecraftName .
  }  LIMIT 100` //TODO: remove limit

  client.query(query)
        .execute()
        .then(data => {res.jsonp(transformResult(data))})
        .catch(err => {res.jsonp(err)})
});

router.get('/:spacecraftName', function(req, res) {
  const query = `SELECT ?description ?agency ?internationalDesignator ?homepage ?depiction ?mass ?alternateName ?launch WHERE {
    ?spacecraft rdf:type nasa:Spacecraft ;
			   foaf:name "${req.params.spacecraftName}" .
         OPTIONAL { ?spacecraft dc:description ?description }.
         OPTIONAL { ?spacecraft nasa:agency ?agency }.
         OPTIONAL { ?spacecraft nasa:internationalDesignator ?internationalDesignator } .
         OPTIONAL { ?spacecraft foaf:homepage ?homepage }.
         OPTIONAL { ?spacecraft foaf:depiction ?depiction }.
         OPTIONAL { ?spacecraft nasa:mass ?mass }.
         OPTIONAL { ?spacecraft nasa:alternateName ?alternateName }.
         OPTIONAL { ?spacecraft nasa:launch ?launch }.
}`

  client.query(query)
    .execute()
    .then(data => {res.jsonp(transformResult(data))})
    .catch(err => {console.log(err);res.jsonp(err)})
})

/* GET Spacecrafts Count */
router.get('/spacecraftCount', function(req, res, next) {
  const query = `SELECT (count(DISTINCT ?spacecraft) as ?count) WHERE {
      ?spacecraft rdf:type nasa:Spacecraft . 
  } LIMIT 100`

client.query(query)
      .execute()
      .then(data => {res.jsonp(transformResult(data))})
      .catch(err => {console.log(err);res.jsonp(err)})
  });

module.exports = router;
