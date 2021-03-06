import React, { Component } from 'react';
import Home from './components/home/Home';
import MenuBar from './components/MenuBar';
import ResultPage from './components/home/ResultPage';
import NewsPage from './components/service-news/NewsPage';
import StationPage from './components/stationinfo/StationPage';
import './App.css';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

let urlBase;
window.location.hostname.substr(0,9) === "localhost" ? urlBase = "http://" + window.location.hostname + ":3001" : urlBase = "https://" + window.location.hostname

const searchFromAPI = (origin) => fetch(urlBase + '/getStationList?placeName=' + origin)
const searchToAPI = (destination) => fetch(urlBase + '/getStationList?placeName=' + destination)

const searchAPIDebounced = AwesomeDebouncePromise(searchFromAPI, 1500);
const searchToAPIDebounced = AwesomeDebouncePromise(searchToAPI, 1500);

class App extends Component {
    state = {
        fromStation: '',
        toStation: '',
        leavingDate: '',
        departingStatus: '',
        leavingTime: '',
        returnCheck: false,
        returningDate: '',
        returningStatus: '',
        returningTime: '',
        adultCount: 1,
        childCount: 0,
        chooseFromStations: [],
        chosenFromStation: '',
        chosenToStation: '',
        chooseToStations: [],
        outbound: [],
        errorMsg: "",
        news: [],
        stationInfo: [],
        pageDisplayed: "home",
        searchBar: ""
    }

    //this is onChange handle for all input 
    handleChange = ({ target }) => {
        const name = target.name
        const value = target.type === 'checkbox' ? target.checked : target.value
        this.setState({
            [name]: value
        })
    }

    //this is the handle for station list drop down menu
    asyncFromStation = async() => {
        if (this.state.fromStation) {
            const { stations } = await searchAPIDebounced(this.state.fromStation)
                .then((response) => response.json())
            this.setState({ chooseFromStations: stations })
        }
    }

    handleChangeFromStation = (e) => {
        this.setState({
            fromStation: e.target.value
        }, this.asyncFromStation)

    }

    handleSelectFromStation = (e) => {
        this.setState({
            chosenFromStation: e.target.value
        })
    }

    asyncToStation = async() => {
        if (this.state.toStation) {
            const { stations } = await searchToAPIDebounced(this.state.toStation)
                .then((response) => response.json())
            this.setState({ chooseToStations: stations })
        }
    }

    handleChangeToStation = (e) => {
        this.setState({
            toStation: e.target.value
        }, this.asyncToStation)
    }
    
    handleSelectToStation = (e) => {
        this.setState({
            chosenToStation: e.target.value
        })
    }

    //Submitting the form
    handleSubmit = (e) => {
        const {fromStation, chosenFromStation, chosenToStation, leavingDate, leavingTime} = this.state
        console.log('form submitted')
        e.preventDefault()
        fetch(urlBase + '/train?fromStation=' + fromStation +'&chosenFromStation=' + chosenFromStation + '&chosenToStation=' + chosenToStation + '&leavingDate=' + leavingDate + '&leavingTime=' + leavingTime)
            .then((response) => response.json())
            .then((data) => {
                this.setState({ outbound: data.allDepartures })
                if (this.state.outbound.length === 0) {
                    console.log("no direct train running")
                    this.setState({errorMsg: "Sorry, no direct train running between your 2 stations!"})
                }
            })
    }

    //handle the Search button for search News list
    handleSearchNews = (e) => {
        const {searchBar} = this.state
        fetch(urlBase + '/getnews?address=' + searchBar)
            .then((response) => response.json())
            .then((data) => this.setState({news: data.delayedTrains}))
    }
    
    //handle the Search button for search Station list 
    handleSearchStn = (e) => {
        const {searchBar} = this.state
        fetch(urlBase + '/getstation?address=' + searchBar)
            .then((response) => response.json())
            .then((data) => this.setState({stationInfo: data.stations}))
    }

    //handle back button
    handleBackHome = (e) => {
        this.setState({
            fromStation: '',
            toStation: '',
            departingStatus: '',
            returnCheck: false,
            returningStatus: '',
            adultCount: 1,
            childCount: 0,
            chooseFromStations: [],
            chosenFromStation: '',
            chosenToStation: '',
            chooseToStations: [],
            outbound: [],
            errorMsg: '',
            pageDisplayed: "home",   
        })
        this.makeDatesCurrent();
    }

