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

class Person extends Component {

  constructor(props){
    super(props)
    this.state = {personInfo: {}}
    this.getData = this.getData.bind(this)
  }

  getData() {
    axios.get('http://localhost:3001/dbpedia/personInfo/' + this.props.match.params.personURI)
         .then(data => {
                this.setState({personInfo: data.data[0]})
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
                <Grid item xs={4} style={{textAlign:'center'}}>
                    <img style={{border: '5px solid white'}}src={this.state.personInfo.thumbnail} width='80%'/>
                </Grid>
                <Grid item xs={8}>
                    <div>
                        <h1 style={{display:'inline'}}className='nasaFont'>
                            {this.state.personInfo.name}
                        </h1>
                    </div>
                    <p>{this.state.personInfo.abstract}</p>
                        <h2 className='nasaFont'>More info</h2>
                        <table style={{marginLeft:'2em'}}>
                        <tr>
                            <td><h3>Birth Date</h3></td>
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            <td><p>{this.state.personInfo.birthDate}</p></td>
                        </tr>
                        <tr>
                            <td><h3>Death Date</h3></td>
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            <td><p>{this.state.personInfo.deathDate}</p></td>
                        </tr>
                        <tr>
                            <td><h3>Time in Space (min)</h3></td>
                            <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                            <td><p>{this.state.personInfo.timeInSpace}</p></td>
                        </tr>
                    </table>
                </Grid>
            </Grid>
        </div>
    );
  }
}

export default Person;
