//NOTE: this is an unstructured prototype
//brandonp@mobileintegration-group.com

const WebSocketServer = require('ws').Server;
const http = require('http');
const express = require('express');
const path = require('path');
const net = require('net');
const isJSON = require('is-json');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const ProtoBuf = require('protobufjs');

const MINICAP_PORT = 1717;
const MINITOUCH_PORT = 1111;
const PORT = process.env.PORT || 9002;
const app = express();

//TODO: break out functionality into classes
//TODO: implement better ERROR handling
//TODO: implement protobuf

let server = http.createServer(app);
let wss = new WebSocketServer({server: server});

let screenStream;
let touchStream;

let ncSatisified = false;
let adbSatisfied = false;
let nc = spawn('nc', ['localhost', '1111']);
let adb = spawn('adb', ['shell', 'wm', 'size']);
let device = {
  device: {
    maxContacts: null,
    width: null,
    height: null, 
    maxX: null,
    maxY: null,
    maxPressure: null
  }
};

nc.stdout.on('data', (data) => {
  console.log(`======] Received Device Touch Info [======`);

  try{
    let info = data.toString().split(/\n/)[1].split(/\s/);
    let maxContacts = info[1];
    let maxX = info[2];
    let maxY = info[3];
    let maxPressure = info[4];

    device.device.maxContacts = maxContacts;
    device.device.maxX = maxX;
    device.device.maxY = maxY;
    device.device.maxPressure = maxPressure;

    ncSatisified = true;
    nc.kill('SIGHUP');
  }catch(error){
    console.log(`!!!===] Error Fetching Touch Resolution [===!!!`);
    nc.kill('SIGHUP');
  }
});

nc.stderr.on('data', (data) => {
  console.log(`!!!===] Error Fetching Touch Resolution [===!!!`);
  ncSatisfied = false;
  nc.kill('SIGHUP');
});

nc.on('close', (code, signal) => {
    console.log(`======] Netcat closed: ${signal} [======`);
});

adb.stdout.on('data', (data) => {
  console.log(`======] Received Device Resolution Info [======`);
  try{
    let info = data.toString().split(':')[1].trim();
    let width = info.split('x')[0];
    let height = info.split('x')[1];
    device.device.width = width;
    device.device.height = height;

    adbSatisfied = true;
  }catch(error){
    console.error(`!!!===] Fatal Error Fetching Device Resolution [===!!!`);
  }

});

adb.stderr.on('data', (data) => {
  console.error(`!!!===] Fatal Error Fetching Device Resolution [===!!!`);
  adbSatisfied = false;
});

//TODO: find faster way
const sendKeyEvents = (events) => {
  console.log(`EVENTS: `, events);
  let inputs = events.map(key => `input keyevent ${key}`).join(' && ');
  console.log(`INPUTS: `, inputs);
  //input keyevent ${key}
  exec(`adb shell ${inputs}`, (error, stdout, stderr) => {
    if(error || stderr){
      return;
    }
    console.log(stdout);
  });
}

const writeTouch = (cmd) => {
  console.log(`======] WRITE TOUCH [======`);
  console.log(cmd);
  if(touchStream.writable){
    touchStream.write(cmd);
  }else{
    //TODO: take action to correct this
    console.error(`!!!===] NOT WRITABLE, Take action to fix [===!!!`);
  } 
}

