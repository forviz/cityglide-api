const db = require('../config/db');
const _ = require('lodash');
const Response = require('./ResponseController');
const input = require('./InputController');

const getStopsByServices = async (routeId) => {
  const query = await db.select('locations.id', 'locations.stop_name as name', 'locations.stop_description as desc',
          'locations.latitude as lat', 'locations.longitude as lon', 'locations.locations_type_id as location-type')
          .from('routes_detail').where('routes_detail.routes_id', routeId)
          .whereNot('locations.locations_type_id', 1)
          .leftJoin('locations', 'routes_detail.locations_id', 'locations.id')
          .orderBy('routes_detail.priority', 'acs');
  return query;
};

const getServiceData = async (routeId) => {
  const qRout = await db.first('routes.routes_id as service-id', 'routes.routes_name as short-name',
          'routes.routes_detail as description', 'routes.routes_type_id as type', 'routes.routes_status as service-status')
          .from('routes').where('routes.routes_id', routeId);
  if (!qRout) {
    return false;
  }
  const qShape = await db.select('locations.stop_name', 'locations.latitude', ' locations.longitude', 'routes_detail.priority')
          .from('routes_detail').where('routes_detail.routes_id', routeId)
          .leftJoin('locations', 'routes_detail.locations_id', 'locations.id')
          .orderBy('routes_detail.priority', 'acs');
  const qStop = await getStopsByServices(routeId);
  const shape = _.map(qShape, (v) => {
    return _.map(v, (v2) => {
      return v2;
    }).join();
  });
  const nullData = {
    'long-name': '',
    'agency-id': '',
    url: '',
    color: '',
    'text-color': '',
  };
  return _.assign({}, qRout, nullData, { shape }, { stops: qStop });
};

exports.getService = async (req, res) => {
  try {
    const routeId = input.checkInputFormat('int', req.params.route_id, 'route-id');
    const qData = await getServiceData(routeId);
    const data = qData || {};
    res.status(200).json(Response.responseWithSuccess(data));
  } catch (e) {
    const err = Response.responseWithError(e);
    res.status(err.status).send(err);
  }
};

const loopRouteId = async (routeId) => {
  const results = [];
  const splitServiceId = routeId.split(',');
  for (const num of splitServiceId) {
    input.checkInputFormat('int', num, 'id');
    const queryWithReturn = getServiceData(num);
    if (queryWithReturn) {
      results.push(queryWithReturn);
    }
  }
  const promiseResult = await Promise.all(results);
  const removeFalse = _.compact(promiseResult);
  return removeFalse;
};

exports.getMultiService = async (req, res) => {
  try {
    const routeId = req.query.id;
    if (!routeId) {
      const eInvalid = {
        message: 400,
        eMessage: 'Parameter id is require',
      };
      throw eInvalid;
    }
    const results = await loopRouteId(routeId);
    res.status(200).json(Response.responseWithSuccess(results));
  } catch (e) {
    const err = Response.responseWithError(e);
    res.status(err.status).send(err);
  }
};

exports.getServiceStops = async (req, res) => {
  try {
    const routeId = input.checkInputFormat('int', req.params.route_id, 'route-id');
    const qStop = await getStopsByServices(routeId);
    res.status(200).json(Response.responseWithSuccess(qStop));
  } catch (e) {
    const err = Response.responseWithError(e);
    res.status(err.status).send(err);
  }
};
