const db = require('../config/db');
const _ = require('lodash');

exports.getMultiStop = async (req, res, next) => {
  let data = {};
  let results = [];
  try {
    const id = req.query.id;
    if (id) {
      results = await db.select('locations.id', 'locations.stop_name as name', 'locations.stop_description as desc', 'locations.latitude as lat', 'locations.longitude as lon', 'locations.locations_type_id as location-type')
              .from('locations').whereIn('id', id.split(','));
      data = {
        data: results
      }
    }
    res.status(200).json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};
exports.getStop = async (req, res, next) => {
  let data = {};
  let results = [];
  try {
    const id = req.params.stop_id;
    if (id) {
      results = await db.first('locations.id', 'locations.stop_name as name', 'locations.stop_description as desc', 'locations.latitude as lat', 'locations.longitude as lon', 'locations.locations_type_id as location-type')
              .from('locations').where('id', id);
      data = {
        data: results
      }
    }
    res.status(200).json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

exports.getStopNearBySearch = async (req, res, next) => {
  const radius = req.query.radius
  const lat = req.query.lat;
  const lon = req.query.lon;
  const distance = 6371 * 1000; // convert km to m;
  let data = {};
  let results = [];
  if (radius && lat && lon) {
    results = await db.select('locations.id', 'locations.stop_name as name', 'locations.stop_description as desc', 'locations.latitude as lat', 'locations.longitude as lon', 'locations.locations_type_id as location-type', db.raw('(' + distance + ' * acos(cos(radians(' + lat + ')) * cos(radians(latitude)) * cos(radians(longitude) - radians(' + lon + ')) + sin(radians(' + lat + ')) * sin(radians(latitude )))) AS distance'))
            .from('locations')
            .orderBy('distance', 'asc')
            .whereNot('locations.locations_type_id', 1)
            .having('distance', '<', radius);
    data = {
      data: results
    }
  }
  res.status(200).json(data);
};
