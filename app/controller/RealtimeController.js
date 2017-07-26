const db = require('../config/db');
const _ = require('lodash');
const request = require('request');
const dotenv = require('dotenv');
const Response = require('./ResponseController');
const input = require('./InputController');
const moment = require('moment');

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
      const jsonBody = JSON.parse(body);
      if (jsonBody.error_message) {
        reject({
          message: 401,
          eMessage: jsonBody.error_message,
        });
      } else {
        resolve(jsonBody);
      }
    });
  });
};

const loopRouteId = async (routeId) => {
  const endStationResults = await db.select('*').from('routes_detail').whereIn('routes_id', routeId)
          .whereNot('routes_detail.routes_detail_station_priority', 0)
          .leftJoin('locations', 'routes_detail.locations_id', 'locations.id')
          .orderBy('routes_detail_station_priority', 'desc');
  return endStationResults;
};

exports.getTrips = async (req, res) => {
  try {
    let data = {};
    let _googleMap = {};
    const locationId = input.checkInputFormat('int', req.query['arriving-at'], 'arriving-at');
    const routeId = req.query['route-id'];
    let condition = {
      'routes_detail.locations_id': locationId,
    };
    if (routeId) {
      input.checkInputFormat('int', routeId, 'route-id');
      condition = _.assign({}, condition, {
        'routes_detail.routes_id': routeId,
      });
    }

    const qPosition = await db.select('routes_detail.priority', 'locations.*',
            'routes.routes_id', 'routes.routes_name', 'routes.routes_detail', 'routes.routes_type_id', 'routes_detail.routes_detail_station_priority',
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
      const _routeID = _.sortedUniqBy(qPosition, (_q) => {
        return _q.routes_id;
      });
      const routeIDArray = _.map(_routeID, (e) => {
        return e.routes_id;
      });
      const endStationResults = await loopRouteId(routeIDArray);
// ******************** Call Api ******************** //
      const latLonStop = `${qPosition[0].latitude},${qPosition[0].longitude}`;
      const allLatLon = _.map(qPosition, (v) => {
        return `${v.service_latitude},${v.service_longtitude}`;
      });
      const latLonStart = _.join(allLatLon, '|');
      _googleMap = await callApiGoogle(latLonStart, latLonStop);
      // ******************** End Call Api ******************** //

      data = _.map(qPosition, (v, key) => {
        let tripResults = null;
        const googleMapDuration = _.get(_googleMap, `rows.${key}.elements.0.duration.value`);
        const arrival = (v.service_next_priority <= v.routes_detail_station_priority) ?
                parseInt(moment(v.service_last_update).add(googleMapDuration, 's').format('X'), 10) : 0;
        const departure = (v.service_next_priority > v.routes_detail_station_priority) ?
                parseInt(moment(v.service_last_update).subtract(googleMapDuration, 's').format('X'), 10) : 0;
        const serviceStartStation = (v.service_start_station === 'inbound') ? 1 : 2;
        if (serviceStartStation === v.routes_type_id) {
          const endStationKey = _.findIndex(endStationResults, (o) => {
            return o.routes_id === v.routes_id;
          });
          const endStationName = (endStationKey >= 0) ? endStationResults[endStationKey].stop_name : '';

          const trip = {
            id: 'NOT_AVAILABLE',
            'route-id': v.routes_id,
            'service-id': v.service_id,
            'trip-headsign': endStationName,
            'trip-short-name': v.routes_detail,
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
              distance: _.get(_googleMap, `rows.${key}.elements.0.distance.value`),
              'schedule-relationship': 'SCHEDULED',
            },
          ];
          tripResults = {
            trip,
            vehicle,
            'stop-time-update': stopTimeUpdate,
            timestamp: parseInt(moment(v.service_last_update).format('X'), 10),
            delay: 0,
          };
        }
        return tripResults;
      });
    }
    res.status(200).json(Response.responseWithSuccess(_.compact(data)));
  } catch (e) {
    const err = Response.responseWithError(e);
    res.status(err.status).send(err);
  }
};
exports.getVehicles = async (req, res) => {
  try {
    const vehicleId = input.checkInputFormat('int', req.params.vehicleId, 'vehicleId');
    let data = {};
    if (vehicleId) {
      const query = await db.first('service.*').where('service_id', vehicleId)
              .from('service');
      if (query) {
        const currentStatus = (query.service_status === 'on') ? 'IN_TRANSIT_TO' : 'STOPPED_AT';
        const serviceStartStation = (query.service_start_station === 'inbound') ? 1 : 2;

        const queryCurrentStop = await db.first('routes_detail.*').from('routes')
                .leftJoin('service', 'routes.routes_name', 'service.service_line')
                .leftJoin('routes_detail', 'routes.routes_id', 'routes_detail.routes_id')
                .where({
                  'service.service_id': query.service_id,
                  'routes.routes_type_id': serviceStartStation,
                  'routes_detail.routes_detail_station_priority': query.service_next_priority,
                });
        const stopID = (queryCurrentStop) ? queryCurrentStop.locations_id : 0;

        data = {
          'trip-id': 'NOT_AVAILABLE',
          'vehicle-id': query.service_id,
          position: {
            lat: query.service_latitude,
            lng: query.service_longtitude,
          },
          'current-stop-sequence': parseInt(query.service_next_priority, 10),
          'stop-id': stopID,
          'current-status': currentStatus,
          timestamp: parseInt(moment(query.service_last_update).format('X'), 10),
          'congestion-level': null,
          'occupancy-status': null,
        };
      }
    }
    res.status(200).json(Response.responseWithSuccess(data));
  } catch (e) {
    const err = Response.responseWithError(e);
    res.status(err.status).send(err);
  }
};
