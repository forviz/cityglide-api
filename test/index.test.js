/* eslint-disable */
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const sinon = require('sinon');
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
          done();
        });
    });

    it('should return 200 to success request', (done) => {
      chai.request(server)
        .get('/v1/realtime/trips/?arriving-at=7881&route-id=380')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('data');
          done();
        });
    });
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
          console.log(res.body);
          res.should.have.status(200);
          res.body.should.have.property('data');
          done();
        });
    });
  });
});
