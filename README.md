# Entertainment Event Search

## Overview

This project is a web application that allows users to search for entertainment events using the Ticketmaster API. The application displays event details, artist information, venue information, and upcoming events. It also supports adding events to favorites, removing them, and posting event info to Twitter. The frontend is built with HTML5, Bootstrap, Angular, and jQuery, while the backend is implemented using Node.js and Express.js. The application is deployed on Google Cloud App Engine.

## Features

- **AJAX and JSON:** Utilize AJAX for asynchronous data retrieval and JSON for data interchange between client and server.
- **Responsive Design:** Enhance user experience using Bootstrap for responsive web design.
- **Event Search:** Search for events using the Ticketmaster API and display results in a table.
- **Event Details:** Display detailed information about selected events, including artist info, venue details, and upcoming events.
- **Favorites Management:** Add or remove events from a favorites list, with persistence using local storage.
- **Social Sharing:** Share event information on Twitter.
- **Autocomplete:** Implemented using Ticketmaster's suggestion service and Angular Material.

## Technologies Used

### Frontend

- **HTML5**: For creating the structure of the web pages.
- **Bootstrap 4**: For responsive design and pre-styled components.
- **Angular 8+**: For building the single-page application and handling client-side logic.
- **jQuery**: For DOM manipulation and AJAX calls.
- **CSS**: For styling the application.

### Backend

- **Node.js**: For creating the server-side application.
- **Express.js**: For building the server and handling API requests.

### Deployment

- **Google Cloud App Engine**: For deploying the Node.js server and ensuring scalability and reliability.

### APIs

- **Ticketmaster API**: For fetching event data.
- **Spotify API**: For retrieving artist information.
- **Google Maps API**: For geocoding addresses and displaying maps.
- **Twitter API**: For enabling users to share event details on Twitter.

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm (v6+)
- Angular CLI (v10+)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sqz0914/entertainment-event-search.git
```
2. Navigate to the project directory:
```bash
cd entertainment-event-search
```
3. Install frontend dependencies:
```bash
cd client
npm install
```
4. Install backend dependencies:
```bash
cd ../server
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd server
node app.js
```
2. Start the frontend development server:
```bash
cd ../client
ng serve
```
3. Open your browser and navigate to `http://localhost:4200`.

## Usage

### Search Form

- **Keyword**: Required field with autocomplete functionality powered by Ticketmaster's suggestion service.
- **Category**: Dropdown to select event category.
Distance: Radius for the search area (default is 10 miles).
- **Location**: Option to use the current location or specify a different location.

### Event Search Results

- **Display**: Shows event details in a table with columns for date, event name, category, venue info, and a favorite button.
- **Sorting**: Events are sorted by date.
- **Details**: Click on an event name to view detailed information.

### Event Details

- **Tabs**: Contains tabs for event info, artist info, venue info, and upcoming events.
- **Info Tab**: Displays detailed event information.
Artist/Team Tab: Shows artist details using Spotify API.
- **Venue Tab**: Displays venue details and a map with the location.
- **Upcoming Events Tab**: Lists upcoming events related to the selected event.
  
### Favorites Management

- **Add to Favorites**: Click the star button to add an event to the favorites list.
- **Remove from Favorites**: Click the trash can button to remove an event from the favorites list.
- **Persistence**: Favorites are stored in the browser's local storage.


### Social Sharing

- **Twitter Button**: Share event information on Twitter.

### Autocomplete

- **Implemented**: Using Angular Material for the keyword input field.

## API Usage

### Ticketmaster API

- **Event Search**: Used to search for events based on user input.
- **Event Details**: Fetch detailed information about selected events.

### Spotify API

- **Artist Info**: Retrieve artist details based on event information.

### Google Maps API

- **Geocoding**: Convert addresses to geographic coordinates.
- **Maps**: Display venue location on a map.

### Twitter API

- **Web Intents**: Share event details on Twitter.

## Libraries and Tools

- **Moment.js**: For date and time manipulation.
Node-geohash: For geohash conversion.
- **Spotify Web API Node**: For integrating with the Spotify API.
- **Angular Google Maps**: For integrating Google Maps with Angular applications.
- **Bootstrap**: For responsive design and UI components.

## Acknowledgements
- [Ticketmaster API](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/)
- [Spotify API](https://developer.spotify.com/documentation/web-api/)
- [Google Maps API](https://developers.google.com/maps)
- [Twitter API](https://developer.twitter.com/en/docs/twitter-api)