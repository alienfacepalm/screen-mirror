import isJSON from 'is-json';
//import ProtoBuf from 'protobufjs';

class Serializer {

	constructor(format){
		console.log(`======] Init Serialization as ${format} [======`);
		this.format = format;
	}

	to(payload){
		return new Promise((resolve, reject) => {
			let result = this[this.format]('to', payload);
			if(result){
				resolve(result);
			}else{
				reject(`Conversion to ${this.format} failed`);
			}
		});
	}

	from(payload){
		return new Promise((resolve, reject) => {
			let result = this[this.format]('from', payload);
			if(result){
				resolve(result);
			}else{
				reject(`Conversion from ${this.format} failed`);
			}
		});
	}

	json(direction, payload){
		console.log(`Conversion ${direction}`, payload);
		let output = null;
		switch(direction){
			case 'to':
				output = typeof(payload) === 'object' ? JSON.stringify(payload) : null;
				break;
			case 'from':
				output = isJSON(payload) ? JSON.parse(payload) : null;
				break;
			default:
		}
		return output;
	}
	/*
	protobuf(direction, payload){
		switch(direction){
			case 'to':
				break;
			case 'from':
				break;
			default:
		}
	}
	*/
	

}

export default Serializer;