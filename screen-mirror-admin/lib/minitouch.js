const {ipcMain, dialog} = require('electron');
const {exec, spawn} = require('child_process');
const path = require('path');

const Device = require('./device');


//TODO: combine into single Service class
class Minitouch {

	constructor(win){
		this.PORT = 1111;
		this.win = win;
		this.thread = null;
		this.isRunning = false;
		this.device = new Device;
	}

   	initialize(){
	  ipcMain.on('minitouch-click', () => {
	    let cmd = this.isRunning ? 'stop' : 'start';
	    this[cmd]();
	  });
	}
	
	start() {
		console.log(`======] START MINITOUCH [=======`);

		if(this.device.list().length){

			if(!this.isRunning){
				
				//TODO: address running this as exe from root
				let wd = path.resolve(process.cwd(), '../vendor/minitouch');
				this.thread = spawn(`./run.sh`, [], {cwd: wd});
				this.win.webContents.send('update-console', `Minitouch is running: ${this.thread.pid}.\n`);

				this.thread.stdout.on('data', data => {
					this.output(data);
				});
				this.thread.stderr.on('error', error => this.error(error));
				this.thread.on('close', (code, signal) => this.close(code, signal));

				this.device.forward('minitouch');

				this.isRunning = true;

			}
		}else{
			this.win.webContents.send('update-checkbox', 'minitouch', false);
			console.log(`No devices plugged in`);
			dialog.showMessageBox({message:`No devices plugged in!!`, buttons: ["OK"]});
		}

	}

	stop(){
		console.log(`======] STOP MINITOUCH [======`);

		this.thread.kill('SIGKILL');
		try{
			process.kill(this.thread.pid, 'SIGKILL');
		}catch(error){}
		exec(`fuser ${this.PORT}/tcp`);

		this.win.webContents.send('update-console', "Minitouch terminated.\n");
		this.win.webContents.send('update-checkbox', 'minitouch', false);
		this.isRunning = false;
	}


	//TODO: move to console lib
	output(data){
		console.log(`======] MINITOUCH STDOUT [======`, data.toString());

		this.win.webContents.send('update-console', "\n"+data.toString()+"\n");
		this.win.webContents.send('update-checkbox', 'minitouch', true);
		this.isRunning = true;
	}

	error(error){
		console.log(`======] MINITOUCH STDERR [======`);

		this.win.webContents.send('update-console', "Minitouch has been terminated due to error.\n");

		if(error.toLowerCase().includes("error")){
			this.win.webContents.send('update-console', "\n!!!===] ERROR [===!!!\n"+error.toString());
			this.win.webContents.send('update-checkbox', 'minitouch', false);
			this.isRunning = false;
		}
		this.stop();
	}

	close(code, signal){
		console.log(`======] Minitouch closed ${code} ${signal} [======`);
		this.win.webContents.send('update-console', `\nMinitouch closed ${code} ${signal}\n`);
	}
}

module.exports = Minitouch;