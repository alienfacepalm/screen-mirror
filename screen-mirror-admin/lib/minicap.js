const {ipcMain, dialog} = require('electron');
const {exec, spawn} = require('child_process');
const path = require('path');

const Device = require('./device');

let instance;

//TODO: combine into single Service class
class Minicap {

	constructor(win){
		if(!instance){
			instance = this;
		}
		this.port = 1717;
		this.win = win;
		this.thread = null;
		this.forward = null;
		this.isRunning = false;
		this.device = new Device;
		this.pid = null;

		return instance;
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

		if(this.device.list().length){

			if(!this.isRunning){

				//TODO: address running this as exe from root
				//TODO: Do not use shell script to run
				let wd = path.resolve(process.cwd(), '../vendor/minicap');
				console.log(wd);
				this.thread = spawn(`./run.sh`, ['autosize'], {cwd: wd});
				this.win.webContents.send('update-console', `Minicap is running: ${this.thread.pid}.\n`);

				this.thread.stdout.on('data', data => {
					console.log(`Minicap output`);
					console.log(data.toString());	
					this.pid = data.toString().split('\n')[0];
					this.output(data);
				});
				this.thread.stderr.on('error', error => this.error(error));
				this.thread.on('close', (code, signal) => this.close(code, signal));

				this.device.forward('minicap');

				this.isRunning = true;

			}
		}else{
			this.win.webContents.send('update-checkbox', 'minicap', false);
			console.log(`No devices plugged in`);
			dialog.showMessageBox({message:`No devices plugged in!!`, buttons: ["OK"]});
		}
		
	}

	stop(){
		console.log(`======] STOP MINICAP [======`);

		
		try{
			console.log(`Kill ${this.pid}`);
			this.win.webContents.send('update-console', `Kill ${this.pid}.\n`);
			process.kill(this.pid, 'SIGKILL');
			this.pid = null;
			this.thread.kill('SIGKILL');
			exec(`fuser ${this.port}/tcp`);

			this.win.webContents.send('update-console', "Minicap terminated.\n");
			this.win.webContents.send('update-checkbox', 'minicap', false);
			this.isRunning = false;
		}catch(error){}

		
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