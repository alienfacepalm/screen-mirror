const adb = require('adbkit');

let instance;

class Device {

	constructor(){
		if(!instance){
			instance = this;
		}

		this.client = adb.createClient();
		this._devices = [];

		return instance;
	}

	list(){
		return this._devices;
	}

	fetch(){
		console.log(`Getting devices`);
		return this.client.listDevices()
				.then(devices => this._evices = devices)
				.catch(error => console.log(error));
	}

}

module.exports = Device;