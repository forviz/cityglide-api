const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const expect = chai.expect;
const should = chai.should();
chai.use(chaiHttp);

const add = (a, b) => {
  if (b === undefined) b = 0;
  return a + b;
};

describe('stopController', () => {
  it('should return sum value', () => {
    expect(add(1,2)).to.equal(3);
    expect(add(-1,2)).to.equal(1);
    expect(add(1,8)).to.equal(9);
  });
  
  it('should assume undefined to equal 0', () => {
    expect(add(5,)).to.equal(5);
  });
  
  describe('getStop', () => {
    it('should return single stop', (done) => {
      chai.request(server).get('/v1/stops/1')
      .end((err, res) => {
        console.log(res.body);
        res.should.have.status(200);
        res.body.should.have.property('data');
        res.body.data.should.have.property('id').eql(1);
        expect().to.eq
        done();
      });
    });
    
    it('ทดสอบ should return error if no stopId', (done) => {
      chai.request(server).get('/v1/stops/')
      .end((err, res) => {
        console.log(res.body);
        res.should.have.status(400);
        done();
      })
    })
  })
});