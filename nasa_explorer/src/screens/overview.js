import React, { Component } from 'react';
import nasa from '../nasa.png';
import '../App.css';
import Grid from '@material-ui/core/Grid';
import CountUp from 'react-countup';
var axios = require('axios')

class Missions extends Component {

  constructor(props){
    super(props)
    this.state = {missionCount: 0, spacecraftCount: 0, launchCount: 0, personCount: 0}
    this.getData = this.getData.bind(this)
  }

  getData() {
    axios.get('http://localhost:3001/sparql/missionCount')
         .then(data => this.setState({missionCount: data.data[0].count}))
         .catch(err => console.log(err) )
    axios.get('http://localhost:3001/sparql/spacecraftCount')
         .then(data => this.setState({spacecraftCount: data.data[0].count}))
         .catch(err => console.log(err) )
    axios.get('http://localhost:3001/sparql/launchCount')
         .then(data => this.setState({launchCount: data.data[0].count}))
         .catch(err => console.log(err) )
    axios.get('http://localhost:3001/sparql/personCount')
         .then(data => this.setState({personCount: data.data[0].count}))
         .catch(err => console.log(err) )
  }

  componentDidMount() {
    this.getData()
  }

  render() {
    return (
        <div className='overviewContainer'> 
        <Grid container spacing={24} >
            <Grid item xs={6}>
              <img src={nasa} className="App-logo" alt="logo" />
            </Grid>
            <Grid item xs={6} className="nasaFont">
              <h1>
                <CountUp end={this.state.missionCount} duration={5} /> Missions
              </h1>
              <h1>
                <CountUp end={this.state.spacecraftCount} duration={5} /> Spacecrafts
              </h1>
              <h1>
                <CountUp end={this.state.launchCount} duration={5} /> Launches
              </h1>
              <h1>
                <CountUp end={this.state.personCount} duration={5} /> People
              </h1>
            </Grid>
          </Grid>
        </div>
    );
  }
}

export default Missions;
