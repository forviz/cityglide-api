const db = require('../config/db');
const _ = require('lodash');
const request = require("request");

const sleep = (milliseconds) => {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}

const callApiGoogle = (start, stop) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: 'https://maps.googleapis.com/maps/api/distancematrix/json',
      qs:
              {
                origins: start,
                destinations: stop,
                key: ' AIzaSyDIWuc_y_NrGetc12FMh8lXSZwR-sQ4A18',
                mode: 'transit',
                avoid: 'highways',
                transit_mode: 'bus',
                language: 'en'
              },
      headers:
              {
                'postman-token': '5939527f-a16c-1aa6-4a6b-f46991730f2d',
                'cache-control': 'no-cache'
              }
    }

    request(options, function (error, response, body) {
      if (error)
        reject(error);
      let jsonBody = JSON.parse(body);
      resolve(jsonBody);
    });
  });
}

exports.getTrips = async (req, res, next) => {
  try {
    let data = {};
    const localtion_id = req.query.stop_id;
    const route_id = req.query.route_id;
    let condition = {'routes_detail.locations_id': localtion_id};
    if (route_id) {
      condition = _.assign({}, condition, {'routes_detail.routes_id': route_id});
    }

    const qPosition = await db.select('routes_detail.priority', 'locations.*', 'routes.routes_id', 'routes.routes_name', 'routes.routes_type_id', 'routes_detail.routes_detail_station_priority', 'service.service_latitude', 'service.service_longtitude', 'service.service_station_priority', 'service_id', 'service_line', 'service_number')
            .from('routes_detail').where(condition)
            .whereNot('locations.locations_type_id', 1)
            .leftJoin('locations', 'routes_detail.locations_id', 'locations.id')
            .leftJoin('routes', 'routes_detail.routes_id', 'routes.routes_id')
            .innerJoin('service', 'routes.routes_name', 'service.service_line').orderBy('routes_detail.priority', 'acs');
    let _data = [];
    if (qPosition && qPosition.length > 0) {
      //******************** Call Api ********************//
      let latLonStart = latLonStop = "";
      _.forEach(qPosition, (v, i) => {
        if (i > 0) {
          latLonStart += "|";
        } else {
          latLonStop = v.latitude + ',' + v.longitude
        }
        latLonStart += v.service_latitude + ',' + v.service_longtitude
      });
      let _googleMap = await callApiGoogle(latLonStart, latLonStop)
      //******************** End Call Api ********************//

      for (var key in qPosition) {

        let trip = {
          "id": qPosition[key].id,
          "route-id": qPosition[key].routes_id,
          "service-id": qPosition[key].service_id,
          "trip-headsign": "",
          "trip-short-name": "",
          "direction": _googleMap.rows[0].elements[0].distance.value,
        };
        let vehicle = {
          "id": qPosition[key].service_id,
          "label": qPosition[key].service_line,
          "license-plate": qPosition[key].service_number
        };


        let temp = {
          trip: trip,
          vehicle: vehicle,
          timestamp: _googleMap.rows[key].elements[0].duration.value,
          delay: 0
        };
        _data.push(temp);
      }
      data = {
        data: _data
      }
    }
    res.status(200).json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};


exports.getVehicles = async (req, res, next) => {
  const vehicleId = req.params.vehicleId;
  let data = {};
  try {
    if (vehicleId) {
      const query = await db.first('*').where('service_id', vehicleId)
              .from('service');
      if (query) {
        data = {
          data: {
            "trip-id": null,
            "vehicle-id": query.service_id,
            "position": {
              "lat": query.service_latitude,
              "lng": query.service_longtitude
            },
            "current-stop-sequence": null,
            "stop-id": null,
            "current-status": null,
            "timestamp": null,
            "congestion-level": null,
            "occupancy-status": null
          }
        }
      }
    }
    res.status(200).json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }

}