//Create WebSocket for client to connect to
wss.on('connection', (ws) => {

  console.info(`======] WebSocket client connected [======`, device);

  if(device){
    if(ncSatisified && adbSatisfied){
      ws.send(JSON.stringify(device));
    }else{
      console.log(`!!!====] Inadequate Device Info Acquired [===!!!`);
    }
  }

  //====== MINICAP ======
  screenStream = net.connect(MINICAP_PORT, () => {
    console.log(`======] Minicap Connected [======`);
  });

  const tryRead = () => {

    for (let chunk; (chunk = screenStream.read());) {

      //console.info(`======] chunk(length=%d) [======`, chunk.length);

      for (let cursor = 0, len = chunk.length; cursor < len;) {
        if (readBannerBytes < bannerLength) {
          switch (readBannerBytes) {
            case 0:
              // version
              banner.version = chunk[cursor];
              break;
            case 1:
              // length
              banner.length = bannerLength = chunk[cursor];
              break;
            case 2:
            case 3:
            case 4:
            case 5:
              // pid
              banner.pid += (chunk[cursor] << ((readBannerBytes - 2) * 8)) >>> 0;
              break;
            case 6:
            case 7:
            case 8:
            case 9:
              // real width
              banner.realWidth += (chunk[cursor] << ((readBannerBytes - 6) * 8)) >>> 0;
              break;
            case 10:
            case 11:
            case 12:
            case 13:
              // real height;
              banner.realHeight += (chunk[cursor] << ((readBannerBytes - 10) * 8)) >>> 0
              break;
            case 14:
            case 15:
            case 16:
            case 17:
              // virtual width
              banner.virtualWidth += (chunk[cursor] << ((readBannerBytes - 14) * 8)) >>> 0;
              break;
            case 18:
            case 19:
            case 20:
            case 21:
              // virtual height
              banner.virtualHeight += (chunk[cursor] << ((readBannerBytes - 18) * 8)) >>> 0;
              break;
            case 22:
              // orientation
              banner.orientation += chunk[cursor] * 90;
              break;
            case 23:
              // quirks
              banner.quirks = chunk[cursor];
              break;
          }

          cursor += 1;
          readBannerBytes += 1;

          if (readBannerBytes === bannerLength) {
            //console.log(`======] banner [======`, banner);
          }
        }else if (readFrameBytes < 4) {
          frameBodyLength += (chunk[cursor] << (readFrameBytes * 8)) >>> 0;
          cursor += 1;
          readFrameBytes += 1;
          //console.info(`======] headerbyte%d(val=%d) [======`, readFrameBytes, frameBodyLength);
        }else{
          if (len - cursor >= frameBodyLength) {
            //console.info(`======] bodyfin(len=%d,cursor=%d) [======`, frameBodyLength, cursor);

            frameBody = Buffer.concat([frameBody, chunk.slice(cursor, cursor + frameBodyLength)]);

            // Sanity check for JPG header, only here for debugging purposes.
            if (frameBody[0] !== 0xFF || frameBody[1] !== 0xD8) {
              //console.error(`======] Frame body does not start with JPG header [======`, frameBody);
              process.exit(1);
            }

            ws.send(frameBody, {binary: true});

            cursor += frameBodyLength;
            frameBodyLength = readFrameBytes = 0;
            frameBody = new Buffer(0);
          }else{
            //console.info('body(len=%d)', len - cursor);

            frameBody = Buffer.concat([frameBody, chunk.slice(cursor, len)]);

            frameBodyLength -= len - cursor;
            readFrameBytes += len - cursor;
            cursor = len;
          }
        }
      }
    }
  }

  screenStream.on('error', () => {
    console.error("!!!===] Be sure to run `adb forward tcp:1717 localabstract:minicap` [===!!!");
    process.exit(1);
  });

  screenStream.on('readable', tryRead);

  screenStream.on('end', () => {
    console.log(`======] Minicap disconnected [======`);
  });

  //====== MINITOUCH ======
  touchStream = net.connect(MINITOUCH_PORT, () => {
    console.log(`======] Minitouch connected [======`);
  });

  touchStream.on('error', (error) => {
    console.error("!!!===] Be sure to run `adb forward tcp:1111 localabstract:minitouch` [===!!!", error);
  });

  touchStream.on('readable', (data) => {});

  touchStream.on('data', (data) => {
    console.log(`======] TOUCH DATA [======`, data.toString());
  });

  touchStream.on('end', () => {
    console.log(`======] Minitouch disconnected [======`);
  });

  //====== CLIENT ======
  ws.on('data', (data) => {
    console.log(data);
  });

  ws.on('message', (message) => {
    console.log(message);
    //accept JSON payload
    if(isJSON(message)){
      let m = JSON.parse(message);

      switch(m.type){
        case 'MINITOUCH':
          let commands = m.commands.join('\r\n');
          writeTouch(commands+'\r\n');
          break;
        case 'KEYEVENT':
          sendKeyEvents(m.commands);
          break;
      }
    }else{
      //ProtoBuf
      //TODO: instantiate ProtoBuf and load screenmirror.proto, decode and write to tcp
    }
  });

  ws.on('close', function() {
    console.info(`======] Lost a client [======`);
    screenStream.end();
    touchStream.end();
  });

  let readBannerBytes = 0;
  let bannerLength = 2;
  let readFrameBytes = 0;
  let frameBodyLength = 0;
  let frameBody = new Buffer(0);
  let banner = {
    version: 0, 
    length: 0, 
    pid: 0, 
    realWidth: 0, 
    realHeight: 0, 
    virtualWidth: 0, 
    virtualHeight: 0, 
    orientation: 0, 
    quirks: 0
  };

});

server.listen(PORT);
console.info(`======] Listening on port %d [======`, PORT);