const http = require('http');
const WebSocketServer = require('ws').Server;
const {spawn, exec} = require('child_process');
const express = require('express');
const net = require('net');
const isJSON = require('is-json');

const adbkit = require('adbkit');
const Minicap = require('./minicap');
const Minitouch = require('./minitouch');
const Serialize = require('./serialize');

class Server {

	constructor(){
		this.app = express();
		this.server = null;
		this.minicap_port = 1717;
		this.minitouch_port = 1111;
		this.port = process.env.port || 9002;

		this.minicap = new Minicap(this.minicap_port);
		this.minitouch = new Minitouch(this.minitouch_port);

		this.deviceInfo = {};
	}

	initialize(){
		let server = http.createServer(this.app);
		this.wss = new WebSocketServer({server: server});
		server.listen(this.port);
		console.info(`======] Listening on port %d [======`, this.port);

		console.log(`Getting All Device Info`);
		this.getDeviceInfo()
			.then(this.getMinitouchInfo.bind(this))
			.then(this.getDeviceResolution.bind(this))
			.then(info => {
				console.log(`Device Info Retrieved.`, info);
				console.log(`Connecting WebSocket`);
				this.connect();
			})
			.catch(error => console.error(`ERROR`, error));
	}

	//Use serialize class
	onMessage(message){

		if(isJSON(message)){

	      let m = Serialize.fromJson(message);

	      switch(m.type){
	        case 'MINITOUCH':
	          let commands = m.commands.join('\r\n');
	          this.writeTouch(commands+'\r\n');
	          break;
	        case 'KEYEVENT':
	          this.sendKeyEvents(m.commands);
	          break;
	      }
	    }
	}

	onClose(){
	    console.info(`======] Lost a client [======`);
	}

	sendKeyEvents(events){
		let inputs = events.map(key => `input keyevent ${key}`).join(' && ');

		exec(`adb shell ${inputs}`, (error, stdout, stderr) => {
		  	if(error || stderr){
		      return;
		    }
		});
	}

	writeTouch(commands){
 		this.minitouch.write(commands);
	}

	connect(){
	
		this.wss.on('connection', (ws) => {

		  console.info(`======] Client connected to websocket [======`, this.deviceInfo);

		  ws.on('message', this.onMessage.bind(this));
		  ws.on('close', this.onClose.bind(this));

		  //Send deviceInfo to client
		  if(Object.keys(this.deviceInfo).length){
		  	let payload = Serialize.toJson(this.deviceInfo);
		    ws.send(payload);
		    this.minicap.initialize(ws).then(status => console.log(status)).catch(error => console.error(error));
		  	this.minitouch.initialize().then(status => console.log(status)).catch(error => console.error(error));
		  }else{
		  	console.error(`!!!===] Device Info not Adequate for Client to Render [===!!! `);
		  }

		});
	}

	getMinitouchInfo(){

		return new Promise((resolve, reject) => {

			console.log(`Getting Minitouch Info`);

			let nc = spawn('nc', ['localhost', this.minitouch_port]);
			nc.stdout.on('data', (data) => {
			  console.log(`======] Received NC Device Touch Info [======`, data.toString());

			  try{
			    let info = data.toString().split(/\n/)[1].split(/\s/);
			    let maxContacts = info[1];
			    let maxX = info[2];
			    let maxY = info[3];
			    let maxPressure = info[4];

			    this.deviceInfo.maxContacts = maxContacts;
			    this.deviceInfo.maxX = maxX;
			    this.deviceInfo.maxY = maxY;
			    this.deviceInfo.maxPressure = maxPressure;

			    nc.kill('SIGKILL');

			    resolve(this.deviceInfo);
			  }catch(error){
			    nc.kill('SIGKILL');
			    exec(`fuser ${this.minitouch_port}/tcp`);
			    reject(error);
			  }
			});

			nc.stderr.on('data', (data) => {
			  nc.kill('SIGKILL');
			  exec(`fuser ${this.minitouch_port}/tcp`);
			  reject(data);
			});

			nc.on('close', (code, signal) => {
				console.log(`NC successfully closed`);
			    exec(`fuser ${this.minitouch_port}/tcp`);
			});

			setTimeout(() => {
			  nc.kill('SIGKILL');
			  exec(`fuser ${this.minitouch_port}/tcp`);
			  reject(`Timeout. Is Minitouch running and the port is forwarded (adb forward tcp:1111 localabstract:minitouch)?`);
			}, 5000);

		});
	}

	getDeviceResolution(){
		return new Promise((resolve, reject) => {
			console.log(`Getting ADB Device Info`);

			let adb = spawn('adb', ['shell', 'wm', 'size']);
			adb.stdout.on('data', (data) => {
			  console.log(`======] Received ADB Device Info [======`);
			  try{
			    let info = data.toString().split(':')[1].trim();
			    let width = info.split('x')[0];

			    let height = info.split('x')[1];
			    this.deviceInfo.width = width;
			    this.deviceInfo.height = height;
			    
			    resolve(this.deviceInfo);
			  }catch(error){
			  	reject(error);
			  }
			});

			adb.stderr.on('data', (data) => {
			  reject(data);
			});

			setTimeout(() => {
			  adb.kill('SIGKILL');
			  reject(`Timeout`);
			}, 5000);

		});
	}

	getDeviceInfo(){
		return Promise.resolve();
	}

}

module.exports = Server;