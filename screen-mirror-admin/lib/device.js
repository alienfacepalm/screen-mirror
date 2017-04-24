const adb = require('adbkit');

class Device {

	constructor(){
		this.client = adb.createClient();
	}

	list(){
		return this.client.listDevices()
				.then(devices => devices)
				.catch(error => console.log(error));
	}

}

module.exports = Device;