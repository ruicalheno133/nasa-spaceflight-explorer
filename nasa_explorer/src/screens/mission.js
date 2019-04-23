import React, { Component } from 'react';
import nasa from '../nasa.png';
import '../App.css';
import { List, ListItem, ListItemText } from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CountUp from 'react-countup';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

library.add(faChevronRight)


var axios = require('axios')

class Mission extends Component {

  constructor(props){
    super(props)
    this.state = {missionName: "", missionInfo: {crew:[]}}
    this.getData = this.getData.bind(this)
  }

  getData() {
    axios.get('http://localhost:3001/sparql/missions/' + this.props.match.params.missionURI)
         .then(data => {
            axios.get('http://localhost:3001/sparql/dbpedia/missionInfo/' + encodeURIComponent(data.data[0].dbpediaURI))
                  .then(dbpData => {this.setState({missionInfo: dbpData.data, missionName: data.data[0].name})})
         })
         .catch(err => console.log(err) )
  }

  getDerivedStateFromProps(props, state) {
      this.setState({})
  }

  componentDidMount() {
    this.getData()
  }

  render() {
    return (
        <div className='missionContainer'> 
            <Grid container spacing={24}>
                <Grid item xs={8}>
                    <h2 className='nasaFont'>{this.state.missionName}</h2>

                    <p>{this.state.missionInfo.description}</p>

                </Grid>
                <Grid item xs={4} style={{textAlign:'center'}}>
                <img style={{border: '5px solid white'}}src={this.state.missionInfo.thumbnail} />
                </Grid>
                <Grid container spacing={24}>
                <Grid item xs={12}>
                    <h2 className='nasaFont'>Crew members</h2>
                </Grid>
                {
                  this.state.missionInfo.crew.map(c => {
                    return (
                      <Grid item xs={4} style={{textAlign:'center'}}>
                        <img style={{border: '5px solid white'}}src={c.photo} />
                        <p className="nasaFont">{c.name}</p>
                      </Grid>
                    );
                  })
                }
                </Grid>
            </Grid>
        </div>
    );
  }
}

export default Mission;
