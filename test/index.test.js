/* eslint-disable */
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const _ = require('lodash');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');

const should = chai.should();

chai.use(chaiHttp);

function isNumericString(stringNumber){
  return !Number.isNaN(Number(stringNumber));
}

function isIntegerString(stringNumber){
  return Number.isInteger(Number(stringNumber));
}

describe('/routes', () => {
  it('should return 200 with routes info if parameter "id" not given', (done) => {
    chai.request(server)
      .get('/v1/routes')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data').to.be.an('array');
        if(res.body.data.length > 0){
          const dataItem = res.body.data[0];
          dataItem.should.have.property('id').satisfy(Number.isInteger);
          dataItem.should.have.property('agency-id').satisfy(Number.isInteger);
          dataItem.should.have.property('short-name').to.be.a('string');
          dataItem.should.have.property('long-name').to.be.a('string');
          dataItem.should.have.property('description').to.be.a('string');
          dataItem.should.have.property('type').to.be.a('number');
          dataItem.should.have.property('url').to.be.a('string');
          dataItem.should.have.property('color').to.be.a('string');
          dataItem.should.have.property('text-color').to.be.a('string');
          dataItem.should.have.property('shape').to.be.an('array');
          dataItem.shape[0].should.be.a('string');
          const shapeItemElements = dataItem.shape[0].split(',');
          shapeItemElements[0].should.have.lengthOf.at.least(1);
          shapeItemElements[1].should.satisfy(isNumericString);
          shapeItemElements[2].should.satisfy(isNumericString);
          shapeItemElements[3].should.satisfy(isIntegerString);
        }
        done();
      });
  });
  
  it('should return 200 with routes info if parameter "id" given', (done) => {
    chai.request(server)
      .get('/v1/routes')
      .query({id: '1'})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data').to.be.an('array');
        const dataItem = res.body.data[0];
        dataItem.should.have.property('id').satisfy(Number.isInteger);
        dataItem.should.have.property('agency-id').satisfy(Number.isInteger);
        dataItem.should.have.property('short-name').to.be.a('string');
        dataItem.should.have.property('long-name').to.be.a('string');
        dataItem.should.have.property('description').to.be.a('string');
        dataItem.should.have.property('type').to.be.a('number');
        dataItem.should.have.property('url').to.be.a('string');
        dataItem.should.have.property('color').to.be.a('string');
        dataItem.should.have.property('text-color').to.be.a('string');
        dataItem.should.have.property('shape').to.be.an('array');
        dataItem.shape[0].should.be.a('string');
        const shapeItemElements = dataItem.shape[0].split(',');
        shapeItemElements[0].should.have.lengthOf.at.least(1);
        shapeItemElements[1].should.satisfy(isNumericString);
        shapeItemElements[2].should.satisfy(isNumericString);
        shapeItemElements[3].should.satisfy(isIntegerString);
        done();
      });
  });
  
  // it('should return 400 with error payload if parameter "id" given with incorrect format', (done) => {
  //   chai.request(server)
  //     .get('/v1/routes')
  //     .query({id: 'a'})
  //     .end((err, res) => {
  //       res.should.have.status(400);
  //       res.body.should.have.property('error').to.be.an('array');
  //       const errorItem = res.body.error[0];
  //       errorItem.should.have.property('title').to.be.a('string');
  //       errorItem.should.have.property('detail').to.be.a('string');
  //       errorItem.should.have.property('code').satisfy(Number.isInteger)
  //       .and.to.be.at.least(100)
  //       .and.to.be.at.most(600);
  //       done();
  //     });
  // });
});

