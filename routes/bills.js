var express = require('express');
var _ = require('lodash');
var Bill = require('../models').Bill;
var router = express.Router();

// *** Middleware *** //
var checkIDInput = function (req, res, next) {  
    //console.log('Check ID input');
    if(isNaN(req.params.id)) {
        //console.log('Invalid ID supplied');
        res.status(400).json('Invalid ID');
    } else {
        next();
    }
};

// *** Checking if the bill exists *** //
var checkIDExist = function (req, res, next) {
    Bill.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            next();
        } else {
            res.status(404).json('Bill not found');
        }
    }); 
};

// *** Get all bills *** //
router.get('/', function(req, res) {
    var authentication = req.get('authentication');
    if (!authentication) {
        return res.status(401).send({message: 'Please log in'});
    } 
    Bill.findAll().then(bill => {
        res.status(200).json(bill);

        var total = 0;
        var totalRegistration = 0;
        var totalLibrary = 0;

        for(var i in bill) {
            if(bill[i].paid) {
                total += bill[i].amount;
                if(bill[i].service === 'registration') {
                    totalRegistration += bill[i].amount;
                } else if(bill[i].service === 'library') {
                    totalLibrary += bill[i].amount;
                }
            }
            console.log("total: ", total);
            console.log("total registration: ", totalRegistration);
            console.log("total library: ", totalLibrary);
        }
    });
});

// *** Create a bill *** //
router.post('/', function(req, res){
    var authentication = req.get('authentication');
    var body = req.body;
    if (!authentication) {
        return res.status(401).send({message: 'Please log in'});
    }
    if (_.isEmpty(body) || !body.id_student || !body.service) {
        return res.status(400).send({message: 'Missing data'});
    } 

    Bill.create({
        amount: req.body.amount,
        paid: req.body.paid,
        id_student: req.body.id_student,
        service: req.body.service,
        date: new Date()
    }).then(bill => {
        res.status(201).json(bill);
    }).error(err => {
        res.status(405).json('Error has occured');
    });
});

// *** Get bill by ID *** //
router.get('/:id', [checkIDInput, checkIDExist], function(req, res){
    var authentication = req.get('authentication');
    if (!authentication) {
        return res.status(401).send({message: 'Please log in'});
    } 
    Bill.findById(req.params.id).then(bill => {
        res.status(200).json(bill);
    });
});

// *** Updating bill by ID (paid) *** //
router.put('/:id', [checkIDInput, checkIDExist], function(req, res){
    var authentication = req.get('authentication');
    if (!authentication) {
        return res.status(401).send({message: 'Please log in'});
    }
    Bill.update({
        paid: req.body.paid
    },{
        where: { id: req.params.id }
    }).then(result => {
        res.status(200).json(result);
    });
});

module.exports = router;