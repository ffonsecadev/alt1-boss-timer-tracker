require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./appconfig.json");
require("!file-loader?name=[name].[ext]!./style.css");
require("!file-loader?name=[name].[ext]!./assets/fonts/OpenSans-Regular.ttf");
require("!file-loader?name=[name].[ext]!./assets/fonts/OpenSans-Bold.ttf");
import * as a1lib from "@alt1/base"; 
import { Domain } from "domain";
import ChatBoxReader from "./chatbox";

window.onload = function(){
	new BossTimerTrack().start();
}
 
type PlayerTime = {
	name: string,
	boss: number,
	time: string
};

class BossTimerTrack {
	private screen: a1lib.ImgRefBind;
	private chatBox: ChatBoxReader;
	private playerTimer: PlayerTime = {
		name: "",
		boss: -1,
		time: ""
	};

	private timers: string[];

	constructor(){
		this.screen = a1lib.captureHoldFullRs();
		this.chatBox = new ChatBoxReader();
	}

	public start(){
		let result = this.chatBox.find(this.screen);
		if(result == null){
			this.eventShow("We couldn't find your chatbox", true);
			return;
		}

		this.playerTimer.name = this.fetchPlayerName();
		if(this.playerTimer.name == ""){
			this.eventShow("We couldn't find your name", true);
			return;
		}

		DOM.setPlayerName(this.playerTimer.name);
		DOM.showDisplay(true);
		this.detectChat();
	}

	private fetchPlayerName(){
		return this.chatBox.playerName();
	}

	private detectChat(){
	 	this.sendTime();
		setInterval(() => {
			let chat = this.chatBox.read();
			if(chat == null){
				return;
			}
	
			chat.map((message) => {
				this.fetchBossName(message.text);
				if(message.text.indexOf("Completion Time") > -1){
					let split = message.text.split("Completion Time: ");
					let timer = split[1];
					if(!this.timers.includes(timer)){
						this.sendTime();
						DOM.setLastTime(timer);
						this.timers.push(timer);
					}
					return;
				}
			});
		}, 1000);
	}

	private sendTime(){
		if(this.playerTimer.boss != -1){
			const response = fetch("https://runepixels.com/players/timer", {
				method: 'POST',
				body: JSON.stringify(this.sendTime),
				headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'} });

			response.then((x: any) => {
				this.eventShow(JSON.stringify(x));
			});
				
			response.catch((err: any) => {
				this.eventShow(JSON.stringify(err));
			});
		}
	}

	private fetchBossName(text: string){
		if(text.indexOf("session against:") > -1){
			let boss = text.split("session against:")[1];
			boss = boss.slice(0, -1)
			DOM.setBossName(boss);
			switch(boss){
				case "Raksha":{
					this.playerTimer.boss = 0;
					return;
				}
			}
		}
	}

	private eventShow(content: string, isError: boolean = false){
		if(isError){
			DOM.event().classList.add("error");
		}
		DOM.event().innerHTML = content;
	}
}

class DOM {
	public static showDisplay(state: boolean){
		this.display().style.display = state ? "block" : "none";
	}

	public static setPlayerName(name: string){
		this.playerName().innerHTML = name;
	}

	public static setBossName(name: string){
		this.bossName().innerHTML = name;
	}

	public static setLastTime(timer: string){
		this.lastTime().innerHTML = timer;
	}

	public static event(): HTMLElement{
		return document.getElementById("eventText");
	}

	private static display(): HTMLElement {
		return document.getElementById("display");
	}

	private static playerName(): HTMLElement {
		return document.getElementById("playerName");
	}

	private static bossName(): HTMLElement {
		return document.getElementById("bossName");
	}

	private static lastTime(): HTMLElement {
		return document.getElementById("lastTimer");
	}
}




/* var playerTime = {
	name: null,
	boss: null,
	time: null
}

var chatBox = null;
var lastTimers = []; */

/* window.onload = function(){
	let img = a1lib.captureHoldFullRs();
	chatBox = new ChatBoxReader();
	chatBox.find(img);
	let state = detectPlayer();
	if(state){
		detectChat();
		playerTime.boss = 0;
		playerTime.time = "00:01";
		sendTime();
	}
}

function detectPlayer(){
	playerTime.name = chatBox.playerName();
	let state = document.getElementById("status");

	if(playerTime.name != ""){
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
		let currentBoss = message.split("session against:")[1];
		document.getElementById("boss").innerHTML = currentBoss;
		playerTime.boss = 1;
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

async function sendTime(){
	const response = await fetch("http://localhost:8080/players/time", {
		method: 'POST',
		body: JSON.stringify(playerTime),
		headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'} });

	console.error(response);

	if (!response.ok) { 
		
	}
} */

