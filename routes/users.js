var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User     = require('./../models/user');

/* GET users listing. */
router.get('/', function(req, res) {
    //res.json(users);
    User.find(function(err,Users) {
       if(err) res.send(err);
       else res.json(Users);
    });
});
//Create New User
router.post('/', function(req, res) {
    var user = new User(req.body);
    user.save(function(err){
        if(err) res.send(err);
        else res.json({message: 'user created!'});
    });
});
//Update User
router.put('/:id', function(req, res) {
   User.findById(req.params.id, function(err, user) {
       if(err) res.send(err);
       user.fName = req.body.fName || user.fName;
       user.lName = req.body.lName || user.lName;
       user.title = req.body.title || user.title;
       user.sex = req.body.sex || user.sex;
       user.age = req.body.age || user.age;
       user.save(function(err) {
           if(err) res.send(err);
           res.json({message : 'User updated!'});
       })

   });
});
//Delete user
router.delete('/:id', function(req, res) {
    User.remove({
        _id : req.params.id
    }, function(err, user) {
        if (err) res.send(err);
        res.json({message:"User deleted!"});
    });
});

//GET single user
router.get('/:id', function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if(err) res.send(err);
        res.json(user);
    });
});


module.exports = router;
