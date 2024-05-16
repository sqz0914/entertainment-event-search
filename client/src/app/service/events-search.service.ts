import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class EventsSearchService {

  constructor() {}

  rootURL = 'https://hw8-80000.wl.r.appspot.com/api';

  async getEvents(keyword: string, category: string, radius: string, unit: string, location: string){
    keyword = keyword.trim().replace(/ +/g, '+');
    location = location.split(/[ ,]+/).join('+');
    let theURL = this.rootURL + '/search/keyword/'+ keyword + '/category/' + category + '/radius/' + radius + '/unit/' + unit + '/location/' + location;
    let result = await axios.get(theURL);
    return result.data;
  }

  async getLocalEvents(keyword: string, category: string, radius: string, unit: string, lat: string, lng: string){
    keyword = keyword.trim().replace(/ +/g, '+');
    let theURL = this.rootURL + '/search/keyword/'+ keyword + '/category/' + category + '/radius/' + radius + '/unit/' + unit + '/lat/' + lat + '/lng/' + lng;
    let result = await axios.get(theURL);
    return result.data;
  }

  async getEventDetail(eventId: string){
    let theURL = this.rootURL + '/detail/event/' + eventId;
    let result = await axios.get(theURL);
    return result.data;
  }

  async getArtistInfo(artist: string){
    artist = artist.trim().replace(/ +/g, '+');
    let theURL = this.rootURL + '/detail/artist/' + artist;
    let result = await axios.get(theURL);
    return result.data;
  }

  async getVenueDetail(venue: string){
    venue = venue.trim().replace(/ +/g, '+');
    let theURL = this.rootURL + '/detail/venue/' + venue;
    let result = await axios.get(theURL);
    return result.data;
  }

  async getSuggestedWord(keyword: string){
    keyword = keyword.trim().replace(/ +/g, '+');
    let theURL = this.rootURL + '/suggest/keyword/' + keyword;
    let result = await axios.get(theURL);
    return <any[]>result.data;
  }
}
