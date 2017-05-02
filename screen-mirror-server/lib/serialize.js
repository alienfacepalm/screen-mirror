const ProtoBuf = require('protobufjs');

class Serialize {

	static toProtobuf(payload){

	}

	static fromProtobuf(payload){

	}

	static toJson(payload){
		return Promise.resolve(JSON.stringify(payload));
	}

	static fromJson(payload){
		return Promise.resolve(JSON.parse(payload));
	}
	
}

module.exports = Serialize;