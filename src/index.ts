require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./appconfig.json");
require("!file-loader?name=[name].[ext]!./style.css");
require("!file-loader?name=[name].[ext]!./assets/fonts/OpenSans-Regular.ttf");
require("!file-loader?name=[name].[ext]!./assets/fonts/OpenSans-Bold.ttf");
import * as a1lib from "@alt1/base";
import { ImgRef } from "@alt1/base";
import ChatBoxReader from "./chatbox";
import * as OCR from "@alt1/ocr";

window.onload = function(){
	new BossTimerTrack().start();
	/* var teste = new TargetMobReader().read();
	console.error(teste); */
}
 
type PlayerTime = {
	name: string,
	boss: number,
	time: string
};

class BossTimerTrack {
	private targetMob: TargetMobReader;
	private screen: a1lib.ImgRefBind;
	private chatBox: ChatBoxReader;
	private playerTimer: PlayerTime = {
		name: "",
		boss: -1,
		time: ""
	};
	private timers: string[] = [];

	constructor(){
		this.screen = a1lib.captureHoldFullRs();
		this.chatBox = new ChatBoxReader();
		this.targetMob = new TargetMobReader();
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
		return this.chatBox.playerName().trim();
	}

	private detectChat(){
		setInterval(() => {
			let chat = this.chatBox.read();
			if(chat == null){
				return;
			}

			chat.map((message) => {
				if(this.playerTimer.boss == -1){
					this.fetchBossName(message.text);
				}
				
				if(message.text.indexOf("Completion Time") > -1){
					let split = message.text.split("Completion Time: ");
					let timer = split[1];
					if(!this.timers.includes(timer)){
						this.sendTime();
						DOM.setLastTime(timer);
						this.timers.push(timer);
					}
				}
			});
		}, 1000);
	}

	private sendTime(){
		if(this.playerTimer.boss != -1){
			return;
		}
		
		const response = fetch("https://runepixels.com/players/timer", {
			method: 'POST',
			body: JSON.stringify(this.sendTime),
			headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'} 
		});

		response.then(() =>{
			this.eventShow("...", false);
			DOM.setBossName("...");
			this.playerTimer.boss = -1;
		});
			
		response.catch((err: any) => {
			this.eventShow("Error save the timer", true);
			DOM.setBossName("...");
			this.playerTimer.boss = -1;
			console.error(err);
		});
	}

	private fetchBossName(text: string){
		if(text.indexOf("session against:") > -1){
			let boss = text.split("session against:")[1];
			boss = boss.slice(0, -1).trim();
			DOM.setBossName(boss);
			this.setBoss(boss);
			return;
		}

		let boss = this.targetMob.read(this.screen);
		if(boss != null && boss.name.length > 0){
			DOM.setBossName(boss.name);
			this.setBoss(boss.name);
		}
	}

	private setBoss(boss: string){
		switch(boss){
			case "Raksha":{
				this.playerTimer.boss = 0;
				return;
			}
			case "King Black Dragon":{
				this.playerTimer.boss = 5;
				return;
			}
		}
	}

	private eventShow(content: string, isError: boolean = false){
		DOM.event().classList.remove("error");
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

var chatfont = require("@alt1/ocr/fonts/aa_8px_new.fontmeta.json");

var imgs = a1lib.ImageDetect.webpackImages({
	detectimg: require("./assets/images/detectimg.data.png")
});

class TargetMobReader {
	state: { hp: number, name: string } | null = null;
	lastpos: a1lib.PointLike | null = null;

	read(img?: ImgRef) {
		if (!img) { img = a1lib.captureHoldFullRs(); }
		var pos = img.findSubimage(imgs.detectimg);
		if (pos.length != 0) {
			var data = img.toData(pos[0].x - 151, pos[0].y - 16, 220, 44);
			var mobname = OCR.findReadLine(data, chatfont, [[255, 255, 255]], 62, 18, 20, 1);
			var mobhp = OCR.findReadLine(data, chatfont, [[255, 203, 5]], 92, 39, 20, 1);
			this.lastpos = pos[0];
			this.state = {
				name: mobname.text,
				hp: +mobhp.text
			};
		} else {
			this.state = null;
		}
		return this.state;
	}
}