describe('/routes/{routeId}', () => {
  it('should return 200 with a route info if parameter "routeId" given', (done) => {
    chai.request(server)
      .get('/v1/routes/1')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data').to.be.an('object');
        const data = res.body.data;
        data.should.have.property('id').satisfy(Number.isInteger);
        data.should.have.property('agency-id').satisfy(Number.isInteger);
        data.should.have.property('short-name').to.be.a('string');
        data.should.have.property('long-name').to.be.a('string');
        data.should.have.property('description').to.be.a('string');
        data.should.have.property('type').to.be.a('number');
        data.should.have.property('url').to.be.a('string');
        data.should.have.property('color').to.be.a('string');
        data.should.have.property('text-color').to.be.a('string');
        
        data.should.have.property('shape').to.be.an('array');
        data.shape[0].should.be.a('string');
        const shapeItemElements = data.shape[0].split(',');
        shapeItemElements[0].should.have.lengthOf.at.least(1);
        shapeItemElements[1].should.satisfy(isNumericString);
        shapeItemElements[2].should.satisfy(isNumericString);
        shapeItemElements[3].should.satisfy(isIntegerString);
        
        data.should.have.property('stops').to.be.an('array');
        data.stops[0].should.be.an('object');
        const stopsItem = data.stops[0];
        stopsItem.should.have.property('id').satisfy(Number.isInteger);
        stopsItem.should.have.property('code').to.be.a('string');
        stopsItem.should.have.property('name').to.be.a('string');
        stopsItem.should.have.property('desc').to.be.a('string');
        stopsItem.should.have.property('lat').to.be.a('string');
        stopsItem.should.have.property('lon').to.be.a('string');
        stopsItem.should.have.property('url').to.be.a('string');
        stopsItem.should.have.property('location-type').to.equal(0).or.to.equal(1);
        done();
      });
  });
  
  it('should return 400 with error payload if parameter "routeId" is not an integer', (done) => {
    chai.request(server)
      .get('/v1/routes/a')
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('error').to.be.an('array');
        const errorItem = res.body.error[0];
        errorItem.should.have.property('title').to.be.a('string');
        errorItem.should.have.property('detail').to.be.a('string');
        errorItem.should.have.property('code').satisfy(Number.isInteger)
        .and.to.be.at.least(100)
        .and.to.be.at.most(600);
        done();
      });
  });
});

describe('/routes/{routeId}/stops', () => {
  it('should return 200 with a route info if parameter "routeId" given', (done) => {
    chai.request(server)
      .get('/v1/routes/1/stops')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data').to.be.an('array');
        const dataItem = res.body.data[0];
        dataItem.should.have.property('id').satisfy(Number.isInteger);
        dataItem.should.have.property('code').to.be.a('string');
        dataItem.should.have.property('name').to.be.a('string');
        dataItem.should.have.property('desc').to.be.a('string');
        dataItem.should.have.property('lat').to.be.a('string');
        dataItem.should.have.property('lon').to.be.a('string');
        dataItem.should.have.property('url').to.be.a('string');
        dataItem.should.have.property('location-type').to.be.oneOf([0, 1]);
        done();
      });
  });
  
  it('should return 400 with error payload if parameter "routeId" not given', (done) => {
    chai.request(server)
      .get('/v1/routes//stops')
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('error').to.be.an('array');
        const errorItem = res.body.error[0];
        errorItem.should.have.property('title').to.be.a('string');
        errorItem.should.have.property('detail').to.be.a('string');
        errorItem.should.have.property('code').satisfy(Number.isInteger)
        .and.to.be.at.least(100)
        .and.to.be.at.most(600);
        done();
      });
  });
  
  it('should return 400 with error payload if parameter "routeId" is not an integer', (done) => {
    chai.request(server)
      .get('/v1/routes/a/stops')
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('error').to.be.an('array');
        const errorItem = res.body.error[0];
        errorItem.should.have.property('title').to.be.a('string');
        errorItem.should.have.property('detail').to.be.a('string');
        errorItem.should.have.property('code').satisfy(Number.isInteger)
        .and.to.be.at.least(100)
        .and.to.be.at.most(600);
        done();
      });
  });
});

