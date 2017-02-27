var express = require('express');
var webdriver = require('selenium-webdriver'), By = webdriver.By, until = webdriver.until;
var Xray = require('x-ray');
var x = new Xray();
var bodyParser = require('body-parser');



var team_name, team_link;

var app = new express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var url = "https://oss.ticketmaster.com/aps/nyyreg/EN/buy/details/17CA81?tfl=New_York_Yankees-Tickets-Tickets_Info_Season_Tickets_Full_Season-na-x0";

var arrSection = [];
var arrRow = [];
var arrSeat = [];
var freeSections = [];
var allData = [];

app.use(express.static('public'));

//app.get('/scrap', function(req, res){

x(url, "iframe@src")
	(function(err, item) {
		if (err) console.log(err);
		else {
			var driver = new webdriver.Builder().forBrowser('firefox').build();

			driver.get(item);
			driver
				.wait(until.elementLocated(By.id('Complete_Section_116W')))
				.findElement(By.xpath("parent::*"))
				.getAttribute("innerHTML")
				.then(function(data) {
					var arr = data.split('\"');
					var sections_arr = [];

					for (var i = 0; i < arr.length; i += 1) {
						if (arr[i].split("")[0] === "C") {

							if(arr[i].split("")[17]!='0'){
								sections_arr.push({value: arr[i]});
							}
						}
					}

					sections_arr.reverse();

					function yankees(i) {

						driver
							.wait(until.elementLocated(By.id(sections_arr[i].value)), 200)
							.then(function() {
								driver
									.executeScript("$('#" + sections_arr[i].value + "').mouseover()")
									.then(function() {
										driver
                      .sleep(100)
                      .then(function() {
                        driver
                          .findElement(By.className('Section_Price_Rollover_Large_Text'))
                          .getText()
                          .then(function(result){

                            if(result != '0'){
                              freeSections.push(sections_arr[i-1].value);
                              console.log(sections_arr[i-1].value);
                              console.log(result);
                            }
                          });
                        });

															});

														if (i < sections_arr.length) {
                              i+=2;
                              if(i >= sections_arr.length){
                                //return ;

																function rec(n){
																	driver
																		.wait(until.elementLocated(By.id("Map")),12000)
																		.then(function(){
																			driver
																		.executeScript("$('#" + freeSections[n] + "').click()")
																		.then(function(){
																			driver
																				.wait(until.elementLocated(By.id('seatsBasicMapContainer')))
																				.findElement(By.xpath('div'))
																				.getAttribute('innerHTML')
																				.then(function(data){

																				var arr = data.split('<div class="');
																				arr.shift();
																				arr.unshift('');
																				data = arr.join('!');

																				arr = data.split('" id="');
																				data = arr.join('!');

																				arr = data.split('" style="');
																				data = arr.join('!');
																				arr = data.split('!');

																				var arrId = [];

																				for(var j = 0; j < arr.length; j++){
																					if(j % 3 === 1){
																						if(arr[j] == 'seatUnavailable'){
																							arr[j] = '';
																						}else{
																							arrId.push(arr[j + 1]);

																							driver
																								.executeScript("$('#" + arr[j+1] + "').mouseover()")
																								.then(function(){

																									driver
																										.sleep(100)
																										.then(function(){

																											driver
																												.findElement(By.className('seat_rollover_holder'))
																												.getAttribute("innerHTML")
																												.then(function(info){

																													var str = info.split("<span>");
																													info = str.join("!");
																													str = info.split("</span>");
																													info = str.join("!");
																													str = info.split("!");
																													var arrData = [];

																													for(var m = 0; m < str.length; m++){

																														if(m == 1 || m == 3 || m == 5 || m == 7){
																															arrData.push(str[m]);
																														}

																													}

																													allData.push(arrData);

																													console.log(arrData);

																												});

																										});

																								});

																									}
																						}
							  													}
																							console.log(arrId);

																							driver
																								.executeScript("$('#Back_Btn').click()")
																								.then(function(){

																															n++;
																															if(n!=freeSections.length){
																																setTimeout(function() {rec(n)}, 5000);
																															}
																															else{

																																return;
																															}


																												});
																		});
																		});
																	});
																}
																rec(0);


                              }else{

															setTimeout(function() {yankees(i)}, 200);
                            }

														}
													});

					}

					yankees(0);



				});

		driver.sleep(10000000);
		driver.quit();
	}
});


app.get('/scrap', function(req, res){

res.json({a:allData});

});

app.listen(8000);
