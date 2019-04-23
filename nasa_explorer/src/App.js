import React, { Component } from 'react';
import nasa from './nasa.png';
import './App.css';
import Grid from '@material-ui/core/Grid';
import CountUp from 'react-countup';
import AppBar from '@material-ui/core/AppBar';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import { MenuItem, Toolbar } from '@material-ui/core';
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import Overview from './screens/overview'
import Missions from './screens/missions'
import Mission from './screens/mission'
import Spacecrafts from './screens/spacecrafts';
import Spacecraft from './screens/spacecraft';
import People from './screens/people';
var axios = require('axios')

class App extends Component {
  render() {
    return (
        <Router>
        <AppBar className="nav nasaFont" color="default" position="sticky">  
          <Toolbar color="inherit">
            <h1 className="brand">NASA Space Missions</h1>
            <div className="menuButtons">

                <NavLink className="link" activeClassName="active" exact to="/"><Button className="nasaFont menuButton" color="inherit">Overview</Button></NavLink>
                <NavLink className="link" activeClassName="active" to="/missions"><Button className="nasaFont menuButton" color="inherit">Missions</Button></NavLink>
                <NavLink className="link" activeClassName="active" to="/spacecrafts"><Button className="nasaFont menuButton" color="inherit">Spacecrafts</Button></NavLink>
                <NavLink className="link" activeClassName="active" to="/people"><Button className="nasaFont menuButton" color="inherit">People</Button></NavLink>
            </div>

          </Toolbar>
        </AppBar>
          <Route exact path="/" component={Overview} />

          <Route exact path="/missions" component={Missions} />
          <Route exact path="/missions/:missionURI" component={Mission} />

          <Route exact path="/spacecrafts" component={Spacecrafts} />
          <Route exact path="/spacecrafts/:spacecraftURI" component={Spacecraft} />

          <Route exact path="/people" component={People} />
        </Router>
    );
  }
}

export default App;
