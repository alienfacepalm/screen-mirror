import React, {Component} from 'react';
import WebSocket from 'react-websocket';

import Input from './lib/input/input';

class Screen extends Component {

	componentDidMount() {
		console.log(`Screen component mounted`);

		this.canvas = document.createElement('canvas');
		this.canvas.width = 360;
		this.canvas.height = 640;
		this.canvas.style = 'border: 1px solid black;';
		
		document.getElementById('screen-container').appendChild(this.canvas)
		this.ctx = this.canvas.getContext('2d');

		//this creates input detection
		let input = new Input({
			device: null,
			control: null,
			input: null, 
			screen: null
		});
		input.initialize();
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
			<div id="screen-container">
				<WebSocket url='ws://192.168.7.78:9002' onMessage={this.update.bind(this)} />
			</div>
		);
	}

}

export default Screen;
