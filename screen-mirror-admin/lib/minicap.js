const {ipcMain, dialog} = require('electron');
const {exec, spawn} = require('child_process');
const path = require('path');

const Device = require('./device');

class Minicap {

	constructor(win){
		this.PORT = 1717;
		this.win = win;
		this.thread = null;
		this.isRunning = false;
		this.device = new Device;
	}

	initialize(){
	  ipcMain.on('minicap-click', () => {
	    let cmd = this.isRunning ? 'stop' : 'start';
	    console.log(`Running Command ${cmd}()`);
	    this[cmd]();
	  });

	}

	start() {
		console.log(`======] START MINICAP [=======`);

		this.device.list()
			.then(devices => {
				if(devices && devices.length){
					if(!this.isRunning){

						//TODO: address running this as exe from root
						let wd = path.resolve(process.cwd(), './vendor/minicap');
						this.thread = spawn(`./run.sh`, ['autosize'], {cwd: wd});
						this.win.webContents.send('update-console', `Minicap is running: ${this.thread.pid}.\n`);

						this.thread.stdout.on('data', data => {
							console.log(`Minicap data`, data.toString());				
							this.output(data);
						});
						this.thread.stderr.on('error', error => this.error(error));
						this.thread.on('close', (code, signal) => this.close(code, signal));

						exec(`adb forward tcp:${this.PORT} localabstract:minicap`);

						this.isRunning = true;
					}
				}else{
					dialog.showMessageBox({message:`No devices plugged in!!`});
				}
			})
			.catch(error => dialog.showMessageBox({message: error}));
		
	}

	stop(){
		console.log(`======] STOP MINICAP [======`);

		this.thread.kill('SIGKILL');
		try{
			process.kill(this.thread.pid, 'SIGKILL');
		}catch(error){}
		exec(`fuser ${this.PORT}/tcp`);

		this.win.webContents.send('update-console', "Minicap terminated.\n");
		this.win.webContents.send('update-checkbox', 'minicap', false);
		this.isRunning = false;
	}


	//TODO: move to console lib
	output(data){
		console.log(`======] MINICAP STDOUT [======`, data.toString());

		this.win.webContents.send('update-console', "\n"+data.toString()+"\n");
		this.win.webContents.send('update-checkbox', 'minicap', true);
		this.isRunning = true;
	}

	error(error){
		console.log(`======] MINICAP STDERR [======`);

		this.win.webContents.send('update-console', "Minicap has been terminated due to error.\n");

		if(error.toLowerCase().includes("error")){
			this.win.webContents.send('update-console', "\n!!!===] ERROR [===!!!\n"+error.toString());
			this.win.webContents.send('update-checkbox', 'minicap', false);
			this.isRunning = false;
		}
		this.stop();
	}

	close(code, signal){
		console.log(`======] Minicap closed ${code} ${signal} [======`);
		this.win.webContents.send('update-console', `\nMinicap closed ${code} ${signal}\n`);
	}
}

module.exports = Minicap;