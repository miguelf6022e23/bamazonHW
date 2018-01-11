var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

//Connect to SQL
var connection = mysql.createConnection({
  host: "localhost",
  port: 8889,
  user: "root",
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) {
    console.error(err);
  }
  console.log("connected to mysql!");
  items();
});

function items() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.table(res);
    pickItem(res);
  });
}

function pickItem(inventory) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "choice",
        message: "What item would you you like to purchase? (Pick item by id or quit with Q)",
        validate: function(val) {
          return !isNaN(val) || val.toLowerCase() === "q";
        }
      }
    ])
    .then(function(val) {
      exitCheck(val.choice);
      var choiceId = parseInt(val.choice);
      var product = InvCheck(choiceId, inventory);
      if (product) {
        pickQuant(product);
      }
      else {
        console.log("\nID out of range.");
        items();
      }
    });
}

function InvCheck(choiceId, inventory) {
  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i].item_id === choiceId) {
      return inventory[i];
    }
  }
  return null;
}

function pickQuant(product) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "quantity",
        message: "How many of the item would you like? (Press Q if you would like to quit)",
        validate: function(val) {
          return val > 0 || val.toLowerCase() === "q";
        }
      }
    ])
    .then(function(val) {
      exitCheck(val.quantity);
      var quantity = parseInt(val.quantity);
      if (quantity > product.stock_quantity) {
        console.log("\nInsufficient quantity!");
        items();
      }
      else {
        purchase(product, quantity);
      }
    });
}

function purchase(product, quantity) {
  connection.query(
    "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
    [quantity, product.item_id],
    function(err, res) {
      console.log("\nPurchased!");
      items();
    }
  );
}

function exitCheck(choice) {
  if (choice.toLowerCase() === "q") {
    console.log("Goodbye!");
    process.exit(0);
  }
}