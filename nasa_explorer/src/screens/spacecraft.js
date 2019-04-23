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
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

library.add(faExternalLinkAlt)


var axios = require('axios')

class Spacecraft extends Component {

  constructor(props){
    super(props)
    this.state = {spacecraftInfo: {crew:[]}, launchInfo: {}}
    this.getData = this.getData.bind(this)
  }

  getData() {
    axios.get('http://localhost:3001/sparql/spacecrafts/' + this.props.match.params.spacecraftURI)
         .then(data => {
                this.setState({spacecraftInfo: data.data[0]})
                if (this.state.spacecraftInfo.launch) {
                    axios.get('http://localhost:3001/sparql/launches/' + encodeURIComponent(this.state.spacecraftInfo.launch))
                         .then(data => {this.setState({launchInfo: data.data[0]})})
                         .catch(err => console.log(err))
                }
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
        <div className='spacecraftContainer'> 
            <Grid container spacing={24}>
                <Grid item xs={8}>
                    <div>
                        <h1 style={{display:'inline'}}className='nasaFont'>
                            {this.state.spacecraftInfo.name}
                        </h1>
                        &nbsp;&nbsp;
                        <a style={{textDecoration:'none', color: 'white'}}href={this.state.spacecraftInfo.homepage} target="_blanck">
                                <FontAwesomeIcon icon={"external-link-alt"} />
                        </a>
                    </div>
                    <p>{this.state.spacecraftInfo.description}</p>
                        <h2 className='nasaFont'>Spacecraft information</h2>
                        <table style={{marginLeft:'2em'}}>
                        <tr>
                            <td><h3>Agency</h3></td>
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            <td>{this.state.spacecraftInfo.agency}</td>
                        </tr>
                        <tr>
                            <td ><h3>International Designator</h3></td>
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            <td>{this.state.spacecraftInfo.internationalDesignator}</td>
                        </tr>
                        <tr>
                            <td ><h3>Alternate names</h3></td>
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            <td>{this.state.spacecraftInfo.alternateName}</td>
                        </tr>
                        <tr>
                            <td ><h3>Mass</h3></td>
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            <td>{this.state.spacecraftInfo.mass}</td>
                        </tr>
                    </table>
                        <h2 className='nasaFont'>Launch information</h2>
                        <table style={{marginLeft:'2em'}}>
                        <tr>
                            <td><h3>Launch Date</h3></td>
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            <td>{this.state.launchInfo.launchDate}</td>
                        </tr>
                        <tr>
                            <td ><h3>Launchsite</h3></td>
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            <td>{this.state.launchInfo.place}</td>
                        </tr>
                        <tr>
                            <td ><h3>Launch Vehicle</h3></td>
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            <td>{this.state.launchInfo.launchVehicle}</td>
                        </tr>
                    </table>
                </Grid>
                <Grid item xs={4} style={{textAlign:'center'}}>
                    <img style={{border: '5px solid white'}}src={this.state.spacecraftInfo.depiction} width='70%'/>
                </Grid>
            </Grid>
        </div>
    );
  }
}

export default Spacecraft;
