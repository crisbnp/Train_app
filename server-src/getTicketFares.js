const request = require("request")
const express = require("express");


const getTicketFares = (station_from, station_to, callback) => {
    
    let url = `http://api.brfares.com/querysimple?orig=${station_from}&dest=${station_to}`;
    request({ url, json: true }, (error, response) => {
        if (error) {
            callback("Unable to connect to train services!", undefined);
        } else if (response.body.fares.fare === 0) {
            callback("Unable to find station. Try another search.", undefined);
        } else {
            callback(undefined, {
                fares: response.body.fares.fare
            });
        }
    })
}

module.exports = getTicketFares