describe('/stops', () => {
  it('should return 200 with a stop info if parameter "id" not given', (done) => {
    chai.request(server)
      .get('/v1/stops')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data').to.be.an('array');
        if(res.body.data.length > 0){
          const dataItem = res.body.data[0];
          dataItem.should.have.property('id').satisfy(Number.isInteger);
          dataItem.should.have.property('code').to.be.a('string');
          dataItem.should.have.property('name').to.be.a('string');
          dataItem.should.have.property('desc').to.be.a('string');
          dataItem.should.have.property('lat').to.be.a('string');
          dataItem.should.have.property('lon').to.be.a('string');
          dataItem.should.have.property('url').to.be.a('string');
          dataItem.should.have.property('location-type').to.be.oneOf([0, 1]);
        }
        done();
      });
  });
    
  it('should return 200 with a stop info if parameter "id" given', (done) => {
    chai.request(server)
      .get('/v1/stops')
      .query({ id: '1' })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data').to.be.an('array');
        const dataItem = res.body.data[0];
        dataItem.should.have.property('id').satisfy(Number.isInteger);
        dataItem.should.have.property('code').to.be.a('string');
        dataItem.should.have.property('name').to.be.a('string');
        dataItem.should.have.property('desc').to.be.a('string');
        dataItem.should.have.property('lat').to.be.a('string');
        dataItem.should.have.property('lon').to.be.a('string');
        dataItem.should.have.property('url').to.be.a('string');
        dataItem.should.have.property('location-type').to.be.oneOf([0, 1]);
        done();
      });
  });
  
  // it('should return 400 with error payload if parameter "id" given with incorrect format', (done) => {
  //   chai.request(server)
  //     .get('/v1/stops')
  //     .query({id: 'a'})
  //     .end((err, res) => {
  //       res.should.have.status(400);
  //       res.body.should.have.property('error').to.be.an('array');
  //       const errorItem = res.body.error[0];
  //       errorItem.should.have.property('title').to.be.a('string');
  //       errorItem.should.have.property('detail').to.be.a('string');
  //       errorItem.should.have.property('code').satisfy(Number.isInteger)
  //       .and.to.be.at.least(100)
  //       .and.to.be.at.most(600);
  //       done();
  //     });
  // });
});

describe('/stops/nearbysearch', () => {
  it('should return 200 with search results if only parameter "location" given', (done) => {
    chai.request(server)
      .get('/v1/stops/nearbysearch')
      .query({
        location: '13.747317317702,100.49569846018'
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data').to.be.an('array');
        if(res.body.data.length > 0){
          const dataItem = res.body.data[0];
          dataItem.should.have.property('id').satisfy(Number.isInteger);
          dataItem.should.have.property('code').to.be.a('string');
          dataItem.should.have.property('name').to.be.a('string');
          dataItem.should.have.property('desc').to.be.a('string');
          dataItem.should.have.property('lat').to.be.a('string');
          dataItem.should.have.property('lon').to.be.a('string');
          dataItem.should.have.property('url').to.be.a('string');
          dataItem.should.have.property('location-type').to.be.oneOf([0, 1]);
        }
        done();
      });
  });
    
  it('should return 200 with search results if parameter "location" and "radius" given', (done) => {
    chai.request(server)
      .get('/v1/stops/nearbysearch')
      .query({
        location: '13.747317317702,100.49569846018',
        radius: 100
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data').to.be.an('array');
        if(res.body.data.length > 0){
          const dataItem = res.body.data[0];
          dataItem.should.have.property('id').satisfy(Number.isInteger);
          dataItem.should.have.property('code').to.be.a('string');
          dataItem.should.have.property('name').to.be.a('string');
          dataItem.should.have.property('desc').to.be.a('string');
          dataItem.should.have.property('lat').to.be.a('string');
          dataItem.should.have.property('lon').to.be.a('string');
          dataItem.should.have.property('url').to.be.a('string');
          dataItem.should.have.property('location-type').to.be.oneOf([0, 1]);
        }
        done();
      });
  });
  
  it('should return 400 with error payload if parameter "location" not given', (done) => {
    chai.request(server)
      .get('/v1/stops/nearbysearch')
      .query({
        radius: 100
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('error').to.be.an('array');
        const errorItem = res.body.error[0];
        errorItem.should.have.property('title').to.be.a('string');
        errorItem.should.have.property('detail').to.be.a('string');
        errorItem.should.have.property('code').satisfy(Number.isInteger)
        .and.to.be.at.least(100)
        .and.to.be.at.most(600);
        done();
      });
  });
  
  it('should return 400 with error payload if parameter "location" given with incorrect format', (done) => {
    chai.request(server)
      .get('/v1/stops/nearbysearch')
      .query({
        location: 'a',
        radius: 100
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('error').to.be.an('array');
        const errorItem = res.body.error[0];
        errorItem.should.have.property('title').to.be.a('string');
        errorItem.should.have.property('detail').to.be.a('string');
        errorItem.should.have.property('code').satisfy(Number.isInteger)
        .and.to.be.at.least(100)
        .and.to.be.at.most(600);
        done();
      });
  });
});