    //handle page display rendering between, home, news and stn info
    handlePageDisplayed = (page) => {
        // window.location = page;
        this.setState({ pageDisplayed: page, searchBar: '' })
    }

    makeDatesCurrent = () => {
        let now, month, day, hour, minute, tomorrow;
        // Set the initial leavingDate
        if (this.state.leavingDate === "") {
            now = new Date()
            month = now.getMonth() + 1
            if (month < 10) {
                month = "0" + month;
            }
            day = now.getDate() + 1
            if (day < 10) {
                day = "0" + day;
            }
            this.setState({leavingDate: `${now.getFullYear()}-${month}-${day}`})
        }

        // Set the initial leavingTime
        if (this.state.leavingTime === "") {
            now = new Date()
            hour= now.getHours()
            if (hour < 10) {
                hour = "0" + hour;
            }
            minute = now.getMinutes()
            if (minute < 10) {
                minute = "0" + minute;
            }
            this.setState({leavingTime: `${hour}:${minute}`})
        }

        // Set the initial returningDate
        if (this.state.returningDate === "") {
            tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate()+1)
            month = tomorrow.getMonth() + 1
            if (month < 10) {
                month = "0" + month;
            }
            day = tomorrow.getDate() + 1
            if (day < 10) {
                day = "0" + day;
            }
            this.setState({returningDate: `${now.getFullYear()}-${month}-${day}`})
        }
            
        // Set the initial returningTime
        if (this.state.returningTime === "") {
            now = new Date()
            hour= now.getHours()
            if (hour < 10) {
                hour = "0" + hour;
            }
            let minute = now.getMinutes()
            if (minute < 10) {
                minute = "0" + minute;
            }
            this.setState({returningTime: `${hour}:${minute}`})
        }
    }

    componentDidMount() {
        this.makeDatesCurrent()

        // The following changes the page rendered if the address suggests to.
        console.log(window.location.pathname)
        if (window.location.pathname.substr(0,5) === "/news") {
            this.setState({pageDisplayed: "news"})
        }
        else if (window.location.pathname.substr(0,8) === "/station") {
            this.setState({pageDisplayed: "station"})
        }
    }

    render() {
        const {errorMsg, stationInfo, news, chooseToStations, chooseFromStations, fromStation, toStation, leavingDate, departingStatus, leavingTime, returnCheck, returningDate, returningStatus, returningTime, adultCount, childCount, outbound, pageDisplayed, searchBar} = this.state


            return ( <div className = "App" >
                {
// This is an object describing the three pages, which of which is rendered is determined by state.pageDisplayed 
                    {
                        home: 
                            <div>
    {/* This is a ternary operator deciding whether to render the home form or the results */}
                                {outbound.length=== 0 ? <Home fromStation = { fromStation }
                                toStation = { toStation }
                                leavingDate = { leavingDate }
                                departingStatus = { departingStatus }
                                leavingTime = { leavingTime }
                                returnCheck = { returnCheck }
                                returningDate = { returningDate }
                                returningStatus = { returningStatus }
                                returningTime = { returningTime }
                                adultCount = { adultCount }
                                childCount = { childCount }
                                chooseFromStations = { chooseFromStations }
                                chooseToStations = { chooseToStations }
                                handleSelectFromStation = { this.handleSelectFromStation }
                                handleSelectToStation = { this.handleSelectToStation }
                                handleChange = { this.handleChange }
                                handleChangeFromStation = { this.handleChangeFromStation }
                                handleChangeToStation = { this.handleChangeToStation }
                                handleSubmit = { this.handleSubmit } errorMsg={errorMsg}/> : 
                                <ResultPage searchResults={outbound} handleBackHome={this.handleBackHome}/>}
                            </div>,
                        news: <NewsPage pageDisplayed={pageDisplayed} handleChange={this.handleChange} searchBar={searchBar} handlePageDisplayed={this.handlePageDisplayed} handleSearchNews={this.handleSearchNews} lateTrains={news}/>,
                        station: <StationPage pageDisplayed={pageDisplayed} handleChange={this.handleChange} searchBar={searchBar} handleSearchStn={this.handleSearchStn} stationsSearch={stationInfo}/>
                    }[pageDisplayed]
                }

                
            <MenuBar pageDisplayed = {pageDisplayed}/>

            </div>
        );
    
}
}

export default App;