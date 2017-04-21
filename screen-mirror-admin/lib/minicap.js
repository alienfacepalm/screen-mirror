const {exec, spawn} = require('child_process');
const path = require('path');

class Minicap {

	constructor(win){
		this.win = win;
		this.thread = null;
		this.isRunning = false;
	}

	start() {
		console.log(`======] START MINICAP [=======`);

		this.win.webContents.send('update-console', "Minicap is running.\n");

		this.isRunning = true;
		let wd = path.resolve(process.cwd(), '../vendor/minicap');
		this.thread = exec(`./run.sh autosize`, {cwd: wd}, (error, stdout, stderr) => {
			if(stdout){
				this.output(stdout);
			}

			if(stderr){
				this.error(stderr);
			}
		});

	}

	stop(){
		console.log(`======] STOP MINICAP [======`);

		this.thread.kill();
		this.win.webContents.send('update-console', "Minicap terminated.\n");
		this.win.webContents.send('update-checkbox', 'minicap', false);
		this.isRunning = false;
	}

	output(data){
		console.log(`======] MINICAP STDOUT [======`, data.toString());

		this.win.webContents.send('update-console', "\n======] MINICAP SAYS [======\n"+data.toString());
		this.win.webContents.send('update-checkbox', 'minicap', true);
		this.isRunning = true;
	}

	error(error){
		console.log(`======] MINICAP STDERR [======`);

		if(error.toLowerCase().includes("error")){
			this.win.webContents.send('update-console', "\n!!!===] ERROR [===!!!\n"+error.toString());
			this.win.webContents.send('update-checkbox', 'minicap', false);
			this.isRunning = false;
		}
	}

	close(code, signal){
		console.log(`======] Minicap closed ${code} ${signal} [======`);
	}
}

module.exports = Minicap;