var express = require('express');
var request = require('request');
var EventEmitter = require('events').EventEmitter;
var body = new EventEmitter();
var app = express();

app.use(express.static('public'));

    /*
        Query the Retsly API using request() on URL for sample of listings
    */
request('https://rets.io/api/v1/test/listings?access_token=6baca547742c6f96a6ff71b138424f21',
        function(error, response, data) {
            if(error) {
                console.error("An error has occurred for Retsly API.", error);
            }
            else {
                body.data = JSON.parse(data);
                console.log("Retsly API query successful");
            }
});

    /*
        Send the index.html file to the browser via this server
    */
app.get('/index.html', function (req, res) {
        res.sendFile( __dirname + "/" + "index.html" );
});

    /*
        Send the index.css file to the browser via this server
    */
app.get('/index.css', function (req, res) {
        res.sendFile( __dirname + "/" + "index.css" );
});

    /* 
        Reponsible for parsing together the HTML for the results based on JSON data
        Input Type: object
        Output Type: string 
    */
function buildPage(jsonData) {
    return "<h2>" + jsonData.address + " " + jsonData.zipCode + "</h2>" +
            "<h3> Price: $" + jsonData.price + "</h3>" +
            "<table style=\"width:100%;\">" +
            "<img src=\"" + jsonData.media[0].url + "\">" +
            "<p>" + jsonData.publicRemarks + "</p>" +
            "<tr><td>Status: " + jsonData.status + "</td>" +
            "<td>Year Built: " + jsonData.yearBuilt + "</td>" +
            "<td>Property Type: " + jsonData.type +
                ((jsonData.type == "Residential") ? (" (" + jsonData.subtype + ")") : "") + "</td></tr>" +
            "<tr><td>Beds: " + jsonData.bedrooms + "</td>" +
            "<td>Baths: " + jsonData.baths + "</td>" +
            "<td>Square Footage: " + jsonData.livingArea + "</td></tr>" +
            "<tr><td>Date Listed: " + jsonData.dateListed.substring(0,10) + "</td>" +
            "<td>Days on Market: " + jsonData.daysOnMarket + "</td>" +
            "<td>Original Price: $" + jsonData.originalPrice + "</td></tr>" +
            "<tr><td>Laundry: " + ((jsonData.laundry) ? jsonData.laundry : "") + "</td>" +
            "<td>Garage Spaces: " + jsonData.garageSpaces + "</td>" +
            "<td>Carport Spaces: " + jsonData.carportSpaces + "</td></tr>" +
            "<tr><td>Num. Floors: " + jsonData.stories + "</td>" +
            "<td>Total Floors: " + jsonData.storiesTotal + "</td>" +
            "<td>Units in Building: " + jsonData.unitsInBuilding + "</td></tr>" +
            "<tr><td>View: " + ((jsonData.view) ? jsonData.view : "") + "</td>" +
            "<td>County: " + jsonData.county + "</td>" +
            "<td>Subdivision: " + jsonData.subdivision + "</td></tr>" +
            "<tr><td>Cooling: " + ((jsonData.cooling) ? jsonData.cooling : "") + "</td>" +
            "<td>Heating: " + ((jsonData.heating) ? jsonData.heating : "") + "</td>" +
            "<td>Sewer: " + ((jsonData.sewer) ? jsonData.sewer : "") + "</td></tr>" +
            "<tr><td>Construction Materials: " +
                ((jsonData.constructionMaterials) ? jsonData.constructionMaterials : "") + "</td>" +
            "<td>Appliances: " + ((jsonData.appliances) ? jsonData.appliances : "") + "</td>" +
            "<td>Flooring: " + ((jsonData.flooring) ? jsonData.flooring : "") + "</td></tr>" +
            "<tr><td>Roof: " + ((jsonData.roof) ? jsonData.roof : "") + "</td>" +
            "<td>Fireplace: " + ((jsonData.fireplaceFeatures) ? jsonData.fireplaceFeatures : "") + "</td>" +
            "<td>Num. Fireplaces: " + jsonData.fireplaces + "</td></tr>" +
            "<tr><td>Water Source: " + ((jsonData.waterSource) ? jsonData.waterSource : "") + "</td>" +
            "<td>Telephone Service: " + ((jsonData.telephoneService) ? jsonData.telephoneService : "") + "</td>" +
            "<td>Gas: " + ((jsonData.gas) ? jsonData.gas : "") + "</td></tr>" +
            "<tr><td>Association Pool? " + ((jsonData.pool) ? "YES" : "NO") + "</td>" +
            "<td>Private Pool? " + ((jsonData.poolPrivate) ? "YES" : "NO") + "</td>" +
            "<td>Pool Features: " + ((jsonData.poolFeatures) ? jsonData.poolFeatures : "") + "</td></tr></table>";
}

    /*
        GET request for result page
    */
app.get('/process_get', function (req, res) {
        
            // Prepare output in JSON format
        response = {
            address_input: req.query.address_input
        };
        
        var html_code = "";
        
            // Check if address submitted from input matches any listing
        for(var i = 0; i < body.data.bundle.length; i++) {
                // An address matching the input was found, parse it to HTML via buildPage
            if(body.data.bundle[i].address == response.address_input) {
                html_code = buildPage(body.data.bundle[i]);
                console.log("A match was found.");
                break;
            }
        }
        
                // Address does not match any listings or an error occurred
        if(html_code == "") {
            html_code = "<h2>Sorry! The property you searched for could not be found!</h2>";
            console.log("A match was not found.");
        }

            // Write HTML to the page
        res.write("<!DOCTYPE html><html><head>" +
                  "<link rel=\"stylesheet\" type=\"text/css\" href=\"index.css\">" +
                  "</head><body><div id=\"gap\"></div><h1>Shayan's Searchable MLS</h1>" +
                  "<div id=\"gap\"></div>" + html_code + "</body></html>");
        res.end();
});

var server = app.listen(process.env.PORT || 8080, function () {
    console.log("Server set up; Listening...");
});
