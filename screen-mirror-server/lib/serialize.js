class Serialize {

	static toProtobuf(input){

	}

	static fromProtobuf(input){

	}

	static toJson(input){
		return JSON.stringify(input);
	}

	static fromJson(input){
		return JSON.parse(input);
	}
	
}

module.exports = Serialize;