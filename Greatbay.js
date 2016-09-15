const mysql = require ("mysql");
const inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", 
    password: "",
    database: "nodebay_inventory"
})



var Program = function(){
	console.log('Welcome to Nodebay! Follow the instructions below, or use CTRL + C to end the program.')
	inquirer.prompt([
	{
		type: 'list',
		message: "What transaction would you like to complete today?",
		choices: ["Post an item", "Bid on an item"],
		name: "name"

	}

		]).then(function(action){
			if (action.name == "Post an item"){
				inquirer.prompt([
					{
						type: 'input',
						message: 'What item would you like to post?',
						name: 'itemName'
					},
					{
						type: 'input',
						message: 'What initial price would you like to list the item for?',
						name: 'itemPrice'
					}
					]).then(function(item){
						var params = {item: item.itemName, price: item.itemPrice};
						connection.query("INSERT INTO inventory_list SET ?", params, function(err, res) {
							if(err) return (err);
						});
						console.log("item added!")
						console.log(item.itemName)
						console.log(item.itemPrice)
						Program();	
					});
			}
			else{
				connection.query('SELECT * FROM inventory_list', function(err, res){
					for (var i=0; i < res.length; i++){
						console.log(res[i].item + " | " + res[i].price);

					}
					console.log("-------------------------------");
					inquirer.prompt([
					{
						type: "input",
						message: "Which item would you like to bid on?",
						name: "itemSelect"
					},
					{
						type: "input",
						message: "How much would you like to bid?",
						name: "userBid"
					}
						]).then(function(bid){
							connection.query('SELECT ? FROM inventory_list', bid.itemSelect, function(err, res){
								if( bid.userBid > res.price){
									connection.query("UPDATE inventory_list SET ? WHERE ?",[
										{price: bid.userBid},
										{item: res.item}
									], function(err, res) {});
								}
								else{
									console.log("Please enter an amount greater than the existing bid to continue.");
									Program();
								}
							})

						})
					
					
				})

			}
		})
}
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  console.log('connected as id ' + connection.threadId);
  Program();
});
connection.end();