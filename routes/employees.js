var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Employee= require('./../models/employee');
var async = require('async');

//get all employees
router.get('/', (req, res) => {
    //all we need is a plain JavaScript version of the returned doc
    //by using lean() in the query chain. That way Mongoose skips
    //the step of creating the full model instance
    //and we directly get a doc we can modify
    Employee.find({}).lean().exec((err,docs) => {
       if(err || !docs) res.send(err);
       else {
           docs.forEach((doc, index) => {
               async.parallel([(callback)=>{
                  if(doc.manager) {
                      //get a manager object for each employee
                      Employee.findById(doc.manager, (err, mdoc) =>{
                          if(err || !mdoc) res.send(err);
                          else {
                              doc.managerObj = mdoc;
                              console.log(mdoc);
                              //if(index == docs.length - 1) res.json(docs);
                          }
                          callback();
                      });
                  }
              }], (err, results) => {
                  if(err) res.send(err);
                  res.json(docs);}
              );
           });

       }
    });
});

//create new employee
router.post('/', function(req, res) {
    var employee = new Employee(req.body);
    if(typeof req.body.manager === 'undefined') {
        employee.save(function(err){
            if(err) res.send(err);
            else res.json({message: 'Employee successfully created!',employee: employee});
        });
    }else {
        console.log("Manger name:"+req.body.manager);
        Employee.findOne({name : req.body.manager}, function(err, doc) {
            if(err) res.send(err);
            else {
                //console.log(doc);
                if(doc) {
                    employee.manager = doc._id;
                    employee.save(function(err){
                        if(err) res.send(err);
                        else res.json({message: 'Employee successfully created!',employee: employee});
                    });
                }else{
                    res.send("Failed to create user, invalid manager name");
                }

            }
        })
    }
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
