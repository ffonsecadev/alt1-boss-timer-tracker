require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./appconfig.json");
require("!file-loader?name=[name].[ext]!./style.css");
require("!file-loader?name=[name].[ext]!./assets/fonts/OpenSans-Regular.ttf");
require("!file-loader?name=[name].[ext]!./assets/fonts/OpenSans-Bold.ttf");
import * as a1lib from "@alt1/base"; 
import ChatBoxReader from "./chatbox";

var chatBox = null;
var currentBoss = null;
var lastTimers = [];

window.onload = function(){
	let img = a1lib.captureHoldFullRs();
	chatBox = new ChatBoxReader();
	chatBox.find(img);
	let state = detectPlayer();
	if(state){
		detectChat();
	}
}

function detectPlayer(){
	let playerName = chatBox.playerName();
	let state = document.getElementById("status");
	if(playerName != ""){
		state.classList.add("active");
		state.innerHTML = "Active";
		return true;
	}

	state.classList.add("error");
	state.innerHTML = "Error detecting player name";
	return false;
}

function detectBoss(message){
	if(message.indexOf("session against:") > -1){
		currentBoss = message.split("session against:")[1];
		document.getElementById("boss").innerHTML = currentBoss;
	}
}

function detectChat(){
	let interval = setInterval(() => {
		let chat = chatBox.read();
		if(chat == null){
			return;
		}

		chat.map((message) => {
			detectBoss(message.text);
			if(message.text.indexOf("Completion Time") > -1){
				let split = message.text.split("Completion Time: ");
				let time = split[1];
				if(!lastTimers.includes(time)){
					document.getElementById("timers").insertAdjacentHTML("beforeend", time + "<br>");
					lastTimers.push(time);
				}
				return;
			}
		});
	}, 1000);


	
	
}

	


	


/* 	setInterval(() => {
		let imgdata = a1lib.capture(chatBox.pos.mainbox.rect);
		imgdata.show();
	}, 1000); */

	/* let read = chatBox.read(); */


	

/* 	read.map((x) => {
		console.error(x.text);
	});  */


	/* let chatMessa */




/* 
	console.error(playerName); */


	/* let read = chatBox.read();

	read.map((x) => {
		console.error(x.text);
	}); */



/* 	var data = chatBox.playerName();
	console.error(data);  */



/* 	let rect = chatBoxImage.mainbox.rect;
	rect.height += 14; */
/* 
	console.error(chatBoxImage.mainbox.rect); */
/* 	let imgdata = a1lib.capture(rect); */

	
	/* var data = chatBox.playerName();
	console.error(data); */
/* 	var leftmargin = (chatBoxImage.mainbox.leftfound ? 0 : 300);
	let imgx = chatBoxImage.mainbox.rect.x - leftmargin;
		let imgy = chatBoxImage.mainbox.rect.y;
		var imgdata = a1lib.capture(imgx, imgy, chatBoxImage.mainbox.rect.width + leftmargin, chatBoxImage.mainbox.rect.height);
		imgdata.show();
 */

/* 	var read = chatBox.read();

	console.error(read);


	imgdata.show(); */
	
	/* console.error(chatBox.); */

	/* img.toData().show(); */