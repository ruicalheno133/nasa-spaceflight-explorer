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

class Missions extends Component {

  constructor(props){
    super(props)
    this.state = {missionCount: 0, missions: []}
    this.getData = this.getData.bind(this)
  }

  getData() {
    axios.get('http://localhost:3001/sparql/missions')
         .then(data => this.setState({missionCount: data.data.length, missions: data.data}))
         .catch(err => console.log(err) )
  }

  componentDidMount() {
    this.getData()
  }

  render() {
    return (
        <div className='missionsContainer'> 
            <h5>Nasa has completed from 1950 to the present day, exactly {this.state.missionCount} missions.</h5>
            <h5> These are as follows:</h5>
            <br />

            {
                this.state.missions.map (mission => {
                    return (
                        <Grid style={{margin:'1vh', borderBottom: '1px solid white'}} container >
                            <Grid style={{paddingLeft:'1vh'}} item xs={11} sm={11} lg={11}>
                                <h1 className="nasaFont">{mission.missionName}</h1>
                            </Grid>
                            <Grid  item xs={1} sm={1} lg={1}>
                              <Link className="link" activeClassName="active" exact to={"/missions/" + encodeURIComponent(mission.missionURI)} >
                                <Button className="nasaFont menuButton" color="inherit">
                                <h1 className='missionChevron'>
                                  <FontAwesomeIcon icon="chevron-right"/>
                                </h1> 
                                </Button>
                              </Link>
                            </Grid>
                            
                        </Grid>
                        
                        )
                    })
                }
        </div>
    );
  }
}

export default Missions;
