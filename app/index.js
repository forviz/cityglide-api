const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routesController = require('./controller/RoutesController');
const stopsController = require('./controller/StopsController');
const realtimeController = require('./controller/RealtimeController');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.send('hello world!!!')
});

const apiPrefix = '/v1';
 
app.get(`${apiPrefix}/routes/`, routesController.getMultiService);
app.get(`${apiPrefix}/routes/:route_id`, routesController.getService);
app.get(`${apiPrefix}/routes/:route_id/stops`, routesController.getServiceStops);

app.get(`${apiPrefix}/stops`, stopsController.getMultiStop);
app.get(`${apiPrefix}/stops/nearbysearch`, stopsController.getStopNearBySearch);
app.get(`${apiPrefix}/stops/:stop_id`, stopsController.getStop);

app.get(`${apiPrefix}/trip/:route_id`, routesController.getService);

app.get(`${apiPrefix}/realtime/trips`, realtimeController.getTrips);
app.get(`${apiPrefix}/realtime/vehicles/:vehicleId`, realtimeController.getVehicles);

app.listen(3000, () => {
  console.log('รันดุ๊'); 
});

