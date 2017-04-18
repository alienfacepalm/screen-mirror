const WebSocketServer = require('ws').Server;
const http = require('http');
const express = require('express');
const path = require('path');
const net = require('net');
const isJSON = require('is-json');
const exec = require('child_process').exec;

const MINICAP_PORT = 1717;
const MINITOUCH_PORT = 1111;
const PORT = process.env.PORT || 9002;
const app = express();

//TODO: implement better ERROR handling
//TODO: implement message queue

app.use(express.static(path.join(__dirname, '/public')))

let server = http.createServer(app);
let wss = new WebSocketServer({server: server});


let resolution = null;
exec('adb shell wm size', (error, stdout, stderr) => {
  if(error || stderr){
    return;
  }
  let dimensions = stdout.split(':')[1].trim();
  let width = dimensions.split('x')[0];
  let height = dimensions.split('x')[1];
  resolution = JSON.stringify({resolution:{width: width, height: height}});
});

//Create WebSocket for client to connect to
wss.on('connection', (ws) => {

  console.info(`======] WebSocket client connected [======`);

  if(resolution){
    console.log(`======] Sending Resolution to Client [======`, resolution);
    ws.send(resolution);
  }

  //====== MINICAP ======
  let screenStream = net.connect({port: MINICAP_PORT});

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
  let touchStream = net.connect({port: MINITOUCH_PORT}, () => {
    console.log(`======] Minitouch connected [======`);
  });

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

  touchStream.on('error', (error) => {
    console.error("!!!===] TOUCH ERROR [===!!!", error);
  });

  touchStream.on('data', (data) => {
    console.log(`======] DATA [======`, data);
    //touchStream.end();
  });

  touchStream.on('end', () => {
    console.log(`======] Minitouch disconnected [======`);
  });

  //====== CLIENT ======
  ws.on('data', (data) => {
    console.log(data);
  });

  ws.on('message', (message) => {
    //accept JSON payload
    if(isJSON(message)){
      let m = JSON.parse(message);
      if(m.type === 'input'){
        let commands = m.commands.join('\r\n');
        writeTouch(commands+'\r\n');
      }
    }else{
      //assume ProtoBuf
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