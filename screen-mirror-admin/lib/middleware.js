const {ipcMain, dialog} = require('electron');
const {exec, spawn} = require('child_process');
const path = require('path');

const Device = require('./device');

//TODO: combine into single Service class
class Middleware {

	constructor(win){
		this.win = win;
		this.thread = null;
		this.isRunning = false;
		this.device = new Device;
	}

   	initialize(){
	  ipcMain.on('middleware-click', () => {
	    let cmd = this.isRunning ? 'stop' : 'start';
	    this[cmd]();
	  });
	}

	start(){
		console.log(`======] START MIDDLEWARE [=======`);

		if(this.device.list().length){

			if(!this.isRunning){

				let wd = path.resolve(process.cwd(), './screen-mirror-server');
				this.thread = spawn(`node`, ['app.js'], {cwd: wd});
				this.win.webContents.send('update-console', `Middleware is running: ${this.thread.pid}.\n`);

				this.thread.stdout.on('data', data => this.output(data));
				this.thread.stderr.on('error', error => this.error(error));
				this.thread.on('close', (code, signal) => this.close(code, signal));

				this.isRunning = true;

			}
		}else{
			this.win.webContents.send('update-checkbox', 'middleware', false);
			console.log(`No devices plugged in`);
			dialog.showMessageBox({message:`No devices plugged in!!`, buttons: ["OK"]});
		}

	}
	
	stop(){
		console.log(`======] STOP MIDDLEWARE [======`);

		this.thread.kill('SIGINT');
		this.win.webContents.send('update-console', "Middleware terminated.\n");
		this.win.webContents.send('update-checkbox', 'middleware', false);
		this.isRunning = false;
	}

	//TODO: move to console lib
	output(data){
		console.log(`======] MIDDLEWARE STDOUT [======`, data.toString());

		this.win.webContents.send('update-console', "\n"+data.toString()+"\n");
		this.win.webContents.send('update-checkbox', 'middleware', true);
		this.isRunning = true;
	}

	error(error){
		console.log(`======] MIDDLEWARE STDERR [======`);

		this.win.webContents.send('update-console', "Middleware has been terminated due to error.\n");

		if(error.toLowerCase().includes("error")){
			this.win.webContents.send('update-console', "\n!!!===] ERROR [===!!!\n"+error.toString());
			this.win.webContents.send('update-checkbox', 'middleware', false);
			this.isRunning = false;
		}
	}

	close(code, signal){
		console.log(`======] Middleware closed ${code} ${signal} [======`);
	}
}

module.exports = Middleware;