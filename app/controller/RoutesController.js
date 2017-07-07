const db = require('../config/db');
const _ = require('lodash');

const getStopsByServices = async (route_id) => {
  return await db.select('locations.id', 'locations.stop_name as name', 'locations.stop_description as desc', 'locations.latitude as lat', 'locations.longitude as lon', 'locations.locations_type_id as location-type')
          .from('routes_detail').where('routes_detail.routes_id', route_id).whereNot('locations.locations_type_id', 1)
          .leftJoin('locations', 'routes_detail.locations_id', 'locations.id').orderBy('routes_detail.priority', 'acs');
};

const getServiceData = async (route_id) => {
  const qRout = await db.first('routes.routes_id as service-id', 'routes.routes_name as short-name', 'routes.routes_detail as description', 'routes.routes_type_id as type', 'routes.routes_status as service-status')
          .from('routes').where('routes.routes_id', route_id);
  if (qRout) {
    const qShape = await db.select('locations.stop_name', 'locations.latitude', ' locations.longitude', 'routes_detail.priority')
            .from('routes_detail').where('routes_detail.routes_id', route_id)
            .leftJoin('locations', 'routes_detail.locations_id', 'locations.id').orderBy('routes_detail.priority', 'acs');
    const qStop = await getStopsByServices(route_id);
    const shape = _.map(qShape, (v, i) => {
      return _.map(v, (v2, i2) => {
        return v2;
      }).join();
    });
    const nullData = {
      "long-name": "",
      "agency-id": "",
      "url": "",
      "color": "",
      "text-color": "",
    }
    return _.assign({}, qRout, nullData, {shape: shape}, {stops: qStop});
  }
}

exports.getService = async (req, res, next) => {
  let data = {};
  try {
    const route_id = req.params.route_id;
    const qData = await getServiceData(route_id);
    data = {
      data: qData
    }
    res.status(200).json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

exports.getMultiService = async (req, res, next) => {
  let data = {};
  try {
    const route_id = req.query.id;
    const results = [];
    if (route_id) {
      const splitServiceId = route_id.split(",");
      data = splitServiceId;
      for (let num of splitServiceId) {
        results.push(await getServiceData(num));
      }
    }
    data = {
      data: results
    }
    res.status(200).json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}

exports.getServiceStops = async (req, res, next) => {
  try {
    const route_id = req.params.route_id;
    console.log('route_id', route_id);
    if (!route_id)
      throw new Error("How can I add new product when no value provided?");
    const qStop = await getStopsByServices(route_id);
    data = {
      data: qStop
    }
    res.status(200).json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};