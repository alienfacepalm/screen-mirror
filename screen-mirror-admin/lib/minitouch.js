const {ipcMain, dialog} = require('electron');
const {exec, spawn} = require('child_process');
const path = require('path');

const Device = require('./device');

let instance;

//TODO: combine into single Service class
class Minitouch {

	constructor(win){
		if(!instance){
			instance = this;
		}
		this.port = 1111;
		this.win = win;
		this.thread = null;
		this.isRunning = false;
		this.device = new Device;
		this._pid = null;

		return instance;
	}

	//PID must be set from the Middleware output when Node connects to the TCP port
	set pid(pid){
		this._pid = pid;
	}

	get pid(){
		return this._pid;
	}

   	initialize(){
	  ipcMain.on('minitouch-click', () => {
	    let cmd = this.isRunning ? 'stop' : 'start';
	    this[cmd]();
	  });
	}
	
	start() {
		console.log(`======] START MINITOUCH [=======`);

		/*
		#!/usr/bin/env bash

		# Fail on error, verbose output
		set -exo pipefail

		# Build project
		ndk-build 1>&2

		# Figure out which ABI and SDK the device has
		abi=$(adb shell getprop ro.product.cpu.abi | tr -d '\r')
		sdk=$(adb shell getprop ro.build.version.sdk | tr -d '\r')

		# PIE is only supported since SDK 16
		if (($sdk >= 16)); then
		  bin=minitouch
		else
		  bin=minitouch-nopie
		fi

		# Upload the binary
		adb push libs/$abi/$bin /data/local/tmp/

		# Run!
		adb shell /data/local/tmp/$bin "$@"
		*/

		if(this.device.list().length){

			if(!this.isRunning){
				
				//TODO: convert to Promises
				//TODO: address running this as exe from root
				//TODO: do not use Shell script
				let wd = path.resolve(process.cwd(), '../vendor/minitouch');
				console.log(wd);
				//this.thread = spawn(`./run.sh`, [], {cwd: wd});
				//adb shell getprop ro.product.cpu.abi
				let abi = spawn('adb', ['shell', 'getprop', 'ro.product.cpu.abi']);
				abi.stdout.on('data', data => {
					let arch = data.toString();

					//adb push libs/$abi/$bin /data/local/tmp/
					//let push = spawn('adb', ['push', `${wd}/libs/${arch}/minitouch`, '/data/local/tmp'], {cwd: wd});
					//push.stdout.on('data', data => console.log(`PUSH`, data.toString()));
					//push.stderr.on('data', data => console.error(data.toString()));
					this.thread = spawn('adb', ['shell', '/data/local/tmp/minitouch']);
					this.win.webContents.send('update-console', `Minitouch is running: ${this.thread.pid}.\n`);

					this.thread.stdout.on('data', data => {
					console.log(`Minitouch output`);
					this.pid = data.toString();
					this.output(data);
				});
				this.thread.stderr.on('error', error => this.error(error));
				this.thread.on('close', (code, signal) => this.close(code, signal));
				});
				

			

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

		if(!this.pid){
			dialog.showMessageBox({message:`You must start Middleware in order to stop Minitouch`, buttons: ["OK"]});
		}else{
			try{
				console.log(`Kill ${this.pid}`);
				this.win.webContents.send('update-console', `Kill ${this.pid}.\n`);
				process.kill(this.pid, 'SIGKILL');
				this.pid = null;
				this.thread.kill('SIGKILL');
				exec(`fuser ${this.port}/tcp`);

				this.win.webContents.send('update-console', "Minitouch terminated.\n");
				this.win.webContents.send('update-checkbox', 'minitouch', false);
				this.isRunning = false;
			}catch(error){}
		}

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