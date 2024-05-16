import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { EventsSearchService } from './service/events-search.service';
import { HttpClient } from '@angular/common/http';
import axios from 'axios';
// import * as $ from 'jquery';
declare let $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  favoriteEvents;
  zoom = 12
  marker: any = {}
  center: google.maps.LatLngLiteral
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false
  }
  IPINFO_API_KEY = "34404dccf051af";
  venue = {};
  fetchUserLocation: boolean = false;
  emptyKeyword: boolean = false;
  invalidKeyword: boolean = false;
  emptyInputLocation: boolean = false;
  disableDetailButton: boolean = true;
  disableStarButton: boolean = true;
  noEventsRecord: boolean = false;
  eventsSearchError: boolean = false;
  eventDetailSearchError: boolean = false;
  artistSearchError: boolean = false;
  venueSearchError: boolean = false;
  recordEventSearch: boolean = false;
  userLat = '';
  userLng = '';
  searchForm: FormGroup;
  categories: string[] = ['All', 'Music', 'Sports', 'Arts & Theatre', 'Film', 'Miscellaneous'];
  units: string[] = ['Miles', 'Kilometers'];
  initialFormValue: any;

  constructor(public eventsSearch: EventsSearchService, public fb: FormBuilder, private http: HttpClient){
    this.searchForm = this.fb.group({
      keyword: new FormControl('', [
        Validators.required,
        forbiddenKeywordValidator(/(^[ ]+$)/)
      ]),
      category: new FormControl(''),
      distance: new FormControl('10'),
      unit: new FormControl(''),
      location: new FormControl('here'),
      inputLocation: new FormControl({value: '', disabled: true}),
    })
    this.searchForm.controls.category.setValue('All', {onlySelf: true});
    this.searchForm.controls.unit.setValue('Miles', {onlySelf: true});
    this.center = {
        lat: 30,
        lng: -110,
    }
    if(!localStorage.getItem(('favoriteEvents'))){
      localStorage.setItem('favoriteEvents',JSON.stringify([]));
    }
    this.favoriteEvents = JSON.parse(localStorage.getItem('favoriteEvents')!);
    this.fetchUserLocation = false;
  }

  enableLocationInput(){
    this.searchForm.controls.inputLocation.enable();
    this.searchForm.controls.inputLocation.setValidators([Validators.required]);
    this.searchForm.controls.inputLocation.updateValueAndValidity();
  }

  disableLocationInput(){
    this.searchForm.controls.inputLocation.disable();
  }

  async ngOnInit() {
    this.initialFormValue = this.searchForm.value;

    let theURL = 'https://ipinfo.io/?token=' + this.IPINFO_API_KEY;
    let result = await axios.get(theURL);
    let userLoc = result.data.loc.split(',');
    this.userLat = userLoc[0];
    this.userLng = userLoc[1];
    this.fetchUserLocation = true;
    this.emptyKeyword = false;
    this.invalidKeyword = false;
    this.emptyInputLocation = false;
    this.disableDetailButton = true;
    this.disableStarButton = true;
    this.noEventsRecord = false;
    this.eventsSearchError = false;
    this.eventDetailSearchError = false;
    this.artistSearchError = false;
    this.venueSearchError = false;
    this.recordEventSearch = false;
    this.events = [];
    this.eventDetail = {};
    this.artistDetail = [];
    this.venueDetail = {};
    $("#eventDetailsContent").hide();
    $("#pills-tabContent").hide();
    $("#progressBar").hide();
  }
  
  events: any[] = [];

  async onSubmit() {
    if(this.searchForm.valid){
      $("#pills-tabContent").hide();
      $("#eventDetailsContent").hide();
      $("#progressBar").show();

      this.emptyKeyword = false;
      this.invalidKeyword = false;
      this.emptyInputLocation = false;
      this.eventsSearchError = false;
      this.noEventsRecord = false;
      this.recordEventSearch = false;
      this.events = [];

      let formValues = this.searchForm.value;
      let keyword = formValues.keyword;
      let category = processCategory(formValues.category);
      let distance = formValues.distance;
      let unit = processUnit(formValues.unit);
      let location = formValues.location;

      if(location == 'here'){
        try{
          this.events = await this.eventsSearch.getLocalEvents(keyword, category, distance, unit, this.userLat, this.userLng);
          if(this.events.length === 0){
            this.noEventsRecord = true;
          }
          else{
            let savedFavoriteEvents = JSON.parse(localStorage.getItem('favoriteEvents')!);
            for(let event of this.events){
              for(let savedEvent of savedFavoriteEvents){
                if(event.id == savedEvent.id){
                  event.favorite = true;
                }
              }
            }
          }
        } catch(error){
          this.eventsSearchError = true;
        }
      }
      else{
        let locationText = formValues.inputLocation;
        try{
          this.events = await this.eventsSearch.getEvents(keyword, category, distance, unit, locationText);
          if(this.events.length === 0){
            this.noEventsRecord = true;
          }
          else{
            let savedFavoriteEvents = JSON.parse(localStorage.getItem('favoriteEvents')!);
            for(let event of this.events){
              for(let savedEvent of savedFavoriteEvents){
                if(event.id == savedEvent.id){
                  event.favorite = true;
                }
              }
            }
          }
        } catch(error){
          this.eventsSearchError = true;
        }
      }
      // console.log(this.events);
      this.recordEventSearch = true;
      $("#progressBar").hide();
      $("#pills-tabContent").show();
      $("#eventDetailsContent").hide();
    }
    else{
      if(this.searchForm.controls.keyword.errors?.required){
        this.emptyKeyword = true;
        this.invalidKeyword = false;
      }
      if(this.searchForm.controls.keyword.errors?.forbiddenKeyword){
        this.invalidKeyword = true;
        this.emptyKeyword = false;
      }
      if(this.searchForm.controls.inputLocation.errors?.required){
        this.emptyInputLocation = true;
      }
    }
  }

  eventDetail: any = {};
  artistDetail: any[] = [];
  venueDetail: any = {};

  async searchEventDetail(event: any){
    let eventId = event.id;

    this.eventDetail = {};
    this.artistDetail = [];
    this.venueDetail = {};
    this.disableDetailButton = false;
    this.disableStarButton = true;
    this.eventDetailSearchError = false;
    this.artistSearchError = false;
    this.venueSearchError = false;
    
    try{
      this.eventDetail = await this.eventsSearch.getEventDetail(eventId);
      this.eventDetail.favorite = event.favorite;
      this.showEventDetails();
      // console.log(this.eventDetail);
    } catch(error){
      this.eventDetailSearchError = true;
    }
    if(this.eventDetail.hasOwnProperty('artistTeam')){
      let artistTeamList = this.eventDetail.artistTeam.split('|');
      try{
        for(const artist of artistTeamList){
          let result = await this.eventsSearch.getArtistInfo(artist);
          let artistInfo = {'name': artist, 'info': result};
          this.artistDetail.push(artistInfo);
        }
      } catch(error){
        console.log(error);
        this.artistSearchError = true;
      }
    }
    if(this.eventDetail.hasOwnProperty('venue')){
      let venueName = this.eventDetail.venue;
      try{
        this.venueDetail = await this.eventsSearch.getVenueDetail(venueName);
        // console.log(this.venueDetail);
        if(this.venueDetail.hasOwnProperty('lat') && this.venueDetail.hasOwnProperty('lng')){
          let venueLat = parseFloat(this.venueDetail.lat);
          let venueLng = parseFloat(this.venueDetail.lng);
          this.center = {
            lat: venueLat,
            lng: venueLng
          }
          this.marker = {
            position: {
              lat: this.center.lat,
              lng: this.center.lng,
            },
            label: {
              color: 'red',
            },
          }
        }
      } catch(error){
        console.log(error);
        this.venueSearchError = true;
      }
    }
    this.disableStarButton = false;
  }

  clearWindow(){
    this.searchForm.reset(this.initialFormValue);
    this.searchForm.controls.category.setValue('All', {onlySelf: true});
    this.searchForm.controls.unit.setValue('Miles', {onlySelf: true});
    this.searchForm.controls.inputLocation.disable();

    this.emptyKeyword = false;
    this.invalidKeyword = false;
    this.emptyInputLocation = false;
    this.disableDetailButton = true;
    this.disableStarButton = true;
    this.noEventsRecord = false;
    this.eventsSearchError = false;
    this.eventDetailSearchError = false;
    this.artistSearchError = false;
    this.venueSearchError = false;
    this.recordEventSearch = false;
    this.events = [];
    this.eventDetail = {};
    this.artistDetail = [];
    this.venueDetail = {};
    $("#eventDetailsContent").hide();
    $("#pills-tabContent").hide();
    $("#progressBar").hide();
  }

  saveFavoriteEvent(event: any){
    // console.log(event);
    let savedFavoriteEvents = JSON.parse(localStorage.getItem('favoriteEvents')!);
    // console.log(savedFavoriteEvents);
    let eventId = event.id;
    var existed = false;
    for(let savedEvent of savedFavoriteEvents){
      if(event.id == savedEvent.id){
        existed = true;
      }
    }
    if(existed){
      let index = savedFavoriteEvents.findIndex(function(x:any) {return x.id == eventId});
      savedFavoriteEvents.splice(index, 1);
      event.favorite = false;
      for(let eventOuter of this.events){
        if(eventOuter.id == eventId){
          eventOuter.favorite = false;
        }
      }
      if(!this.isEmptyObj(this.eventDetail)){
        if(this.eventDetail.id == eventId){
          this.eventDetail.favorite = false;
        }
      }
    }
    else{
      savedFavoriteEvents.push(event);
      event.favorite = true;
      for(let eventOuter of this.events){
        if(eventOuter.id == eventId){
          eventOuter.favorite = true;
        }
      }
    }
    this.favoriteEvents = savedFavoriteEvents;
    // console.log(this.favoriteEvents);
    localStorage.setItem('favoriteEvents', JSON.stringify(savedFavoriteEvents));
  }

  deleteFavoriteEvent(event: any){
    let savedFavoriteEvents = JSON.parse(localStorage.getItem('favoriteEvents')!);
    let eventId = event.id;
    let index = savedFavoriteEvents.findIndex(function(x:any) {return x.id == eventId});
    savedFavoriteEvents.splice(index, 1);
    for(let eventOuter of this.events){
      if(eventOuter.id == eventId){
        eventOuter.favorite = false;
      }
    }
    if(!this.isEmptyObj(this.eventDetail)){
      if(this.eventDetail.id == eventId){
        this.eventDetail.favorite = false;
      }
    }
    this.favoriteEvents = savedFavoriteEvents;
    localStorage.setItem('favoriteEvents', JSON.stringify(savedFavoriteEvents));
  }

  showEventDetails(){
    $("#pills-tabContent").hide();
    $("#eventDetailsContent").show("slide", {direction:"left"}, 500);
  }

  showSearchResultsAndFavorite(){
    $("#eventDetailsContent").hide();
    $("#pills-tabContent").show("slide", {direction:"right"}, 500);
  }

  showFavoriteTab(){
    $("#eventDetailsContent").hide();
    $("#pills-tabContent").show();
  }

  showResultTab(){
    $("#eventDetailsContent").hide();
    if(this.recordEventSearch){
      $("#pills-tabContent").show();
    }
    else{
      $("#pills-tabContent").hide();
    }
  }

  isEmptyObj(obj: any) {
    return Object.keys(obj).length === 0;
  }
}

function forbiddenKeywordValidator(keywordRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = keywordRe.test(control.value);
    return forbidden ? {forbiddenKeyword: {value: control.value}} : null;
  };
}

function processCategory(category: string){
  let categoryForSearch;
  if(category === 'Music'){
    categoryForSearch = 'music';
  } else if(category === 'Sports'){
    categoryForSearch = 'sports';
  } else if(category === 'Arts & Theatre'){
    categoryForSearch = 'arts';
  } else if(category === 'Film'){
    categoryForSearch = 'film';
  } else if(category === 'Miscellaneous'){
    categoryForSearch = 'miscellaneous';
  } else{
    categoryForSearch = 'all';
  }
  return categoryForSearch;
}

function processUnit(unit: string){
  let unitForSearch;
  if(unit === 'Kilometers'){
    unitForSearch = 'km';
  } else{
    unitForSearch = 'miles';
  }
  return unitForSearch;
}
