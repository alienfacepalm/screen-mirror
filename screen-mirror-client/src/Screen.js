import React, {Component} from 'react';

import {Icon} from 'react-fa';

class Screen extends Component {

	constructor(props){
		super(props);

		this.endpoint = 'ws://192.168.7.78:9002';
		this.websocket = new WebSocket(this.endpoint);
		this.deviceWidth = 1200;
		this.deviceHeight = 1920;
		this.commands = [];

		//This will be pulled from redux as part of device state
		this.state = {
			swiping: false,
			device: {
				width: this.deviceWidth,
				height: this.deviceHeight
			}
		};

	}

	componentDidMount() {
		console.log(`Screen component mounted`);

		this.screenContainer = document.getElementById('screen-container');
		this.screenContainer.onmousedown = this.screenContainerDown.bind(this);

		this.canvas = document.createElement('canvas');
		this.canvas.width = this.deviceWidth/2;
		this.canvas.height = this.deviceHeight/2;
		this.canvas.style = 'margin: 50px; border: 1px solid black; cursor: pointer;';

		this.canvas.onmouseover = this.cursorOver.bind(this);
		this.canvas.onmouseout = this.cursorOut.bind(this);
		this.canvas.onmousedown = this.interactStart.bind(this);
		this.canvas.onmousemove = this.interactMove.bind(this);
		this.canvas.onmouseup = this.interactEnd.bind(this);
		
		document.getElementById('screen-container').appendChild(this.canvas)
		this.ctx = this.canvas.getContext('2d');

		this.websocket.onopen = () => {
			console.log(`======] WebSocket Open [======`);
		}

		this.websocket.onmessage = (payload) => {
			this.update(payload.data);
		}
	}

	calculatePosition(event){
		let x = Math.ceil(this.state.device.width/(this.canvas.width/event.offsetX));
		let y = Math.ceil(this.state.device.height/(this.canvas.height/event.offsetY));

		return {x: x, y: y};
	}

	reset(){
		console.log(`======] Attemping Minitouch Reset [======`);
		this.commands.push(`r`);
		this.commands.push(`c`);
		this.sendCommands();
	}

	sendCommands(){
		console.log(`======] Commands [======`, this.commands);

		let message = JSON.stringify({type: 'input', commands: this.commands});
		this.websocket.send(message);
		this.commands = [];
	}

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

	update(data){
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
