const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routesController = require('./controller/RoutesController');
const stopsController = require('./controller/StopsController');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.send('hello world!!!')
});
//app.get('/v1', routesController.getAllEntries);

const apiPrefix = '/v1';
 
app.get(`${apiPrefix}/routes/`, routesController.getMultiService);
app.get(`${apiPrefix}/routes/:route_id`, routesController.getService);
//app.get(`${apiPrefix}/services/:service_id`, routesController.test);
app.get(`${apiPrefix}/routes/:route_id/stops`, routesController.getServiceStops);

app.get(`${apiPrefix}/stops`, stopsController.getMultiStop);
app.get(`${apiPrefix}/stops/nearbysearch`, stopsController.getStopNearBySearch);
app.get(`${apiPrefix}/stops/:stop_id`, stopsController.getStop);

app.get(`${apiPrefix}/trip/:route_id`, routesController.getService);

app.listen(3000, () => {
  console.log('example app lisr'); 
});

module.exports = app;

