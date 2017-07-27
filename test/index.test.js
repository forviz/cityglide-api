/* eslint-disable */
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const _ = require('lodash');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');

const should = chai.should();

chai.use(chaiHttp);

describe('/stops', () => {

});

describe('/realtime', () => {

  describe('/trips', () => {
    it('should return 400 if no parameter given', (done) => {
      chai.request(server)
        .get('/v1/realtime/trips')
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('should return 200 to success request', (done) => {
      chai.request(server)
        .get('/v1/realtime/trips/?arriving-at=7881')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('data');

          const tripUpdate = _.get(res.body, 'data.0');

          // Trip
          tripUpdate.should.have.property('trip');

          const trip = tripUpdate.trip;
          trip.should.have.property('id');
          trip.should.have.property('route-id');
          trip.should.have.property('service-id');
          trip.should.have.property('trip-headsign').to.be.a('string');
          trip.should.have.property('trip-short-name').to.be.a('string');
          trip.should.have.property('direction').to.be.a('number');

          // Vehicle
          tripUpdate.should.have.property('vehicle');

          const vehicle = tripUpdate.vehicle;
          vehicle.should.have.property('id');
          vehicle.should.have.property('label').to.be.a('string');
          vehicle.should.have.property('license-plate').to.be.a('string');

          tripUpdate.should.have.property('stop-time-update');
          const stopTimeUpdate = _.get(tripUpdate, 'stop-time-update.0');

          stopTimeUpdate.should.have.property('stop-sequence');
          stopTimeUpdate.should.have.property('stop-id');
          stopTimeUpdate.should.have.property('arrival').to.be.a('number');
          stopTimeUpdate.should.have.property('departure').to.be.a('number');
          stopTimeUpdate.should.have.property('schedule-relationship').eql('SCHEDULED');
          done();
        });
    }).timeout(5000);
  });

  describe('/vehicles', () => {

    it('should return 404 to /v1/realtime/vehicle', (done) => {
      chai.request(server)
        .get('/v1/realtime/vehicles')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('should return 200 to success request', (done) => {
      chai.request(server)
        .get('/v1/realtime/vehicles/380')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('data');
          res.body.data.should.have.property('trip-id').eql('NOT_AVAILABLE');
          res.body.data.should.have.property('vehicle-id').eql(380);
          res.body.data.should.have.property('current-stop-sequence').eql(67);
          res.body.data.should.have.property('stop-id').eql(3081);
          res.body.data.should.have.property('current-status').eql('IN_TRANSIT_TO');
          res.body.data.should.have.property('timestamp').to.be.a('number');
          done();
        });
    });
  });
});
