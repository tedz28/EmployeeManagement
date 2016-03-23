var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Employee= require('./../models/employee');

//get all employees
router.get('/', function(req, res) {
    Employee.find(function(err,docs) {
       if(err) res.send(err);
       else res.json(docs);
    });
});

//create new employee
router.post('/', function(req, res) {
    var employee = new Employee(req.body);
    employee.save(function(err){
        if(err) res.send(err);
        else res.json({message: 'Employee successfully created!',employee: employee });
    });
});

//update employee
router.put('/:id', function(req, res) {
   Employee.findById(req.params.id, function(err, doc) {
       if(err) res.send(err);
       //only update user specified fields
       doc.name = req.body.name || doc.name;
       doc.title = req.body.title || doc.title;
       doc.sex = req.body.sex || doc.sex;
       doc.startDate = req.body.startDate || doc.startDate;
       doc.officePhone = req.body.officePhone || doc.officePhone;
       doc.cellPhone = req.body.cellPhone || doc.cellPhone;
       doc.email = req.body.email || doc.email;
       doc.manager = req.body.manager || doc.manager;

       doc.save(function(err) {
           if(err) res.send(err);
           res.json({message : 'Employee successfully updated!', employee:doc});
       })
   });
});

//delete employee
router.delete('/:id', function(req, res) {
    Employee.remove({
        _id : req.params.id
    }, function(err) {
        if (err) res.send(err);
        else res.json({message:"Employee deleted!"});
    });
});

//get employee by id
router.get('/:id', function(req, res) {
    Employee.findById(req.params.id, function(err, doc) {
      if(err) res.send(err);
      else res.json(doc);
    });
});

//get direct reports for specific employee
router.get('/:id/reports', function(req, res) {
    Employee.findById(req.params.id, function(err, doc) {
        if(err) res.send(err);
        Employee.find({manager: doc._id}, function(err, docs) {
            var ids = [];
            docs.forEach(function(item) {
                ids.push(item._id);
            });
            res.json({reports : ids});
        });
    });
});
module.exports = router;
