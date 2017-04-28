const net = require('net');

class Minitouch {

	constructor(port){
		this.touchStream = null;
		this.port = port;
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

	write(payload){
		console.log(`writable`, this.touchStream.writable)
		if(this.touchStream.writable){
			console.log(`Write`, payload)
			this.touchStream.write(payload);
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