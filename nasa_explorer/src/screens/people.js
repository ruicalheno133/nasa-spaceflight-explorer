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

class People extends Component {

  constructor(props){
    super(props)
    this.state = {peopleCount: 0, people: [], filteredData: [], visible: 6}
    this.getData = this.getData.bind(this)
    this.filterData = this.filterData.bind(this)
    this.loadMore = this.loadMore.bind(this)
  }

  getData() {
    axios.get('http://localhost:3001/sparql/people')
         .then(data => {
           for (var i in data.data) {
            axios.get('http://localhost:3001/dbpedia/personInfoMin/' + encodeURIComponent(data.data[i].dbpediaURI))
            .then(dbpData => { if(dbpData.data[0]) this.setState({ people: [...this.state.people , dbpData.data[0]], filteredData: this.state.people}) } )
            .catch(err => console.log(err))
           }
           this.setState({peopleCount: data.data.length}) 
          })
         .catch(err => console.log(err) )
  }

  filterData(val){
    var filteredData = this.state.people.filter(p => p.name.includes(val))
    if (val == "") this.setState({filteredData : this.state.people})
    else this.setState({filteredData : filteredData})
  }

  componentDidMount() {
    this.getData()
  }

  loadMore() {
    this.setState((prev) => {
      return {visible: prev.visible + 6};
    });
  }

  render() {
    return (
        <div className='peopleContainer'> 
        <Grid container spacing={25}>
            <Grid item xs={8}>
                <h5>Meet the {this.state.peopleCount} heroes whom courage lead to space discovery:</h5>
            </Grid>
            <Grid item xs={4} className={'searchbox'}>
            <ReactSearchBox
                    placeholder="Search people"
                    onChange={this.filterData}
                    
                />

            </Grid>
        </Grid>

            <br />
            <Grid style={{margin:'1vh', borderBottom: '1px solid white'}} container >
            {
                this.state.filteredData.slice(0, this.state.visible).map (person => {
                    return (
                            <Grid item xs={4}>
                            <Link style={{textDecoration:'none', color: 'white'}} exact to={"/people/" + encodeURIComponent(person.dbpediaURI)} >
                                <img style={{width:'80%'}} src={person.thumbnail}/>
                                <p className='nasaFont'>{person.name}</p>
                                </Link>
                            </Grid>
                  
 
                        
                        )
                    })
            }
            </Grid>
            <div style={{textAlign:'center'}}>
                <button onClick={this.loadMore} type="button" className="loadMore nasaFont">Load more</button>
            </div>

        </div>
    );
  }
}

export default People;
