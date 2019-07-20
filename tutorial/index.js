'use strict';

const cors = require('cors');
const express = require('express');
const smartcar = require('smartcar');

const app = express()
  .use(cors());
const port = 8000;

// TODO: Authorization Step 1a: Launch Smartcar authentication dialog
const client = new smartcar.AuthClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
  scope: ['required:read_vehicle_info'],
  testMode: true
});

// global variable to save our accessToken
let access;

app.get('/login', function(req, res) {
  // TODO: Authorization Step 1b: Launch Smartcar authentication dialog
  const link = client.getAuthUrl();
  res.redirect(link);
});

app.get('/exchange', function(req, res) {
  // TODO: Authorization Step 3: Handle Smartcar response
  const code = req.query.code;
  // console.log(code);
  // res.sendStatus(200);
  // TODO: Request Step 1: Obtain an access token
  return client.exchangeCode(code)
         .then(function(_access) {
           // in a production app you'll want to store this in some kind of persistent storage
           // access token is valid for 2 hours
           access = _access;
           res.sendStatus(200);
         });
});

app.get('/vehicle', function(req, res) {
  // TODO: Request Step 2: Get vehicle ids
  return smartcar.getVehicleIds(access.accessToken)
         .then(function(data) {
           return data.vehicles; // list of vehicle ids
         })
  // TODO: Request Step 3: Create a vehicle
         .then(function(vehicleIds) {
           const vehicle = new smartcar.Vehicle(vehicleIds[0], access.accessToken);
           return vehicle.info();
         })
  // TODO: Request Step 4: Make a request to Smartcar API
         .then(function(info) {
           console.log(info);
           // {
           //   id,
           //   make,
           //   model,
           //   year
           //  }
           res.json(info);
         })
});

app.listen(port, () => console.log(`Listening on port ${port}`));
