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

## Project Structure

```plaintext
entertainment-event-search/
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── app.component.html
│   │   │   ├── app.component.ts
│   │   │   ├── app.module.ts
│   │   │   └── ...
│   │   ├── assets/
│   │   ├── environments/
│   │   ├── index.html
│   │   └── styles.css
│   ├── angular.json
│   ├── package.json
│   └── ...
│
├── server/
│   ├── routes/
│   │   ├── events.js
│   │   ├── artists.js
│   │   ├── venue.js
│   │   └── ...
│   ├── app.js
│   ├── package.json
│   └── ...
│
├── README.md
└── ...
