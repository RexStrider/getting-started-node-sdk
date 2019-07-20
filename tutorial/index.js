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

app.get('/login', (req, res) => {
  // TODO: Authorization Step 1b: Launch Smartcar authentication dialog
  const link = client.getAuthUrl();
  res.redirect(link);
});

app.get('/exchange', async (req, res) => {
  // TODO: Authorization Step 3: Handle Smartcar response
  const code = req.query.code;
  access = await client.exchangeCode(code);
  res.sendStatus(200);
});

app.get('/vehicle', async (req, res) => {
  const data = await smartcar.getVehicleIds(access.accessToken);
  const vehicleIds = await data.vehicles;
  const vehicle = new smartcar.Vehicle(vehicleIds[0], access.accessToken);
  const info = await vehicle.info();
  console.log(info);
  res.json(info);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
