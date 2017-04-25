const adb = require('adbkit');

let instance;

class Device {

	constructor(){
		if(!instance){
			instance = this;
		}

		this.client = adb.createClient();
		this.devices = [];
		this.ports = {minicap: 1717, minitouch: 1111};

		return instance;
	}

	list(){
		return this.devices;
	}

	fetch(){
		console.log(`Getting devices`);
		return this.client.listDevices()
				.then(devices => this.devices = devices)
				.catch(error => console.log(error));
	}

	//TODO: support multiple devices
	forward(service){
		console.log(`Forward ${service}`);
		let port = this.ports[service];
		this.client.listDevices()
			.then(devices => {
				devices.forEach(device => {
					this.client.forward(device.id, `tcp:${port}`, `localabstract:${service}`)
						.then(() => console.log(`Forwarded ${service} to ${port}`));
				})
			});

	}

}

module.exports = Device;