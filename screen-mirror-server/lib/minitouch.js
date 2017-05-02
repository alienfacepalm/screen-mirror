const net = require('net');
const isJSON = require('is-json');

const Serialize = require('./serialize');

let instance;

class Minitouch {

	constructor(port){
		if(!instance){
			instance = this;
		}

		this.touchStream = null;
		this.port = port;

		return instance;
	}

	initialize(){	
		return new Promise((resolve, reject) => {
			this.touchStream = net.connect(this.port, () => {
			   console.log(`======] Minitouch connected [======`);
			});	
			this.touchStream.on('data', this.onData.bind(this));
			this.touchStream.on('error', this.onError.bind(this));
			this.touchStream.on('end', this.onEnd.bind(this)); 
			if(this.touchStream){
				resolve(`TouchStream successfully initialized`);
			}else{
				reject(`TouchStream failed to initialize `);
			}
		});
	}

	write(commands){
		if(this.touchStream.writable){
			this.touchStream.write(commands);
		}else{
			console.error(`TouchStream not Writable`);
		}
	}

	onData(data){
		console.log(data.toString());
	}

	onEnd(){
		console.log(`======] Minitouch disconnected [======`);
	}

	onError(){
		console.error("!!!===] Be sure to run `adb forward tcp:1111 localabstract:minitouch` [===!!!");
		process.exit(1);
	}

}

module.exports = Minitouch;