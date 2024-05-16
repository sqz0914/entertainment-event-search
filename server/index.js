const express = require('express');
const axios = require('axios');
const cors = require('cors');
const geohash = require('ngeohash');
const SpotifyWebApi = require('spotify-web-api-node');

const GOOGLE_API_KEY = YOUR_GOOGLE_API_KEY;
const TICKETMASTER_API_KEY = YOUR_TICKETMASTER_API_KEY;
const CLIENT_ID = YOUR_CLIENT_ID;
const CLIENT_SECRET = YOUR_CLIENT_SECRET_ID;

const app = express();
const PORT = 8080;

app.use(cors());

app.get('/', (req, res)=>{
    return res.send('apiServer');
})

app.get('/api/suggest/keyword/:keyword', async (req, res)=>{
    var keyword = req.params.keyword;
    var theURL = 'https://app.ticketmaster.com/discovery/v2/suggest?apikey=' + TICKETMASTER_API_KEY + '&keyword=' + keyword;
    var result;
    try{
        result = await axios.get(theURL);
    } catch(error){
        console.log(error);
        let emptyResult = [];
        return res.json(emptyResult);
    }
    try{
        var attraction = result.data._embedded.attractions;
        var nameList = [];
        for(var i = 0; i < attraction.length; i++){
            var name = attraction[i].name;
            nameList.push(name);
        }
        return res.status(200).json(nameList);
    } catch(error){
        console.log(error);
        let emptyResult = [];
        return res.json(emptyResult);
    }
})

app.get('/api/search/keyword/:keyword/category/:category/radius/:radius/unit/:unit/lat/:lat/lng/:lng', async (req, res)=>{
    var keyword = req.params.keyword;
    var category = req.params.category;
    var radius = req.params.radius;
    var unit = req.params.unit; // miles or km
    var lat = req.params.lat;
    var lng = req.params.lng;

    var geoPoint = geohash.encode(lat, lng);
    var segmentId = categoryToSegmentId(category);
    var theURL = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=' + TICKETMASTER_API_KEY + '&keyword=' + keyword + '&radius=' + radius + '&unit=' + unit + '&geoPoint=' + geoPoint + '&sort=date,asc';
    if(segmentId){
        theURL += ('&segmentId='+segmentId);
    }
    var result;
    try{
        result = await axios.get(theURL);
    } catch(error){
        console.log(error);
        return res.status(400).json({
            message: 'Failed to get search results'
        });      
    }
    var eventsList;
    if('_embedded' in result.data){
        var events = result.data._embedded.events;
        eventsList = extractEvents(events);
    }
    else{
        eventsList = [];
    }
    return res.status(200).json(eventsList);
})

app.get('/api/search/keyword/:keyword/category/:category/radius/:radius/unit/:unit/location/:location', async (req, res)=>{
    var keyword = req.params.keyword;
    var category = req.params.category;
    var radius = req.params.radius;
    var unit = req.params.unit;
    var location = req.params.location;

    var geoResult;
    var geoURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&key=' + GOOGLE_API_KEY;
    try{
        geoResult = await axios.get(geoURL);
    } catch(error){
        console.log(error);
        return res.status(400).json({
            message: 'Failed to get search results'
        });
    }

    var geoLocation = geoResult.data.results[0].geometry.location;
    var lat = geoLocation.lat;
    var lng = geoLocation.lng;

    var geoPoint = geohash.encode(lat, lng);
    var segmentId = categoryToSegmentId(category);
    var theURL = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=' + TICKETMASTER_API_KEY + '&keyword=' + keyword + '&radius=' + radius + '&unit=' + unit + '&geoPoint=' + geoPoint + '&sort=date,asc';
    if(segmentId){
        theURL += ('&segmentId='+segmentId);
    }
    var result;
    try{
        result = await axios.get(theURL);
    } catch(error){
        console.log(error);
        return res.status(400).json({
            message: 'Failed to get search results'
        });      
    }
    var eventsList;
    if('_embedded' in result.data){
        var events = result.data._embedded.events;
        eventsList = extractEvents(events);
    }
    else{
        eventsList = [];
    }
    return res.status(200).json(eventsList);
})

