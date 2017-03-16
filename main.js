'use babel'; // use babel transpiler
require('./util/db-connect'); // db connection

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var Todo = mongoose.model('Todo');
var util = require('./util/util');

var app = express();
app.use(bodyParser.json()); // REQUEST PARSER middleware, grab body in req.body
app.use('/res', express.static('static'));
// TODO apply webpack dist
// NOTE define url for static files and their folder path


// ROUTING
app
.route('/')
.get((req, res) => {
    res.status(200).sendFile('index.html', { root: path.join('.', 'static') }); // root file
    // TODO apply webpack dist
});


app
.route('/todos/')
.get((req, res) => {
    Todo.find({})
        .sort( '-updated_at' )
        .exec( ( err, todos ) => {
            res.status(200).send({tasks: todos});
        });
})
.post((req, res) => {
    // curl -X POST -H "Content-Type: application/json"  -d '{"task":"yes","status":true}' -w "\n"  http://localhost:3000/

    var _task = JSON.parse(JSON.stringify(req.body));
    _task.task_id = util.genRandomString();

    Todo.find({})
        .exec((err, todos) => {
            if (todos.length >= 30){
                return res.status(403).send({result:'failed', message:'reached limit of 30 tasks.'});
            }
            new Todo({
                task_id: _task.task_id,
                task: _task.task,
                status: false
            }).save(() => {
                res.status(201).send({task_id: _task.task_id});
            });
        });
});


// app.route('/:task_id')   // console.log('delete a new task', req.params.task_id);
app
.route(/^\/todos\/(\w+)/)
.get((req, res) => {
    var target_task_id = req.params[0];

    Todo.find({task_id: target_task_id})
        .sort( '-updated_at' )
        .exec( ( err, todos ) => {
            if (todos.length){
                return res.status(200).send(todos[0]);
            }
            res.status(404).send('NOT FOUND');
        });
})
.put((req, res) => {
    // curl -X PUT -H "Content-Type: application/json"  -d '{"task":"NewTask","status":true}' -w "\n"  http://localhost:3000/t_id

    var target_task_id = req.params[0];
    var taskExist = false;
    Todo.find({})
        .exec(( err, todos ) => {
            for (var task of todos) {
                if (task.task_id === target_task_id){   // TODO use mongo filter
                    taskExist = true;
                    res.status(200).send({result: "ok"});
                    task.task = req.body.task;
                    task.status = req.body.status;
                    task.save((err) => {
                        if( err ) console.log('error db update');
                    });
                }
            }
            if (!taskExist) {  res.status(404).send('NOT FOUND');  }
        });
})

.delete((req, res) => {
    // curl -X DELETE -H "Content-Type: application/json" -w "\n"  http://localhost:3000/t_id

    var target_task_id = req.params[0];
    Todo.find({})
        .exec(( err, todos ) => {
            for (var task of todos) {
                if (task.task_id === target_task_id){   // TODO use mongo filter
                    var taskExist = true;
                    res.status(200).send({result: "ok"});
                    task.remove((err) => {
                        if( err ) console.log('error db update');
                    });
                }
            }
            if (!taskExist) {  res.status(404).send('NOT FOUND');  }
        });
});


app.use((req, res) => {  // default request handle (should put in bottom)
    return res.status(404).send('NOT FOUND');
});


// MAIN
var port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Example app listening on port', port);
});
