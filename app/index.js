/* eslint linebreak-style: ['error', 'windows'] */
/* eslint camelcase: 'error' */

const bodyParser = require('body-parser');
const routesController = require('./controller/RoutesController');
const stopsController = require('./controller/StopsController');
const realtimeController = require('./controller/RealtimeController');
const Response = require('./controller/ResponseController');
const express = require('express');

const app = express();
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const apiPrefix = '/v1';

const rountNotMethodAllow = (req, res) => {
  const err = Response.responseWithError(405);
  res.status(err.status).send(err);
};

app.get(`${apiPrefix}/routes/`, routesController.getMultiService);
app.get(`${apiPrefix}/routes/:route_id`, routesController.getService);
app.get(`${apiPrefix}/routes/:route_id/stops`, routesController.getServiceStops);

app.get(`${apiPrefix}/stops`, stopsController.getMultiStop);
app.get(`${apiPrefix}/stops/nearbysearch`, stopsController.getStopNearBySearch);
app.get(`${apiPrefix}/stops/:stop_id`, stopsController.getStop);

app.get(`${apiPrefix}/trip/:route_id`, routesController.getService);

app.get(`${apiPrefix}/realtime/trips`, realtimeController.getTrips);
app.get(`${apiPrefix}/realtime/vehicles/:vehicleId`, realtimeController.getVehicles);

// ************************** Method Not Aloow ************************** //
app.all(`${apiPrefix}/routes/`, rountNotMethodAllow);
app.all(`${apiPrefix}/routes/:route_id`, rountNotMethodAllow);
app.all(`${apiPrefix}/routes/:route_id/stops`, rountNotMethodAllow);

app.all(`${apiPrefix}/stops`, rountNotMethodAllow);
app.all(`${apiPrefix}/stops/nearbysearch`, rountNotMethodAllow);
app.all(`${apiPrefix}/stops/:stop_id`, rountNotMethodAllow);

app.all(`${apiPrefix}/trip/:route_id`, rountNotMethodAllow);

app.all(`${apiPrefix}/realtime/trips`, rountNotMethodAllow);
app.all(`${apiPrefix}/realtime/vehicles/:vehicleId`, rountNotMethodAllow);

// ************************** End Method Not Aloow ************************** //

// ************************** Set Url 404 ************************** //
app.use((req, res) => {
  const err = Response.responseWithError(404);
  res.status(err.status).send(err);
});
// ************************** End Set Url 404 ************************** //


app.listen(app.get('port'), () => {
  console.log('รันดุ๊');
});

module.exports = app;
