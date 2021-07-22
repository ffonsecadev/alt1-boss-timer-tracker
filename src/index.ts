require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./appconfig.json");
require("!file-loader?name=[name].[ext]!./style.css");
require("!file-loader?name=[name].[ext]!./assets/fonts/OpenSans-Regular.ttf");
require("!file-loader?name=[name].[ext]!./assets/fonts/OpenSans-Bold.ttf");
import * as a1lib from "@alt1/base";
import { ImgRef } from "@alt1/base";
import ChatBoxReader from "./chatbox";
import * as OCR from "@alt1/ocr";

window.onload = function () {
	new BossTimerTrack().start();
}

type PlayerTime = {
	name: string,
	boss: number,
	timer: string
};

class BossTimerTrack {
	private targetMob: TargetMobReader;
	private screen: a1lib.ImgRefBind;
	private chatBox: ChatBoxReader;
	private playerTimer: PlayerTime = {
		name: "",
		boss: -1,
		timer: ""
	};
	private timers: string[] = [];

	constructor() {
		this.screen = a1lib.captureHoldFullRs();
		this.chatBox = new ChatBoxReader();
		this.targetMob = new TargetMobReader();
		this.timers.push("00:11");
		this.timers.push("00:12");
		this.refreshTimersList();
	}

	public start() {
		this.refreshTimersList();
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

		DOM.setPlayerName(this.playerTimer.name);
		DOM.showDisplay(true);
		this.detectChat();
	}

	private fetchPlayerName() {
		return this.chatBox.playerName().trim();
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

				if (message.text.indexOf("Completion Time") > -1) {
					let split = message.text.split("Completion Time: ");
					let timer = split[1];
					if (timer.indexOf("- New Personal Record!") > -1) {
						timer = timer.split(" - New Personal Record!")[0]
					}
					if (!this.timers.includes(timer)) {
						this.playerTimer.timer = timer;
						this.sendTime();
						this.timers.push(timer);
						this.refreshTimersList();
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

		let url = location.origin.indexOf("file://") > -1 ?
			"http://localhost:8080/players/timer" :
			"https://runepixels.com:5000/players/timer";

		const response = fetch(url, {
			method: 'POST',
			body: JSON.stringify(this.playerTimer),
			headers: {
				'content-type': 'application/json',
				'origin': location.origin
			}
		});

		response.then(() => {
			this.eventShow("...", false);
			DOM.setBossName("...");
			this.playerTimer.boss = -1;
			this.playerTimer.timer = "";
		});

		response.catch((err: any) => {
			this.eventShow("Error save the timer", true);
			DOM.setBossName("...");
			this.playerTimer.boss = -1;
			this.playerTimer.timer = "";
		});
	}

	private fetchBossName(text: string) {
		if (text != "" && text.indexOf("session against:") > -1) {
			let boss = text.split("session against:")[1];
			boss = boss.slice(0, -1).trim();
			DOM.setBossName(boss);
			this.setBoss(boss);
			return;
		}

		let boss = this.targetMob.read();
		if (boss != null && boss.name.length > 0) {
			DOM.setBossName(boss.name);
			this.setBoss(boss.name);
		}
	}

	private setBoss(boss: string) {
		switch (boss) {
			case "Vorago": {
				this.playerTimer.boss = 0;
				return;
			}
			case "Solak": {
				this.playerTimer.boss = 1;
				return;
			}
			case "Barrows - Rise of the Six": {
				this.playerTimer.boss = 2;
				return;
			}
			case "Araxxor": {
				this.playerTimer.boss = 3;
				return;
			}
			case "Kalphite King": {
				this.playerTimer.boss = 4;
				return;
			}
			case "WildyWyrm": {
				this.playerTimer.boss = 5;
				return;
			}
			case "Queen Black Dragon": {
				this.playerTimer.boss = 6;
				return;
			}
			case "Corporeal Beast": {
				this.playerTimer.boss = 7;
				return;
			}
			case "The Magister": {
				this.playerTimer.boss = 8;
				return;
			}
			case "Nex: Angel of Death": {
				this.playerTimer.boss = 9;
				return;
			}
			case "K'ril Tsutsaroth": {
				this.playerTimer.boss = 10;
				return;
			}
			case "General Graardor": {
				this.playerTimer.boss = 11;
				return;
			}
			case "Kree'arra": {
				this.playerTimer.boss = 12;
				return;
			}
			case "Telos, the Warden": {
				this.playerTimer.boss = 13;
				return;
			}
			case "Gregorovic": {
				this.playerTimer.boss = 14;
				return;
			}
			case "Twin Furies": {
				this.playerTimer.boss = 15;
				return;
			}
			case "Vindicta": {
				this.playerTimer.boss = 16;
				return;
			}
			case "Helwyr": {
				this.playerTimer.boss = 17;
				return;
			}
			case "Kalphite Queen": {
				this.playerTimer.boss = 18;
				return;
			}
			case "Chaos Elemental": {
				this.playerTimer.boss = 19;
				return;
			}
			case "King Black Dragon": {
				this.playerTimer.boss = 20;
				return;
			}
			case "Giant Mole": {
				this.playerTimer.boss = 21;
				return;
			}
			case "Beastmaster Durzag": {
				this.playerTimer.boss = 22;
				return;
			}
			case "Yakamaru": {
				this.playerTimer.boss = 23;
				return;
			}
			case "TzTok-Jad": {
				this.playerTimer.boss = 24;
				return;
			}
			case "Har-Aken": {
				this.playerTimer.boss = 25;
				return;
			}
			default: {
				if (boss.indexOf("Dagannoth") > -1) {
					this.playerTimer.boss = 26;
					return;
				}

				if (boss.indexOf("Legio") > -1) {
					this.playerTimer.boss = 27;
					return;
				}
			}
		}

		this.eventShow(boss + " not found", true);
	}

	private refreshTimersList() {
		DOM.clearList();
		this.timers.map((timer: string) => {
			DOM.setTimer(timer);
		})
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
		this.display().style.display = state ? "block" : "none";
	}

	public static setPlayerName(name: string) {
		this.playerName().innerHTML = name;
	}

	public static setBossName(name: string) {
		this.bossName().innerHTML = name;
	}

	public static clearList(){
		this.timerList().innerHTML = "";
	}

	public static setTimer(timer: string) {
		this.timerList().insertAdjacentHTML("afterbegin", "<span>" + timer + "</span>");
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