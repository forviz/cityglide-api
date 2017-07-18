/* eslint-disable */
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');

const should = chai.should();

chai.use(chaiHttp);

// Our parent block
describe('Realtime', () => {

  /*
   * Test the /GET route
   */
  describe('vehicle', () => {
    it('should return vehicle data', (done) => {

      chai.request(server)
        .get('/v1/realtime/vehicles/380')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('data');
          done();
        });
    });
  });
});