app.get('/api/detail/event/:eventId', async (req, res)=>{
    var eventId = req.params.eventId;
    var result;
    var theURL = 'https://app.ticketmaster.com/discovery/v2/events/' + eventId + '?apikey=' + TICKETMASTER_API_KEY;
    try{
        result = await axios.get(theURL);
    } catch(error){
        console.log(error);
        return res.status(400).json({
            message: 'Failed to get search results'
        });      
    }
    var eventDetail = extractDetail(result.data);
    return res.status(200).json(eventDetail);
})

app.get('/api/detail/artist/:artist', (req, res)=>{
    var artist = req.params.artist;
    artist = artist.replace('+', ' ');
    var spotifyApi = new SpotifyWebApi({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        redirectUri: 'http://www.example.com/callback'
      });
    spotifyApi.searchArtists(artist).then(
        function(data){
            try{
                var result = data.body.artists.items;
                var artistInfo = extractArtistInfo(artist, result);
                return res.json(artistInfo);
            } catch(error){
                var emptyInfo = {};
                return res.status(200).json(emptyInfo);
            }
        },
        function(err){
            spotifyApi.clientCredentialsGrant().then(
                function(data){
                    spotifyApi.setAccessToken(data.body['access_token']);
                    spotifyApi.searchArtists(artist).then(
                        function(data){
                            try{
                                var result = data.body.artists.items;
                                var artistInfo = extractArtistInfo(artist, result);
                                return res.status(200).json(artistInfo);
                            } catch(error){
                                var emptyInfo = {};
                                return res.status(200).json(emptyInfo);
                            }
                        },
                        function(err){
                            console.error(err);
                            return res.status(400).json({
                                message: 'Failed to get search results'
                            }); 
                        }
                    )
                },
                function(err){
                    console.log('Something went wrong when retrieving an access token', err);
                    return res.status(400).json({
                        message: 'Failed to get search results'
                    });  
                }
            )
        }
    )
})

app.get('/api/detail/venue/:venueName', async (req, res)=>{
    var venueName = req.params.venueName;
    var result;
    var theURL = 'https://app.ticketmaster.com/discovery/v2/venues.json?apikey=' + TICKETMASTER_API_KEY + '&keyword=' + venueName;
    try{
        result = await axios.get(theURL);
    } catch(error){
        console.log(error);
        return res.status(400).json({
            message: 'Failed to get search results'
        });      
    }
    var venue = result.data._embedded.venues[0];
    var venueDetail = extractVenueDetail(venue);
    return res.status(200).json(venueDetail);
})

app.listen(PORT, ()=>{
    console.log('server start', 'http://localhost:'+PORT);
})

/*** UTILITY FUNCTIONS ***/

function categoryToSegmentId(category){
    var segmentId = 'KZFzniwnSyZfZ7v7n';

    if(category == 'music'){
        segmentId += 'J';
    }
    else if(category == 'sports'){
        segmentId += 'E';
    }  
    else if(category == 'arts'){
        segmentId += 'a';
    }
    else if(category == 'film'){
        segmentId += 'n';
    } 
    else if(category == 'miscellaneous'){
        segmentId += '1';
    }
    else{
        segmentId = '';
    } 

    return segmentId;
}

function extractEvents(events){
    var eventList = [];
    var i = 1;

    for(const event of events){
        var eventObj = {};

        eventObj.number = i;
        i++;

        eventObj.favorite = false;

        var eventId = '';
        if('id' in event){
            eventId = event.id;
        }
        eventObj.id = eventId;

        var date = '';
        try{
            date = event.dates.start.localDate;
        } catch(error){
            date = 'N/A';
        }
        eventObj.date = date;

        var name = '';
        if('name' in event){
            name = event.name;
        }
        else{
            name = 'N/A';
        }
        eventObj.name = name;

        var category = '';
        try{
            var classifications = event.classifications[0];
            if(('subGenre' in classifications) && (classifications.subGenre.name != 'Undefined')){
                category += (classifications.subGenre.name+'|');
            }
            if(('genre' in classifications) && (classifications.genre.name != "Undefined")){
                category += (classifications.genre.name+'|');
            }
            if(('segment' in classifications) && (classifications.segment.name != "Undefined")){
                category += (classifications.segment.name+'|');
            } 
            if(('subType' in classifications) && (classifications.subType.name != "Undefined")){
                category += (classifications.subType.name+'|');
            }
            if(('type' in classifications) && (classifications.type.name != "Undefined")){
                category += (classifications.type.name+'|');
            }

            if(!category){
                category = 'N/A';
            }
            else{
                var sliceString = category.slice(0, -1);
                category = sliceString;
            }
        } catch(error){
            category = 'N/A';
        }
        eventObj.category = category;

        var venue = '';
        try{
            venue = event._embedded.venues[0].name;
        } catch(error){
            venue = 'N/A';
        }
        eventObj.venue = venue;
        eventList.push(eventObj);
    }

    return eventList;
}