describe('/stops/{stopId}', () => {
  it('should return 200 with a stop info if parameter "stopId" given', (done) => {
    chai.request(server)
      .get('/v1/stops/1')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data').to.be.an('object');
        const data = res.body.data;
        data.should.have.property('id').satisfy(Number.isInteger);
        data.should.have.property('code').to.be.a('string');
        data.should.have.property('name').to.be.a('string');
        data.should.have.property('desc').to.be.a('string');
        data.should.have.property('lat').to.be.a('string');
        data.should.have.property('lon').to.be.a('string');
        data.should.have.property('url').to.be.a('string');
        data.should.have.property('location-type').to.be.oneOf([0, 1]);
        done();
      });
  });
  
  // it('should return 400 with error payload if parameter "stopId" given with incorrect format', (done) => {
  //   chai.request(server)
  //     .get('/v1/stops/a')
  //     .end((err, res) => {
  //       res.should.have.status(400);
  //       res.body.should.have.property('error').to.be.an('array');
  //       const errorItem = res.body.error[0];
  //       errorItem.should.have.property('title').to.be.a('string');
  //       errorItem.should.have.property('detail').to.be.a('string');
  //       errorItem.should.have.property('code').satisfy(Number.isInteger)
  //       .and.to.be.at.least(100)
  //       .and.to.be.at.most(600);
  //       done();
  //     });
  // });
});

describe('/trips/{tripId}', () => {
  it('should return 200 with trip if parameter "tripId" given', (done) => {
    chai.request(server)
      .get('/v1/trips/1')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('data').to.be.an('array');
        if(res.body.data.length > 0){
          const dataItem = res.body.data[0];
          dataItem.should.have.property('id').satisfy(Number.isInteger);
          dataItem.should.have.property('route-id').satisfy(Number.isInteger);
          dataItem.should.have.property('service-id').satisfy(Number.isInteger);
          dataItem.should.have.property('trip-headsign').to.be.a('string');
          dataItem.should.have.property('trip-short-name').to.be.a('string');
          dataItem.should.have.property('direction').to.be.oneOf([0, 1]);
          
          dataItem.should.have.property('shape').to.be.an('array');
          dataItem.shape[0].should.be.a('string');
          const shapeItemElements = dataItem.shape[0].split(',');
          shapeItemElements[0].should.have.lengthOf.at.least(1);
          shapeItemElements[1].should.satisfy(isNumericString);
          shapeItemElements[2].should.satisfy(isNumericString);
          shapeItemElements[3].should.satisfy(isIntegerString);
        }
        done();
      });
  });
  
  it('should return 400 with error payload if parameter "tripId" not given', (done) => {
    chai.request(server)
      .get('/v1/trips/a')
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('error').to.be.an('array');
        const errorItem = res.body.error[0];
        errorItem.should.have.property('title').to.be.a('string');
        errorItem.should.have.property('detail').to.be.a('string');
        errorItem.should.have.property('code').satisfy(Number.isInteger)
        .and.to.be.at.least(100)
        .and.to.be.at.most(600);
        done();
      });
  });
});

