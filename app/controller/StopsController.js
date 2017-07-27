const db = require('../config/db');
const _ = require('lodash');
const Response = require('./ResponseController');
const input = require('./InputController');

exports.getMultiStop = async (req, res) => {
  let results = [];
  try {
    const id = req.query.id;
    if (id) {
      // ************************* Check Input ************************* //
      _.forEach(id.split(','), (v) => {
        input.checkInputFormat('int', v, 'id');
      });
      // ************************* End Check Input ************************* //
      results = await db.select('locations.id', 'locations.stop_name as name', 'locations.stop_description as desc',
              'locations.latitude as lat', 'locations.longitude as lon', 'locations.locations_type_id as location-type')
              .from('locations')
              .whereIn('id', id.split(','));
    } else {
      const eInvalid = {
        message: 400,
        eMessage: 'Parameter id is require',
      };
      throw eInvalid;
    }
    res.status(200).json(Response.responseWithSuccess(results));
  } catch (e) {
    const err = Response.responseWithError(e);
    res.status(err.status).send(err);
  }
};

exports.getStop = async (req, res) => {
  let results = [];
  try {
    const id = input.checkInputFormat('int', req.params.stop_id, 'stop-id');
    if (id) {
      results = await db.first('locations.id', 'locations.stop_name as name', 'locations.stop_description as desc',
              'locations.latitude as lat', 'locations.longitude as lon', 'locations.locations_type_id as location-type')
              .from('locations')
              .where('id', id);
    }
    const data = results || {};
    res.status(200).json(Response.responseWithSuccess(data));
  } catch (e) {
    const err = Response.responseWithError(e);
    res.status(400).send(err);
  }
};

exports.getStopNearBySearch = async (req, res) => {
  try {
    const location = req.query.location;
    if (!location) {
      const eInvalid = {
        message: 400,
        eMessage: 'Parameter location is require',
      };
      throw eInvalid;
    }
    const radius = input.checkInputFormat('float', req.query.radius, 'radius');
    const locationArray = location.split(',');
    const lat = input.checkInputFormat('float', locationArray[0], 'lat');
    const lon = input.checkInputFormat('float', locationArray[1], 'lon');
    const distance = 6371 * 1000; // convert km to m;

    let results = [];
    if (radius && lat && lon) {
      const queryLocation = await db.select('locations.id', 'locations.stop_name as name', 'locations.stop_description as desc',
              'locations.latitude as lat', 'locations.longitude as lon', 'locations.locations_type_id as location-type',
              db.raw(`(${distance} * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lon})) +
      sin(radians(${lat})) * sin(radians(latitude )))) AS distance`))
              .from('locations')
              .orderBy('distance', 'asc')
              .whereNot('locations.locations_type_id', 1)
              .having('distance', '<', radius);
      const locationId = _.map(queryLocation, v => v.id);

      results = await db.select('routes_detail.locations_id', 'locations.id', 'locations.stop_name as name',
              'locations.stop_description as desc', 'locations.latitude as lat', 'locations.longitude as lon',
              'locations.locations_type_id as location-type')
              .from('routes_detail')
              .leftJoin('locations', 'routes_detail.locations_id', 'locations.id')
              .leftJoin('routes', 'routes_detail.routes_id', 'routes.routes_id')
              .whereNot('routes_detail.routes_detail_station_priority', 0)
              .whereNot('locations.locations_type_id', 1)
              .where('routes.routes_status', 'on')
              .whereIn('locations.id', locationId)
              .groupBy('routes_detail.locations_id');
    }
    res.status(200).json(Response.responseWithSuccess(results));
  } catch (e) {
    const err = Response.responseWithError(e);
    res.status(err.status).send(err);
  }
};