function extractDetail(event){
    var detail = {};
    detail.name = event.name;

    detail.favorite = false;

    var eventId = '';
    if('id' in event){
        eventId = event.id;
    }
    detail.id = eventId;

    try{
        var artistTeamList = event._embedded.attractions;
        var artistTeam = '';
        for(const at of artistTeamList){
            artistTeam += (at.name+'|');
        }
        detail.artistTeam = artistTeam.slice(0, -1);
    } catch(error){}

    try{
        var venue = event._embedded.venues[0].name;
        detail.venue = venue;
    } catch(error){}

    try{
        var date = event.dates.start.localDate;
        detail.date = date;
    } catch(error){}

    try{
        var category = '';
        var classifications = event.classifications[0];
        if(('subGenre' in classifications) && (classifications.subGenre.name != 'Undefined')){
            category += (classifications.subGenre.name+'|');
        }
        if(('genre' in classifications) && (classifications.genre.name != "Undefined")){
            category += (classifications.genre.name+'|');
        }
        if(('segment' in classifications) && (classifications.segment.name != "Undefined")){
            category += (classifications.segment.name+'|');
        } 
        if(('subType' in classifications) && (classifications.subType.name != "Undefined")){
            category += (classifications.subType.name+'|');
        }
        if(('type' in classifications) && (classifications.type.name != "Undefined")){
            category += (classifications.type.name+'|');
        }

        if(category){
            detail.category = category.slice(0, -1);
        }
    } catch(error){}

    try{
        var prices = event.priceRanges[0];
        detail.priceRanges = prices.min.toString() + ' - ' + prices.max.toString();
    } catch(error){}

    try{
        var status = event.dates.status.code;
        detail.status = status.charAt(0).toUpperCase() + status.slice(1);
    } catch(error){}

    try{
        detail.buyTicket = event.url;
    } catch(error){}

    try{
        detail.seatMap = event.seatmap.staticUrl;
    } catch(error){}

    return detail;
}

function extractVenueDetail(venue){
    var detail = {};

    try{
        detail.address = venue.address.line1; 
    } catch(error){}

    try{
        detail.city = venue.city.name + ', ' + venue.state.name;
    } catch(error){}

    try{
        detail.phoneNumber = venue.boxOfficeInfo.phoneNumberDetail;
    } catch(error){}

    try{
        detail.openHours = venue.boxOfficeInfo.openHoursDetail;
    } catch(error){}

    try{
        detail.generalRule = venue.generalInfo.generalRule;
    } catch(error){}

    try{
        detail.childRule = venue.generalInfo.childRule;
    } catch(error){}

    try{
        detail.lat = venue.location.latitude;
    } catch(error){}

    try{
        detail.lng = venue.location.longitude;
    } catch(error){}
    
    return detail;
}

function extractArtistInfo(artist, items){
    var targetArtist = {};
    for(var item of items){
        if(item.name.trim().normalize() === artist.trim().normalize()){
            targetArtist = item;
        }
    }

    var artistInfo = {};
    
    try{
        artistInfo.name = targetArtist.name;
    } catch(error){}

    try{
        artistInfo.followers = targetArtist.followers.total.toLocaleString();
    } catch(error){}

    try{
        artistInfo.popularity = targetArtist.popularity.toString();
    } catch(error){}

    try{
        artistInfo.checkAt = targetArtist.external_urls.spotify;
    } catch(error){}

    return artistInfo;
}