describe('/realtime', () => {
  describe('/trips', () => {
    it('should return 200 to success request', (done) => {
      chai.request(server)
        .get('/v1/realtime/trips')
        .query({
          'arriving-at': '2781'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('data').to.be.an('array');

          const tripUpdate = _.get(res.body, 'data.0');

          // Trip
          tripUpdate.should.have.property('trip').to.be.an('object');

          const trip = tripUpdate.trip;
          trip.should.have.property('id').satisfy(Number.isInteger);
          trip.should.have.property('route-id').satisfy(Number.isInteger);
          trip.should.have.property('service-id').satisfy(Number.isInteger);
          trip.should.have.property('trip-headsign').to.be.a('string');
          trip.should.have.property('trip-short-name').to.be.a('string');
          trip.should.have.property('direction').to.be.oneOf([0, 1]);
          
          trip.should.have.property('shape').to.be.an('array');
          if(trip.shape.length > 0){
            trip.shape[0].should.be.a('string');
            const shapeItemElements = trip.shape[0].split(',');
            shapeItemElements[0].should.have.lengthOf.at.least(1);
            shapeItemElements[1].should.satisfy(isNumericString);
            shapeItemElements[2].should.satisfy(isNumericString);
            shapeItemElements[3].should.satisfy(isIntegerString);
          }

          // Vehicle
          tripUpdate.should.have.property('vehicle').to.be.an('object');

          const vehicle = tripUpdate.vehicle;
          vehicle.should.have.property('id').satisfy(Number.isInteger);
          vehicle.should.have.property('label').to.be.a('string');
          vehicle.should.have.property('license-plate').to.be.a('string');

          tripUpdate.should.have.property('stop-time-update').to.be.an('array');
          const stopTimeUpdate = _.get(tripUpdate, 'stop-time-update.0');

          stopTimeUpdate.should.have.property('stop-sequence').satisfy(Number.isInteger);
          stopTimeUpdate.should.have.property('stop-id').satisfy(Number.isInteger);
          stopTimeUpdate.should.have.property('arrival').to.be.a('number');
          stopTimeUpdate.should.have.property('departure').to.be.a('number');
          stopTimeUpdate.should.have.property('schedule-relationship').to.be.oneOf(['SCHEDULED', 'SKIPPED', 'NO_DATA']);
          
          tripUpdate.should.have.property('timestamp').to.be.a('number');
          tripUpdate.should.have.property('delay').to.be.a('number');
          done();
        });
    }).timeout(5000);
    
    it('should return 400 if no parameter given', (done) => {
      chai.request(server)
        .get('/v1/realtime/trips')
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('error').to.be.an('array');
          const errorItem = res.body.error[0];
          errorItem.should.have.property('title').to.be.a('string');
          errorItem.should.have.property('detail').to.be.a('string');
          errorItem.should.have.property('code').satisfy(Number.isInteger)
          .and.to.be.at.least(100)
          .and.to.be.at.most(600);
          done();
        });
    });
  });

  describe('/vehicles', () => {
    it('should return 200 to success request', (done) => {
      chai.request(server)
        .get('/v1/realtime/vehicles/380')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('data').to.be.an('object');
          res.body.data.should.have.property('trip-id').satisfy(Number.isInteger);
          res.body.data.should.have.property('vehicle-id').eql('380');
          
          res.body.data.should.have.property('position').to.be.an('object');
          const position = res.body.data.position;
          position.should.have.property('lat').to.be.a('number');
          position.should.have.property('lng').to.be.a('number');
          
          res.body.data.should.have.property('current-stop-sequence').eql(67);
          res.body.data.should.have.property('stop-id').eql(3081);
          res.body.data.should.have.property('current-status').eql('IN_TRANSIT_TO');
          res.body.data.should.have.property('timestamp').to.be.a('string');
          res.body.data.should.have.property('congestion-level').satisfy(Number.isInteger);
          res.body.data.should.have.property('occupancy-status').satisfy(Number.isInteger);
          done();
        });
    });
    
    it('should return 400 if no parameter given', (done) => {
      chai.request(server)
        .get('/v1/realtime/vehicles/')
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('error').to.be.an('array');
          const errorItem = res.body.error[0];
          errorItem.should.have.property('title').to.be.a('string');
          errorItem.should.have.property('detail').to.be.a('string');
          errorItem.should.have.property('code').satisfy(Number.isInteger)
          .and.to.be.at.least(100)
          .and.to.be.at.most(600);
          done();
        });
    });
    
    // it('should return 404 to /v1/realtime/vehicle', (done) => {
    //   chai.request(server)
    //     .get('/v1/realtime/vehicles')
    //     .end((err, res) => {
    //       res.should.have.status(404);
    //       done();
    //     });
    // });
  });
});
