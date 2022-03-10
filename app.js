const express = require('express');
const parser = require('body-parser');
const ejs = require('ejs');

let tasks = [];
let workTask = [];
const app = express();
app.set('view engine', 'ejs');
app.use(parser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.get("/", function(req, res) {
    let today = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    let currentDay = today.toLocaleDateString("en-US", options);
    res.render("list", { listTitle: currentDay, newTask: tasks });
});


app.post("/", function(req, res) {
    let item = req.body.newTask;
    if (req.bosy.list === 'work') {
        workTask.push(item);
        res.redirect("/work");
    } else {
        tasks.push(item);
        res.redirect("/");
    }
});

app.get("/work", function(req, res) {
    res.render("list", { listTitle: "Work", newTask: workTask });
});

app.post("/work", function(req, res) {
    let item = req.body.newTask;
    workTask.push(item);
    res.redirect("/work");
});

app.listen(3000, function() {
    console.log('Server started....');
});