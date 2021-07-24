require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./settings.html");
require("!file-loader?name=[name].[ext]!./appconfig.json");
require("!file-loader?name=[name].[ext]!./style.css");
require("!file-loader?name=[name].[ext]!./assets/fonts/OpenSans-Regular.ttf");
require("!file-loader?name=[name].[ext]!./assets/fonts/OpenSans-Bold.ttf");
import * as a1lib from "@alt1/base";
import { ImgRef } from "@alt1/base";
import ChatBoxReader from "./chatbox";
import * as OCR from "@alt1/ocr";

const host = location.origin.indexOf("file://") > -1 ?
	"http://localhost:8080" :
	"https://runepixels.com:5000";




window.onload = function () {
	if(location.pathname.indexOf("settings") > -1){
		let bossTimerTrack = new BossTimerTrack();
		bossTimerTrack.start(false);
		loadSettings(bossTimerTrack.playerName())
		return;
	}

	new BossTimerTrack().start();
}


function loadSettings(name: string){
	const response = fetch(host + "/players/timer-settings/state?name=" + name, {
		method: 'GET',
		headers: {
			'content-type': 'application/json'
		}
	});

	response.then(response=> response.json())
		.then(data=> { 
			let state = data.state;
			document.getElementById(state ? "private": "public").classList.add("active");
			if(state){
				document.getElementById("pin").style.display = "block";
			}
			document.getElementById("loading").style.display = "none";
			document.getElementById("loaded").style.display = "block";
		});

	response.catch((err: any) => {
		location.href = "index.html";
	});

	document.getElementById("public").addEventListener("click", function(){
		loading();
		let request = fetch(host + "/players/timer-settings", {
			method: 'POST',
			body: JSON.stringify({name: name, pin: "" }),
			headers: {
				'content-type': 'application/json'
			}
		});
		request.then(()=> location.reload());
		request.catch(() =>location.reload());
	});

	document.getElementById("private").addEventListener("click", function(){
		document.getElementById("public").classList.remove("active");
		document.getElementById("private").classList.add("active");
		document.getElementById("pin").style.display = "block";
	});

	document.getElementById("submitPin").addEventListener("click", function(){
		let pin = (document.querySelector("#pin input") as HTMLInputElement).value;
		if(pin.length == 0){
			return;
		}

		let request = fetch(host + "/players/timer-settings", {
			method: 'POST',
			body: JSON.stringify({name: name, pin: pin }),
			headers: {
				'content-type': 'application/json'
			}
		});
		request.then(()=> location.reload());
		request.catch(() =>location.reload());
	});

	function loading(){
		document.getElementById("loading").style.display = "block";
		document.getElementById("loaded").style.display = "none";
	}
}

type PlayerTime = {
	name: string,
	boss: number,
	timer: string
	rsTimer: string;
};

type Timer = {
	timer: string,
	rsTimer: string
};

class BossTimerTrack {
	private targetMob: TargetMobReader;
	private screen: a1lib.ImgRefBind;
	private chatBox: ChatBoxReader;
	private playerTimer: PlayerTime = {
		name: "",
		boss: -1,
		timer: "",
		rsTimer: ""
	};
	private timers: Timer[] = [];
	private lastBossName = "";

	constructor() {
		this.screen = a1lib.captureHoldFullRs();
		this.chatBox = new ChatBoxReader();
		this.targetMob = new TargetMobReader();
	}

	public start(initAll = true) {
		let result = this.chatBox.find(this.screen);
		if (result == null) {
			this.eventShow("We couldn't find your chatbox", true);
			return;
		}

		this.playerTimer.name = this.fetchPlayerName();
		if (this.playerTimer.name == "") {
			this.eventShow("We couldn't find your name", true);
			return;
		}

		if(initAll){
			DOM.showSettings(true);
			DOM.setPlayerName(this.playerTimer.name);
			DOM.showDisplay(true);
			this.detectChat();
		}
	}

