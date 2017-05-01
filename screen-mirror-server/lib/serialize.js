const ProtoBuf = require('protobufjs');

class Serialize {

	static toProtobuf(payload){

	}

	static fromProtobuf(payload){

	}

	static toJson(payload){
		return JSON.stringify(payload);
	}

	static fromJson(payload){
		return JSON.parse(payload);
	}
	
}

module.exports = Serialize;