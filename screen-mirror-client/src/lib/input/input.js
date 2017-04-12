import Touch from './touch';

class Input {

	constructor(setup){

	  console.log(`======] Input [======`);

	  this.URL = window.URL || window.webkitURL
	  this.BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
	  this.device = setup.device;
	  this.control = setup.control;
	  this.input = setup.input;
	  this.screen = setup.screen;

	  //this.cssTransform = VendorUtil.style(['transform', 'webkitTransform']);
	  //this.device = scope.device();
	  //this.control = scope.control();
	  //this.input = element.find('input');
	  //this.screen = scope.screen = {rotation: 0, bounds: {x: 0, y: 0, w: 0, h: 0}};
	  //this.scaler = ScalingService.coordinator(device.display.width, device.display.height);
	}

	initialize(){
		let touch = new Touch();
		touch.initialize();
	}

}

export default Input;