	public playerName(){
		return this.playerTimer.name;
	}

	private fetchPlayerName() {
		return this.chatBox.playerName();
	}

	private detectChat() {
		setInterval(() => {
			let chat = this.chatBox.read();
			if (chat == null || chat.length == 0) {
				if (this.playerTimer.boss == -1) {
					this.fetchBossName("");
				}
				return;
			}

			chat.map((message) => {
				if (this.playerTimer.boss == -1) {
					this.fetchBossName(message.text);
				}

				if (message.text.indexOf("Completion Time") > -1 && message.fragments.length > 1) {
					if (this.playerTimer.boss == -1) {
						return;
					}
					let split = message.text.split("Completion Time: ");
					let timer = split[1];

					if (timer.indexOf("- New Personal Record!") > -1) {
						timer = timer.split(" - New Personal Record!")[0]
					}

					if(timer.match(/:/g).length <= 1){
						timer = "00:" + timer
					}

					let rsTimer = message.fragments[1].text;
					if (this.timers.find((x) => x.rsTimer == rsTimer) == null) {
						this.playerTimer.timer = timer;
						this.playerTimer.rsTimer = rsTimer;
						this.sendTime();
						this.timers.push({
							timer: timer, 
							rsTimer: rsTimer
						});

						DOM.updateTimersList(this.timers);
					}
				}
			});
		}, 1000);
	}

	private sendTime() {
		this.eventShow("...", false);
		if (this.playerTimer.boss == -1) {
			return;
		}

		const response = fetch(host + "/players/addtimer", {
			method: 'POST',
			body: JSON.stringify(this.playerTimer),
			headers: {
				'content-type': 'application/json'
			}
		});

		response.then(() => {
			this.eventShow("...", false);
			this.playerTimer.boss = -1;
			this.playerTimer.timer = "";
			this.playerTimer.rsTimer = "";
		});

		response.catch((err: any) => {
			this.eventShow("Error save the timer", true);
			this.playerTimer.boss = -1;
			this.playerTimer.timer = "";
			this.playerTimer.rsTimer = "";
		});
	}

	private fetchBossName(text: string) {
		if (text != "" && text.indexOf("session against:") > -1) {
			let boss = text.split("session against:")[1];
			boss = boss.slice(0, -1).trim();
			this.setBoss(boss); 
			
			if(this.playerTimer.boss > -1){
				DOM.setBossName(boss);
				if(this.lastBossName != boss){
					this.lastBossName = boss;
					this.timers = [];
					DOM.updateTimersList(this.timers);
				}
			}
			return;
		}

		let boss = this.targetMob.read();
		if (boss != null && boss.name.length > 0) {
			this.setBoss(boss.name);

			if(this.playerTimer.boss > -1){
				DOM.setBossName(boss.name);
				if(this.lastBossName != boss.name){
					this.lastBossName = boss.name;
					this.timers = [];
					DOM.updateTimersList(this.timers);
				}
			}
		}
	}

