import React, {Component} from 'react';

import isJSON from 'is-json';
import {Icon} from 'react-fa';
import ProtoBuf from 'protobufjs';

import environment from '../environment';

class Screen extends Component {

	constructor(props){
		super(props);

		this.ctx = null;
		this.canvas = null;
		this.endpoint = `${environment.middleware.protocol}://${environment.middleware.endpoint}:${environment.middleware.port}`;
		this.websocket = new WebSocket(this.endpoint);

		this.commands = [];

		//protobuf commands
		this.touchDown = null;
		this.touchMove = null;
		this.touchUp = null;
		this.touchCommit = null;
		this.touchReset = null;

		//State will be done with Redux when moved to MCB
		this.state = {
			swiping: false,
			device: {
				width: null,
				height: null
			}
		};
	}

	initializeCanvas(){
		console.log(`======] Init Canvas [======`, this.state);

		if(this.state.device.width && this.state.device.height){
			this.canvas = document.createElement('canvas');
			this.canvas.width = this.state.device.width/2;
			this.canvas.height = this.state.device.height/2;
			this.canvas.style = 'margin: 50px; border: 1px solid black; cursor: pointer;';

			this.canvas.onmouseover = this.cursorOver.bind(this);
			this.canvas.onmouseout = this.cursorOut.bind(this);
			this.canvas.onmousedown = this.interactStart.bind(this);
			this.canvas.onmousemove = this.interactMove.bind(this);
			this.canvas.onmouseup = this.interactEnd.bind(this);
			
			document.getElementById('screen-container').appendChild(this.canvas)
			this.ctx = this.canvas.getContext('2d');
		}else{
			alert(`Device resolution failed to be detected`);
		}
	}

	componentDidMount() {
		console.log(`Screen component mounted`);

		this.screenContainer = document.getElementById('screen-container');
		this.screenContainer.onmousedown = this.screenContainerDown.bind(this);
	
		this.websocket.onopen = () => {
			console.log(`======] WebSocket Open [======`);
		}

		this.websocket.onmessage = (payload) => {
			//When ported to MCB this change as well as the socket server
			if(isJSON(payload.data)){
				let data = JSON.parse(payload.data);
				if(data.resolution){
						this.setState({device: {
										width: data.resolution.width,
						                height: data.resolution.height
						               }
						             });	
				}
				this.initializeCanvas();
			}else{
				//jpeg blob
				this.updateImage(payload.data);
			}
		}

		//Protobuf
		ProtoBuf.load('../screenmirror.proto', (error, root) => {

			if(error){
				throw error;
			}

			console.log(`======] Loading ProtoBuf Commands [======`);

			this.touchDown = root.lookupType('ScreenMirror.TouchDown');
			this.touchMove = root.lookupType('ScreenMirror.TouchMove');
			this.touchUp = root.lookupType('ScreenMirror.TouchUp');
			this.touchCommit = root.lookupType('ScreenMirror.TouchCommit');
			this.touchReset = root.lookupType('ScreenMirror.TouchReset');

		});

	}

	calculatePosition(event){
		let x = Math.ceil(this.state.device.width/(this.canvas.width/event.offsetX));
		let y = Math.ceil(this.state.device.height/(this.canvas.height/event.offsetY));

		return {x: x, y: y};
	}

	//TODO: normalize for all commands: down, move, up, commit, reset
	//ProtoBuf commands
	sendTouchDown(payload){
		let message = this.touchDown.create({
			seq: 'd',
			contact: 0,
			x: 0,
			pressure: 50
		});

		let buffer = this.touchDown.encode(message).finish();

		this.websocket.send(buffer);
	}


	//Standard commands
	sendCommands(){
		console.log(`======] Commands [======`, this.commands);

		let message = JSON.stringify({type: 'input', commands: this.commands});
		this.websocket.send(message);
		this.commands = [];
	}

	//TODO: gestures

	interactStart(event){
		this.canvas.style.cursor = 'move';
		this.setState({swiping: true});

		let pos = this.calculatePosition(event);
		this.commands.push(`d 0 ${pos.x} ${pos.y} 50`);
		this.commands.push(`c`);
	}

	interactMove(event){
		if(this.state.swiping){
			let pos = this.calculatePosition(event);
			this.commands.push(`m 0 ${pos.x} ${pos.y} 50`);
			this.commands.push(`c`);

			this.sendCommands();
		}
	}

	interactEnd(){
		this.canvas.style.cursor = 'pointer';
		this.setState({swiping: false});

		this.commands.push(`u 0`);
		this.commands.push(`c`);

		this.sendCommands();
	}

	reset(){
		console.log(`======] Attemping Minitouch Reset [======`);
		this.commands.push(`r`);
		this.commands.push(`c`);
		this.sendCommands();
	}

	screenContainerDown(event){
		console.log(`======] Container down [======`);
		this.setState({swiping: true});
	}

	cursorOver(event){
		console.log(`======] Cursor over canvas [======`);
		this.canvas.style.cursor = 'pointer';
		if(this.state.swiping){
			this.interactStart(event);
		}
	}

	cursorOut(event){
		console.log(`======] Cursor left canvas [======`);
		this.canvas.style.cursor = 'pointer';
		if(this.state.swiping){
			this.interactEnd();
		}
	}

	updateImage(data){
		let blob = new Blob([data], {type: 'image/jpeg'});
		let image = new Image();

		image.onload = () => {
			this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
		};
		image.src = URL.createObjectURL(blob);
	}

	render(){
		return (
			<div>
				<div id="screen-container"></div>
				<div id="nav-buttons">
					<Icon onClick={this.reset.bind(this)} className="nav-icons" name="refresh" size="3x" />
				</div>
			</div>
		);
	}

}

export default Screen;
