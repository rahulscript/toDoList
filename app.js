const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
app.set("view engine", "ejs");
const port = 3000;
//bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
// static files setup
app.use(express.static("public"));

//mongodb connection
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
});

//itemSchema declaration
const itemsSchema = new mongoose.Schema({
  name: String,
});
//listSchema Declaration
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

//Data Models
const Item = mongoose.model("item", itemsSchema);
const List = mongoose.model("list", listSchema);
const a = new Item({
  name: "test",
});
const defaultList = [a]

// GET Methods
app.get("/", (req, res) => {
  Item.find()
    .then((foundItem) => {
      if (foundItem.length === 0) {
        const item = new Item({
          name: "First Task",
        });
        item.save();
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItem: foundItem });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/:customList", (req, res) => {
  const customList = _.capitalize(req.params.customList);
  List.findOne({ name: customList }).then((result) => {
    if (!result) {
      const list = new List({
        name: customList,
        items: defaultList,
      });
      list.save();
      res.redirect("/" + customList);
    } else {
      res.render("list", { listTitle: customList, newListItem: result.items });
    }
  });
  // console.log(customList);
});

//main list
// POST METHOD
app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((result) => {
      if (!result) {
        console.log("Error");
      } else {
        result.items.push(item);
        result.save();
        res.redirect("/" + listName);
      }
    });
  }
});

//delete request

app.post("/delete", (req, res) => {
  const checked = req.body.checkbox;
  const listName = req.body.list;
  if (listName == "Today") {
    Item.findByIdAndDelete(checked)
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checked } } }
    ).then((result) => {
      if (!result) {
        console.log("Error while deleting task");
      } else {
        res.redirect("/" + listName);
      }
    });
  }
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}/test`);
});