	private setBoss(boss: string) {
		switch (boss) {
			case "The Ambassador": { this.playerTimer.boss = 0; return; }
			case "Araxxor": { this.playerTimer.boss = 1; return; }
			case "Astellarn": { this.playerTimer.boss = 2; return; }
			case "Barrows - Rise of the Six": { this.playerTimer.boss = 3; return; }
			case "Beastmaster Durzag": { this.playerTimer.boss = 4; return; }
			case "Beastmaster Durz...": { this.playerTimer.boss = 4; return; }
			case "Black stone dragon": { this.playerTimer.boss = 5; return; }
			case "Commander Zilyana": { this.playerTimer.boss = 6; return; }
			case "Corporeal Beast": { this.playerTimer.boss = 7; return; }
			case "Crassian Leviathan": { this.playerTimer.boss = 8; return; }
			case "General Graardor": { this.playerTimer.boss = 9; return; }
			case "Giant Mole": { this.playerTimer.boss = 10; return; }
			case "Gregorovic": { this.playerTimer.boss = 11; return; }
			case "Har-Aken": { this.playerTimer.boss = 12; return; }
			case "Helwyr": { this.playerTimer.boss = 13; return; }
			case "Kalphite King": { this.playerTimer.boss = 14; return; }
			case "Kalphite Queen": { this.playerTimer.boss = 15; return; }
			case "King Black Dragon": { this.playerTimer.boss = 16; return; }
			case "Kree'arra": { this.playerTimer.boss = 17; return; }
			case "K'ril Tsutsaroth": { this.playerTimer.boss = 18; return; }
			case "The Magister": { this.playerTimer.boss = 19; return; }
			case "Masuta the Ascended": { this.playerTimer.boss = 20; return; }
			case "Nex": { this.playerTimer.boss = 21; return; }
			case "Nex: Angel of Death": { this.playerTimer.boss = 22; return; }
			case "Queen Black Dragon": { this.playerTimer.boss = 23; return; }
			case "Raksha, the Shadow Colossus": { this.playerTimer.boss = 24; return; }
			case "The Sanctum Guardian": { this.playerTimer.boss = 25; return; }
			case "Seiryu the Azure Serpent": { this.playerTimer.boss = 26; return; }
			case "Solak": { this.playerTimer.boss = 27; return; }
			case "Taraket the Necromancer": { this.playerTimer.boss = 28; return; }
			case "Telos, the Warden": { this.playerTimer.boss = 29; return; }
			case "Twin Furies": { this.playerTimer.boss = 30; return; }
			case "TzTok-Jad": { this.playerTimer.boss = 31; return; }
			case "Verak Lith": { this.playerTimer.boss = 32; return; }
			case "Vindicta": { this.playerTimer.boss = 33; return; }
			case "Vorago": { this.playerTimer.boss = 34; return; }
			case "Yakamaru": { this.playerTimer.boss = 35; return; }
			default: {
				if (boss.indexOf("Legio") > -1) {
					this.playerTimer.boss = 36;
					return;
				}
			}
		}

		this.playerTimer.boss = -1;
		this.eventShow(boss + " not found", true);
	}

	private eventShow(content: string, isError: boolean = false) {
		DOM.event().classList.remove("error");
		if (isError) {
			DOM.event().classList.add("error");
		}

		DOM.event().innerHTML = content;
	}
}

class DOM {
	public static showDisplay(state: boolean) {
		if(this.display())
			this.display().style.display = state ? "block" : "none";
	}

	public static setPlayerName(name: string) {
		if(this.playerName())
			this.playerName().innerHTML = name;
	}

	public static setBossName(name: string) {
		if(this.bossName())
			this.bossName().innerHTML = name;
	}

	public static updateTimersList(timer: Timer[]) {
		if (this.timerList()){
			this.timerList().innerHTML = "";
			let currentBest = new Date().getTime();
			let currentTimer = "";
			
			timer.map((timer: Timer) => {
				let stringDate = "0001-01:01";
	
				let date = Date.parse(stringDate);
				if(date < currentBest){			
					currentBest = date;
					currentTimer = timer.timer;
				}

				let shortTimer =  timer.timer;

				if(shortTimer.startsWith("00:")){
					shortTimer = timer.timer.split("00:")[1];
				}

				this.timerList().insertAdjacentHTML("afterbegin", "<span timer='"+ timer.timer +"'>" + shortTimer + "</span>");
			});
	
			let elements = this.timerList().querySelectorAll("span");
			if(elements.length > 0){
				elements.forEach((element) => {
					element.classList.remove("best");
					if(element.getAttribute("timer") == currentTimer){
						element.classList.add("best");
					}
				});
			}
		}
	}

	public static event(): HTMLElement {
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

	private static timerList(): HTMLElement {
		return document.getElementById("timers");
	}

	public static showSettings(state: boolean) {
		if(document.getElementById("settings"))
			document.getElementById("settings").style.display = state ? "block" : "none";
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