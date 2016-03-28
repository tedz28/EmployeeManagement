var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Employee= require('./../models/employee');
var async = require('async');

//get all employees
router.get('/', (req, res) => {
    //lean() returns a plain JavaScript object of doc. Mongoose skips the step of
    // creating the full model instance and we directly get a doc we can modify
    Employee.find({}).lean().exec((err,docs) => {
       if(err || !docs) res.send(err);
       else {
           async.each(docs, (doc, callback) => {
               async.parallel([
                       //async task 1 : get manger object
                       (cb) => {
                           if(typeof doc.manager !== 'undefined') {
                               Employee.findById(doc.manager, (err, managerDoc) => {
                                   if (err)  return cb(err);
                                   doc.managerObj = managerDoc;
                                   cb();
                               });
                           }
                           else cb();
                       },
                       //async task 2 : get direct reports objects
                       (cb) => {
                               Employee.find({manager: doc._id}, (err, dirReportDocs) => {
                                   if(err)  return cb(err);
                                   doc.dirReports = dirReportDocs;
                                   cb();
                               });
                       }
                   ], (err) => {
                       //this is final callback for async parallel tasks
                        if(err) return callback(err);
                        callback();
                   }
               );
           }, (err) => {
               //this is final callback for async.each
               if(err) res.send(err);
               else res.json(docs);
           });
       }
    });
});

//create new employee
router.post('/', (req, res) => {
    var employee = new Employee(req.body);
    if(typeof req.body.manager === 'undefined') {
        employee.save((err) => {
            if(err) res.send(err);
            else res.json({message: 'Employee successfully created!',employee: employee});
        });
    }else {
        console.log("Manger name:"+req.body.manager);
        //look up manager name in database
        Employee.findOne({name : req.body.manager}, (err, doc) => {
            if(err) res.send(err);
            else {
                if(doc) {
                    employee.manager = doc._id;
                    employee.save((err) => {
                        if(err) res.send(err);
                        else res.json({message: 'Employee successfully created!',employee: employee});
                    });
                }else{
                    res.status(400).send("Failed to create user, invalid manager name");
                }

            }
        });
    }
});

//update employee
router.put('/:id', (req, res) => {
   Employee.findById(req.params.id, (err, doc) => {
       if(err) res.send(err);
       //only update user specified fields
       doc.name = req.body.name || doc.name;
       doc.title = req.body.title || doc.title;
       doc.sex = req.body.sex || doc.sex;
       doc.startDate = req.body.startDate || doc.startDate;
       doc.officePhone = req.body.officePhone || doc.officePhone;
       doc.cellPhone = req.body.cellPhone || doc.cellPhone;
       doc.email = req.body.email || doc.email;
       if(typeof req.body.manager !== 'undefined' ) {

           Employee.findOne({name: req.body.manager}, (err, managerDoc) => {
               if (err) res.send(err);
               else {
                   if (managerDoc) {
                       doc.manager = managerDoc._id;
                       doc.save((err) => {
                           if (err) res.send(err);
                           else res.json({message: 'Employee successfully Updated!', doc: doc});
                       });
                   } else {
                       res.send("Failed to update user, invalid manager name");
                   }

               }
           });
       }
       else{
           doc.save((err) => {
               if (err) res.send(err);
               else res.json({message: 'Employee successfully Updated!', doc: doc});
           });
       }
   });
});

//delete employee
router.delete('/:id', (req, res) => {
    Employee.remove({_id : req.params.id}, (err) => {
        if (err) res.send(err);
        else res.json({message:"Employee deleted!"});
    });
});

//get employee by id
router.get('/:id', (req, res) => {
    Employee.findById(req.params.id).lean().exec((err, doc) => {
        console.log(doc);
        if(err || !doc) res.send(err || "Not found");
        else {
            async.parallel([
                    //async task 1 : get manger object
                    (cb) => {
                        if(typeof doc.manager !== 'undefined') {
                            Employee.findById(doc.manager, (err, managerDoc) => {
                                if (err)  return cb(err);
                                doc.managerObj = managerDoc;
                                cb();
                            });
                        }
                        else cb();
                    },
                    //async task 2 : get direct reports objects
                    (cb) => {
                        Employee.find({manager: doc._id}, (err, dirReportDocs) => {
                            if(err)  return cb(err);
                            doc.dirReports = dirReportDocs;
                            cb();
                        });
                    }
                ], (err) => {
                    //this is final callback for async parallel tasks
                    if(err) res.send(err);
                    else res.json(doc);
                }
            );
        }
    });
});

//get direct reports for specific employee
router.get('/:id/reports', (req, res) => {
    Employee.findById(req.params.id).lean().exec((err, idDoc) => {
        if(err) res.send(err);
        else{
            Employee.find({manager: idDoc._id}).lean().exec((err, docs) => {
                if(err || !docs) res.send(err);
                else {
                    async.each(docs, (doc, callback) => {
                        async.parallel([
                                //async task 1 : get manger object
                                (cb) => {
                                    if(typeof doc.manager !== 'undefined') {
                                        Employee.findById(doc.manager, (err, managerDoc) => {
                                            if (err)  return cb(err);
                                            doc.managerObj = managerDoc;
                                            cb();
                                        });
                                    }
                                    else cb();
                                },
                                //async task 2 : get direct reports objects
                                (cb) => {
                                    Employee.find({manager: doc._id}, (err, dirReportDocs) => {
                                        if(err)  return cb(err);
                                        doc.dirReports = dirReportDocs;
                                        cb();
                                    });
                                }
                            ], (err) => {
                                //this is final callback for async parallel tasks
                                if(err) return callback(err);
                                callback();
                            }
                        );
                    }, (err) => {
                        //this is final callback for async.each
                        if(err) res.send(err);
                        else res.json(docs);
                    });
                }
            });
        }
    });
});

module.exports = router;
