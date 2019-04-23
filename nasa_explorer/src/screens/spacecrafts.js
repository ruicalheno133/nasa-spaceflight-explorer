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
import ReactSearchBox from 'react-search-box'

library.add(faChevronRight)


var axios = require('axios')

class Spacecrafts extends Component {

  constructor(props){
    super(props)
    this.state = {spacecraftCount: 0, spacecrafts: [], filteredData: [], visible: 10}
    this.getData = this.getData.bind(this)
    this.filterData = this.filterData.bind(this)
    this.loadMore = this.loadMore.bind(this)
  }

  getData() {
    axios.get('http://localhost:3001/sparql/spacecrafts')
         .then(data => this.setState({spacecraftCount: data.data.length, spacecrafts: data.data, filteredData: data.data}))
         .catch(err => console.log(err) )
  }

  filterData(val){
    var filteredData = this.state.spacecrafts.filter(s => s.spacecraftName.includes(val))
    if (val == "") this.setState({filteredData : this.state.spacecrafts})
    else this.setState({filteredData : filteredData})
  }

  componentDidMount() {
    this.getData()
  }

  loadMore() {
    this.setState((prev) => {
      return {visible: prev.visible + 10};
    });
  }

  render() {
    return (
        <div className='spacecraftsContainer'> 
        <Grid container spacing={25}>
            <Grid item xs={8}>
                <h5>Nasa has built exactly {this.state.spacecraftCount} spacecrafts.</h5>
                <h5> These are as follows:</h5>
            </Grid>
            <Grid item xs={4} className={'searchbox'}>
            <ReactSearchBox
                    placeholder="Search spacecrafts"
                    onChange={this.filterData}
                    
                />

            </Grid>
        </Grid>

            <br />

            {
                this.state.filteredData.slice(0, this.state.visible).map (spacecraft => {
                    return (
                        <Grid style={{margin:'1vh', borderBottom: '1px solid white'}} container >
                            <Grid style={{paddingLeft:'1vh'}} item xs={11} sm={11} lg={11}>
                                <h1 className="nasaFont">{spacecraft.spacecraftName}</h1>
                            </Grid>
                            <Grid  item xs={1} sm={1} lg={1}>
                              <Link className="link" activeClassName="active" exact to={"/spacecrafts/" + encodeURIComponent(spacecraft.spacecraftURI)} >
                                <Button className="nasaFont menuButton" color="inherit">
                                <h1 className='spacecraftChevron'>
                                  <FontAwesomeIcon icon="chevron-right"/>
                                </h1> 
                                </Button>
                              </Link>
                            </Grid>
                            
                        </Grid>
                        
                        )
                    })
            }
            <div style={{textAlign:'center'}}>
                <button onClick={this.loadMore} type="button" className="loadMore nasaFont">Load more</button>
            </div>

        </div>
    );
  }
}

export default Spacecrafts;
