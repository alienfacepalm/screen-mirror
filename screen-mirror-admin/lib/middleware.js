const {ipcMain} = require('electron');
const {exec, spawn} = require('child_process');
const path = require('path');

class Middleware {

	constructor(win){
		this.win = win;
		this.thread = null;
		this.isRunning = false;
	}

   	initialize(){
	  ipcMain.on('middleware-click', () => {
	    let cmd = this.isRunning ? 'stop' : 'start';
	    this[cmd]();
	  });
	}

	start(){
		console.log(`======] START MIDDLEWARE [=======`);

		if(!this.isRunning){

			let wd = path.resolve(process.cwd(), './screen-mirror-server');
			this.thread = spawn(`node`, ['app.js'], {cwd: wd});
			this.win.webContents.send('update-console', `Middleware is running: ${this.thread.pid}.\n`);

			this.thread.stdout.on('data', data => this.output(data));
			this.thread.stderr.on('error', error => this.error(error));
			this.thread.on('close', (code, signal) => this.close(code, signal));
			this.isRunning = true;

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

		this.win.webContents.send('update-console', "Middlware has been terminated due to error.\n");

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