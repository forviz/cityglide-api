/* eslint linebreak-style: ['error', 'windows'] */
/* eslint camelcase: 'error' */

const db = require('../config/db');
const _ = require('lodash');
const request = require('request');
const dotenv = require('dotenv');
const Response = require('./ResponseController');
const input = require('./InputController');

dotenv.config();
const callApiGoogle = (start, stop) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: 'https://maps.googleapis.com/maps/api/distancematrix/json',
      qs: {
        origins: start,
        destinations: stop,
        key: process.env.GOOGLE_APP_KEY,
        mode: 'transit',
        avoid: 'highways',
        transit_mode: 'bus',
        language: 'en',
      },
      headers: {
        'cache-control': 'no-cache',
      },
    };
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      }
      const jsonBody = JSON.parse(body);
      resolve(jsonBody);
    });
  });
};
exports.getTrips = async (req, res) => {
  try {
    let data = {};
    let _googleMap = {};
    const locationId = input.checkInputFormat('int', req.query.stop_id);
    const routeId = req.query.route_id;
    let condition = { 'routes_detail.locations_id': locationId };
    if (routeId) {
      input.checkInputFormat('int', routeId);
      condition = _.assign({}, condition, { 'routes_detail.routes_id': routeId });
    }

    const qPosition = await db.select('routes_detail.priority', 'locations.*',
            'routes.routes_id', 'routes.routes_name', 'routes.routes_type_id', 'routes_detail.routes_detail_station_priority',
            'service.service_latitude', 'service.service_longtitude', 'service.service_station_priority', 'service_id',
            'service.service_next_priority', 'service_last_update', 'service_start_station', 'service_line', 'service_number')
            .from('routes_detail').where(condition)
            .where('locations.locations_type_id', 2)
            .where('service.service_status', 'on')
            .whereNot('service.service_station_priority', 0)
            .leftJoin('locations', 'routes_detail.locations_id', 'locations.id')
            .leftJoin('routes', 'routes_detail.routes_id', 'routes.routes_id')
            .innerJoin('service', 'routes.routes_name', 'service.service_line')
            .orderBy('routes_detail.priority', 'asc');
    if (qPosition && qPosition.length > 0) {
// ******************** Call Api ******************** //
      const latLonStop = `${qPosition[0].latitude},${qPosition[0].longitude}`;
      const allLatLon = _.map(qPosition, (v) => {
        return `${v.service_latitude},${v.service_longtitude}`;
      });
      const latLonStart = _.join(allLatLon, '|');
      _googleMap = await callApiGoogle(latLonStart, latLonStop);
      // ******************** End Call Api ******************** //

      data = _.map(qPosition, (v, key) => {
        const googleMapDuration = _googleMap.rows[key].elements[0].duration.value;
        const arrival = (v.service_next_priority <= v.routes_detail_station_priority) ? googleMapDuration : 0;
        const departure = (v.service_next_priority <= v.routes_detail_station_priority) ? googleMapDuration : 0;
        const serviceStartStation = (v.service_start_station === 'inbound') ? 1 : 2;
        const trip = {
          id: 'NOT_AVAILABLE',
          'route-id': v.routes_id,
          'service-id': v.service_id,
          'trip-headsign': '',
          'trip-short-name': '',
          direction: serviceStartStation,
        };
        const vehicle = {
          id: v.service_id,
          label: v.service_line,
          'license-plate': v.service_number,
        };
        const stopTimeUpdate = [
          {
            'stop-sequence': v.routes_detail_station_priority,
            'stop-id': v.id,
            arrival,
            departure,
            distance: _googleMap.rows[key].elements[0].distance.value,
            'schedule-relationship': 'SCHEDULED',
          },
        ];
        const temp = {
          trip,
          vehicle,
          'stop-time-update': stopTimeUpdate,
          timestamp: Date.parse(v.service_last_update),
          delay: 0,
        };
        return temp;
      });
    }
    res.status(200).json(Response.responseWithSuccess(data));
  } catch (e) {
    const err = Response.responseWithError(e.message);
    res.status(err.status).send(err);
  }
};
exports.getVehicles = async (req, res) => {
  try {
    const vehicleId = input.checkInputFormat('int', req.params.vehicleId);
    let data = {};
    if (vehicleId) {
      const query = await db.first('*').where('service_id', vehicleId)
              .from('service');
      if (query) {
        data = {
          'trip-id': null,
          'vehicle-id': query.service_id,
          position: {
            lat: query.service_latitude,
            lng: query.service_longtitude,
          },
          'current-stop-sequence': null,
          'stop-id': null,
          'current-status': null,
          timestamp: Date.parse(query.service_last_update),
          'congestion-level': null,
          'occupancy-status': null,
        };
      }
    }
    res.status(200).json(Response.responseWithSuccess(data));
  } catch (e) {
    const err = Response.responseWithError(e.message);
    res.status(err.status).send(err);
  }
};
