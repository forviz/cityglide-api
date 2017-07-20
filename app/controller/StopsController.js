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
        input.checkInputFormat('int', v);
      });
      // ************************* End Check Input ************************* //
      results = await db.select('locations.id', 'locations.stop_name as name', 'locations.stop_description as desc',
      'locations.latitude as lat', 'locations.longitude as lon', 'locations.locations_type_id as location-type')
              .from('locations')
              .whereIn('id', id.split(','));
    }
    res.status(200).json(Response.responseWithSuccess(results));
  } catch (e) {
    const err = Response.responseWithError(e.message);
    res.status(err.status).send(err);
  }
};

exports.getStop = async (req, res) => {
  let results = [];
  try {
    const id = input.checkInputFormat('int', req.params.stop_id);
    if (id) {
      results = await db.first('locations.id', 'locations.stop_name as name', 'locations.stop_description as desc',
      'locations.latitude as lat', 'locations.longitude as lon', 'locations.locations_type_id as location-type')
              .from('locations')
              .where('id', id);
    }
    const data = results || {};
    res.status(200).json(Response.responseWithSuccess(data));
  } catch (e) {
    const err = Response.responseWithError(e.message);
    res.status(400).send(err);
  }
};

exports.getStopNearBySearch = async (req, res) => {
  try {
    const radius = input.checkInputFormat('float', req.query.radius);
    const lat = input.checkInputFormat('float', req.query.lat);
    const lon = input.checkInputFormat('float', req.query.lon);
    const distance = 6371 * 1000; // convert km to m;

    let results = [];
    if (radius && lat && lon) {
      results = await db.select('locations.id', 'locations.stop_name as name', 'locations.stop_description as desc',
      'locations.latitude as lat', 'locations.longitude as lon', 'locations.locations_type_id as location-type',
      db.raw(`(${distance} * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lon})) +
      sin(radians(${lat})) * sin(radians(latitude )))) AS distance`))
              .from('locations')
              .orderBy('distance', 'asc')
              .whereNot('locations.locations_type_id', 1)
              .having('distance', '<', radius);
    }
    const data = results || {};
    res.status(200).json(Response.responseWithSuccess(data));
  } catch (e) {
    const err = Response.responseWithError(e.message);
    res.status(err.status).send(err);
  }
};
