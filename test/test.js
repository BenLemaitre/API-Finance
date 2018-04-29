var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../app');
var should = chai.should();
var Bill = require('../models').Bill;
var supertest = require('supertest');
var request = supertest('http://localhost:8080');

chai.use(chaiHttp);

describe('Bill API', function(){
    //Before each test we empty the database
    beforeEach(function(done){
        Bill.destroy({
            where: {},
            truncate: true
        });
        done();
    });
    describe('/GET bills', function(){
        it('User is not logged in : 401', function() {
            return request
                .get('/bills')
                .expect(401);
        });

        it('Getting all bills : 200', function(done){
            chai.request(app).get('/bills')
                .set('authentication', 'MY_TOKEN')
                .end(function(err, res){
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });
    });
    describe('/POST bills', function(){
        it('User is not logged in while creating a bill : 401', function(done) {
            var bill = {
                amount: 500,
                paid: true,
                id_student: 'BLE05',
                service: 'registration',
            }
            chai.request(app).post('/bills')
                .send(bill)
                .end(function(err, res){
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    done();
                });
        });

        it('Missing data on bill creation : 400', function(done) {
            chai.request(app).post('/bills')
                .set('authentication', 'MY_TOKEN')
                .send()
                .end(function(err, res){
                    res.should.have.status(400);
                    done();
                });
        });

        it('Creating new bill : 201', function(done){
            var bill = {
                amount: 500,
                paid: true,
                id_student: 'BLE05',
                service: 'registration',
            }
            chai.request(app).post('/bills')
                .set('authentication', 'MY_TOKEN')
                .send(bill)
                .end(function(err, res){
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('/GET/:id bills', function(){
        it('Get bill by id : 200', function(done){
            Bill.create({
                amount: 500,
                paid: true,
                id_student: 'BLE05',
                service: 'registration',
            }).then(function(bill){
                chai.request(app).get('/bills/'+bill.id)
                    .set('authentication', 'MY_TOKEN')
                    .end(function(err, res){
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });

        it('User is not logged in : 401', function(done){
            Bill.create({
                amount: 500,
                paid: true,
                id_student: 'BLE05',
                service: 'registration',
            }).then(function(bill){
                chai.request(app).get('/bills/'+bill.id)
                    .end(function(err, res){
                        res.should.have.status(401);
                        res.body.should.be.a('object');
                        done();
                    });
            });
        });

        it('If the bill ID does not exist : 404', function(done){
            chai.request(app).get('/bills/100').end(function(err, res){
                res.should.have.status(404);
                res.body.should.equal('Bill not found');
                done();
            })
        });
        it('If the ID is invalid : 400', function(done){
            chai.request(app).get('/bills/abc').end(function(err, res){
                res.should.have.status(400);
                res.body.should.equal('Invalid ID');
                done();
            });
        });
    });
    describe('/PUT/:id bills', function(){
        it('Update bill by id : 200', function(done){
            Bill.create({
                amount: 500,
                paid: true,
                id_student: 'BLE05',
                service: 'registration',
            }).then(function(bill){
                var billEdit = {
                    paid: false
                }
                chai.request(app).put('/bills/'+bill.id)
                    .set('authentication', 'MY_TOKEN')
                    .send(billEdit)
                    .end(function(err, res){
                        res.should.have.status(200);
                        res.body.should.be.a('array');
                        done();
                    });
            })
        });

        it('User is not logged in while updating a bill : 401', function(done){
            Bill.create({
                amount: 500,
                paid: true,
                id_student: 'BLE05',
                service: 'registration',
            }).then(function(bill){
                var billEdit = {
                    paid: false
                }
                chai.request(app).put('/bills/'+bill.id)
                    .send(billEdit)
                    .end(function(err, res){
                        res.should.have.status(401);
                        done();
                    });
            })
        });

        it('If the bill ID does not exist : 404', function(done){
            chai.request(app).get('/bills/100').end(function(err, res){
                res.should.have.status(404);
                res.body.should.equal('Bill not found');
                done();
            })
        });
    });
});