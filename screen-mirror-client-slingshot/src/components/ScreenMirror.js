
import React, {Component} from 'react';
import {Icon} from 'react-fa';

import environment from '../../environment';
import Serializer from '../utils/serializer';
import * as keycodes from '../utils/keycodes';

class ScreenMirror extends Component {

    //Step 1: open websocket
    constructor(props, context){
        super(props, context);

        this.ctx = null;
        this.canvas = null;
        this.endpoint = `${environment.middleware.protocol}://${environment.middleware.endpoint}:${environment.middleware.port}`;
        this.websocket = new WebSocket(this.endpoint);
        
        this.serializer = new Serializer('json'); //json or protobuf

        this.commands = [];

        this.touchDown = null;
        this.touchMove = null;
        this.touchUp = null;
        this.touchCommit = null;
        this.touchReset = null;

        this.pressure = null;

    }

    //STEP 2: listen on websocket for needed device data, then issues STEP 3 to init canvas 
    componentDidMount() {
        console.log(`Screen component mounted`);

        this.screenContainer = document.getElementById('screen-container');
        this.screenContainer.onmousedown = this.screenContainerDown.bind(this);
    
        this.websocket.onopen = () => {
            console.log(`======] WebSocket Open [======`);
        };

        this.websocket.onmessage = (payload) => {

            //check if payload is a jpeg
            if(payload.data instanceof Blob){
                this.updateImage(payload.data);
            }else{
                this.serializer.from(payload.data)
                    .then(data => {
                        console.log(`Device Info Received`, data);
                        if(data){
                            //Call redux Action to update deviceInfo state
                            let deviceInfo = this.props.setDeviceInfo({
                                            width: data.width || 0,
                                            height: data.height || 0,
                                            maxX: data.maxX || 0,
                                            maxY: data.maxY || 0,
                                            maxContacts: data.maxContacts || 0,
                                            maxPressure: data.maxPressure || 0
                                       });

                            this.pressure = Number(deviceInfo.maxPressure) === 0 ? 0 : 50;

                        }
                        this.initializeCanvas();
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }

        };

        /*
        //Protobuf
        ProtoBuf.load('../screenmirror.proto', (error, root) => {

            if(error){
                throw error;
            }

            console.log(`======] Loading ProtoBuf Commands [======`);

            this.touchDown = root.lookupType('ScreenMirror.TouchDown');
            this.touchMove = root.lookupType('ScreenMirror.TouchMove');
            this.touchUp = root.lookupType('ScreenMirror.TouchUp');
            this.touchCommit = root.lookupType('ScreenMirror.TouchCommit');
            this.touchReset = root.lookupType('ScreenMirror.TouchReset');

        });
        */

    }

        //STEP 3: initialize the canvas using the device data sent from server, add events
    initializeCanvas(){
        console.log(`======] Init Canvas [======`);

        let width = this.props.deviceInfo.width,
            height = this.props.deviceInfo.height;

        if(width && height){
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'screen-canvas';
            this.canvas.width = width/2;
            this.canvas.height = height/2;
            this.canvas.style = 'margin: 50px; border: 1px solid black; cursor: pointer;';
            this.canvas.onmouseover = this.cursorOver.bind(this);
            this.canvas.onmouseout = this.cursorOut.bind(this);
            this.canvas.onmousedown = this.interactStart.bind(this);
            this.canvas.onmousemove = this.interactMove.bind(this);
            this.canvas.onmouseup = this.interactEnd.bind(this);
            this.canvas.onmousewheel = this.mouseWheel.bind(this);
            document.body.onkeydown = this.keyDown.bind(this);
            document.body.onkeyup = this.keyUp.bind(this);

            document.getElementById('screen-container').appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
        }else{
            alert(`Device resolution failed to be detected`);
        }
        
    }

    updateImage(data){
        if(this.ctx){
            let blob = new Blob([data], {type: 'image/jpeg'});
            let image = new Image();

            image.onload = () => {
                this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
            };
            image.src = URL.createObjectURL(blob);
        }
    }

    calculatePosition(event){
        let x = Math.ceil(this.props.deviceInfo.maxX/(this.canvas.width/event.offsetX));
        let y = Math.ceil(this.props.deviceInfo.maxY/(this.canvas.height/event.offsetY));

        return {x: x, y: y};
    }

    //TODO: normalize for all commands: down, move, up, commit, reset
    //ProtoBuf commands
    /*
    sendTouchDown(payload){
        let message = this.touchDown.create({
            seq: 'd',
            contact: 0,
            x: 0,
            y:0,
            pressure: 50
        });

        let buffer = this.touchDown.encode(message).finish();

        this.websocket.send(buffer);
    }
    */

    //Step 7: command sent to server
    //Send minitouch commands to server
    sendCommands(){
        console.log(`======] Commands [======`, this.commands);

        this.serializer.to({type: 'MINITOUCH', commands: this.commands})
            .then(message => {
                this.websocket.send(message);
                this.commands = [];
            })
            .catch(error => console.error(error));

    }



    //Step 6: User clicks something on canvas
    //Breakout to lib
    //Mouse events, click and swipe
    interactStart(event){
        this.canvas.style.cursor = 'move';
        this.props.setSwiping(true);

        let pos = this.calculatePosition(event);
        
        this.commands.push(`d 0 ${pos.x} ${pos.y} ${this.pressure}`);
        this.commands.push(`c`);
    }

    interactMove(event){
        if(this.props.swiping){
            let pos = this.calculatePosition(event);
            this.commands.push(`m 0 ${pos.x} ${pos.y} ${this.pressure}`);
            this.commands.push(`c`);

            this.sendCommands();
        }
    }

    interactEnd(){
        this.canvas.style.cursor = 'pointer';
        this.props.setSwiping(false);


        this.commands.push(`u 0`);
        this.commands.push(`c`);

        this.sendCommands();
    }

    screenContainerDown(){
        console.log(`======] Container down [======`);
        this.props.setSwiping(true);
    }

    cursorOver(){
        console.log(`======] Cursor over canvas [======`);

        this.canvas.style.cursor = 'pointer';
        this.props.setFocused(true);
        if(this.props.swiping){
            this.interactStart(event);
        }
    }

    cursorOut(){
        console.log(`======] Cursor left canvas [======`);

        this.canvas.style.cursor = 'pointer';
        this.props.setFocused(false);
        if(this.props.swiping){
            this.interactEnd();
        }
    }

    mouseWheel(event){
        console.log(`======] Mouse Wheel [=======`, event);
        //let deltaY = event.deltaY;
        //let wheelDeltaY = event.wheelDeltaY;
    }

    //Breakout to lib
    //Key events
    keyDown(event){
        console.log(`======] Key Down [======`, event);
        event.preventDefault();

        let keycode = event.which;
        if(keycode === 16){
            props.setShiftDown(true);
        }
        
        //TODO: figure out how to use SHIFT and CAPS lock
        if(this.props.focused){
            let androidKeycode = keycodes.map[keycode];
            console.log(`======] KeyCode ${keycode} -> ${androidKeycode} [======`);
            if(androidKeycode){
                let commands = [];
                if(this.props.shiftDown){
                    commands.push(keycodes.map[16]);
                }
                commands.push(androidKeycode);
                this.serializer.to({type: 'KEYEVENT', commands: commands})
                    .then(message => {
                        this.websocket.send(message);
                    })
                    .catch(error => console.error(error));
            }
        }
    }

    keyUp(event){
        event.preventDefault();
        let keycode = event.which;
        console.log(keycode, 'up');
        if(keycode === 16){
            props.setShiftDown(false);
        }
    }

    //Add to key events lib
    //CANNED KEYEVENTS
    menu(){
        console.log(`======] Menu Command [======`);

        this.serializer.to({type: 'KEYEVENT', commands: [keycodes.android[`KEYCODE_APP_SWITCH`]]})
            .then(message => {
                this.websocket.send(message);
            })
            .catch(error => console.error(error));
    }   

    home(){
        console.log(`======] Home Command [======`);

        this.serializer.to({type: 'KEYEVENT', commands: [keycodes.android[`KEYCODE_HOME`]]})
            .then(message => {
                this.websocket.send(message);
            })
            .catch(error => console.error(error));
    }

    back(){
        console.log(`======] Back Command [======`);

        this.serializer.to({type: 'KEYEVENT', commands: [keycodes.android[`KEYCODE_BACK`]]})
            .then(message => {
                this.websocket.send(message);
            })
            .catch(error => console.error(error));
    }


    render(){
        return (
            <div>
                <div id="screen-container"></div>
                <div id="nav-buttons">
                    <Icon onClick={this.menu.bind(this)} className="nav-icons" name="bars" size="3x" />
                    <div className="barrier"></div>
                    <Icon onClick={this.home.bind(this)} className="nav-icons" name="home" size="3x" />
                    <div className="barrier"></div>
                    <Icon onClick={this.back.bind(this)} className="nav-icons" name="arrow-left" size="3x" />
                </div>
            </div>
        );
    }

}

export default ScreenMirror;
