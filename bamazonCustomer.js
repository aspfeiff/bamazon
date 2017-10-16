var fs= require("fs");
var prompt= require("prompt")
var inquirer= require("inquirer");
var mysql= require("mysql");
var cliTable= require("cli-table");

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	database : 'bamazon'
});

connection.connect();

var purchase = function() {
	
		connection.query('SELECT * FROM products', function(err, result) {

		if(err)console.log(err);

		var table = new cliTable ({
			head: ['item_id', 'product_name', 'department', 'price', 'stock_quantity']
		});


		console.log("Here is a list of our products: ");

		for (var i = 0; i < result.length; i++) {
			table.push([result[i].item_id, result[i].product_name, result[i].department_name, result[i].price.toFixed(2), result[i].stock_quantity]);
		}

		console.log(table.toString());

		inquirer.prompt([{
			name: "item_id",
			type: "input",
			message: "What is the item id of the product you would like to purchase?",
			validate: function(value) {
				if (isNaN(value) == false) {
					
					return true;
				} 
				
				else {
					return false;
				}
			}
		}, {
			name: "quantity",
			type: "input",
			message: "Please enter the quantity of the item you would like to purchase?",
			validate: function(value) {
				if (isNaN(value) == false) {
					return true;
				} 
				
				else {
					return false;
				}
			}
		}]).then(function(answer) {
			var id = answer.item_id
			var product = result[id]
			var quantity = answer.quantity
			if (quantity < result[id].stock_quantity) {
				console.log("Your total for " + answer.quantity + " " + result[id].product_name + " is: " + result[id].price.toFixed(2) * quantity);
				connection.query("UPDATE products SET ? WHERE ?", [{
					stock_quantity: result[id].stock_quantity - quantity
				}, {
					item_id: result[id].item_id
				}], function(err, result) {

					if(err)console.log(err);

					purchase();
				});

			} 

			else {
				console.log("Insufficient quantity! Your order cannot be completed at this time.");
				
				purchase();
			}
		})
	})
}


purchase();
