const express = require('express');
const parser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const _ = require('lodash');
const dotenv = require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');
app.use(parser.urlencoded({
    extended: true
}));

app.use(express.static("public"));
const url = "mongodb+srv://admin-todolist-neeraj:" + process.env.PASSWORD + "@cluster0.etxoobi.mongodb.net/toDoListDB";
mongoose.connect(url, {
    useNewUrlParser: true
});
const itemsSchema = {
    name: String
}
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name: "Welcome to your toDoList!!"
});
const item2 = new Item({
    name: "Click the + button to add new task!"
});
const item3 = new Item({
    name: "<-- Click this to delete an Item"
});
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
let currentDay;
const List = mongoose.model("List", listSchema);
app.get("/", function(req, res) {
    let today = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    currentDay = today.toLocaleDateString("en-US", options);
    Item.find({}, function(err, results) {
        if (results.length == 0) {
            Item.insertMany(defaultItems, function(err) {
                if (!err) {
                    console.log("Successfully saved default item to database");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: currentDay,
                newTask: results
            });
        }
    });
});


app.post("/", function(req, res) {
    let itemName = req.body.newTask;
    const customListName = req.body.addButton;
    const item = new Item({
        name: itemName
    });
    if (customListName == currentDay) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({
            name: customListName
        }, function(err, result) {
            result.items.push(item);
            result.save();
            res.redirect("/" + customListName);
        });
    }
});


app.get("/:customName", function(req, res) {
    const listName = _.capitalize(req.params.customName);
    List.findOne({
        name: listName
    }, function(err, result) {
        if (!err) {
            // create new list
            if (!result) {
                const list = new List({
                    name: listName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + listName);
            } else {
                // show existing list.
                res.render("list", {
                    listTitle: listName,
                    newTask: result.items
                });
            }
        }
    });

})
app.post("/:delete", function(req, res) {
    const checkedId = req.body.checkbox;
    const dltListName = req.body.dltButton;
    // trying to create so that it would get redirected to the same page not to the homepage.
    // const backURL = req.header('Referer') || '/';
    if (dltListName == currentDay) {
        // delete the checked item.
        Item.findByIdAndRemove(checkedId, function(err) {
            res.redirect("/");
        });
    } else {
        // first find the current list, and then remove;
        List.findOneAndUpdate({
            name: dltListName
        }, {
            $pull: {
                items: {
                    _id: checkedId
                }
            }
        }, function(err, result) {
            if (!err) {
                res.redirect("/" + dltListName);
            }
        });
    }
});

app.listen(process.env.PORT || 3000, function() {
    console.log('Server started....');
});