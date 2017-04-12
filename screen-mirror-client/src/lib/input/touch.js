class Touch {

  constructor(){

    console.log(`======] Touch [======`);

    this.slots = [];
    this.slotted = Object.create(null);
    this.fingers = [];
    this.seq = -1;
    this.cycle = 100;
    this.fakePinch = false;
    this.lastPossiblyBuggyMouseUpEvent = 0;
    this.element = null;
  }

  initialize(element){
    console.log(`======] Touch Init [======`);

    //this.element = element;

    //this.element.on('touchstart', touchStartListener);
    //this.element.on('mousedown', mouseDownListener);
    //this.element.on('mouseup', mouseUpBugWorkaroundListener);

    this.createSlots();
  }

  nextSeq() {
    return ++this.seq >= this.cycle ? (this.seq = 0) : this.seq;
  }

  createSlots() {
      // The reverse order is important because slots and fingers are in
      // opposite sort order. Anyway don't change anything here unless
      // you understand what it does and why.
      for (let i = 9; i >= 0; --i) {
        let finger = this.createFinger(i);
        //this.element.append(finger);
        this.slots.push(i);
        this.fingers.unshift(finger);
      }
  }

  activateFinger(index, x, y, pressure) {
    //let scale = 0.5 + pressure;
    this.fingers[index].classList.add('active');
    //this.fingers[index].style[cssTransform] = 'translate3d(' + x + 'px,' + y + 'px,0) ' + 'scale(' + scale + ',' + scale + ')';
  }

  deactivateFinger(index) {
    this.fingers[index].classList.remove('active');
  }

  deactivateFingers() {
    for (let i = 0, l = this.fingers.length; i < l; ++i) {
      this.fingers[i].classList.remove('active');
    }
  }

  createFinger(index) {
    let el = document.createElement('span');
    el.className = 'finger finger-' + index;
    return el;
  }

  /*
  calculateBounds() {
    let el = this.element[0];

    //get property from parent
    screen.bounds.w = el.offsetWidth;
    screen.bounds.h = el.offsetHeight;
    screen.bounds.x = 0;
    screen.bounds.y = 0;

    while (el.offsetParent) {
      screen.bounds.x += el.offsetLeft;
      screen.bounds.y += el.offsetTop;
      el = el.offsetParent;
    }
  }
  */
  mouseDownListener(event) {
    let e = event;
    if (e.originalEvent) {
      e = e.originalEvent;
    }

    // Skip secondary click
    if (e.which === 3) {
      return;
    }

    e.preventDefault();

    this.fakePinch = e.altKey

    //this.calculateBounds()
    this.startMousing();

    //let x = e.pageX - screen.bounds.x;
    //let y = e.pageY - screen.bounds.y;
    //let pressure = 0.5;
    //let scaled = scaler.coords(screen.bounds.w, screen.bounds.h, x, y, screen.rotation);

    //this.control.touchDown(this.nextSeq(), 0, scaled.xP, scaled.yP, pressure);

    if (this.fakePinch) {
      //this.control.touchDown(this.nextSeq(), 1, 1 - scaled.xP, 1 - scaled.yP, pressure);
    }

    //this.control.touchCommit(this.nextSeq());

    //this.activateFinger(0, x, y, pressure);

    //if (this.fakePinch) {
      //this.activateFinger(1, -e.pageX + screen.bounds.x + screen.bounds.w, -e.pageY + screen.bounds.y + screen.bounds.h, pressure);
    //}

    //this.element.bind('mousemove', mouseMoveListener);
    //$document.bind('mouseup', mouseUpListener);
    //$document.bind('mouseleave', mouseUpListener);

    if (this.lastPossiblyBuggyMouseUpEvent &&
        this.lastPossiblyBuggyMouseUpEvent.timeStamp > e.timeStamp) {
      // We got mouseup before mousedown. See mouseUpBugWorkaroundListener
      // for details.
      //mouseUpListener(this.lastPossiblyBuggyMouseUpEvent);
    }else{ 
      this.lastPossiblyBuggyMouseUpEvent = null;
    }
  }

  mouseMoveListener(event) {
    let e = event;
    if (e.originalEvent) {
      e = e.originalEvent;
    }

    // Skip secondary click
    if (e.which === 3) {
      return;
    }
    e.preventDefault();

    let addGhostFinger = !this.fakePinch && e.altKey;
    let deleteGhostFinger = this.fakePinch && !e.altKey;

    this.fakePinch = e.altKey;

    let x = e.pageX - screen.bounds.x;
    let y = e.pageY - screen.bounds.y;
    let pressure = 0.5;
    //let scaled = scaler.coords(screen.bounds.w, screen.bounds.h, x, y, screen.rotation);

    //this.control.touchMove(this.nextSeq(), 0, scaled.xP, scaled.yP, pressure);

    if (addGhostFinger) {
      //this.control.touchDown(this.nextSeq(), 1, 1 - scaled.xP, 1 - scaled.yP, pressure);
    }
    else if (deleteGhostFinger) {
      //this.control.touchUp(this.nextSeq(), 1);
    }
    else if (this.fakePinch) {
      //this.control.touchMove(this.nextSeq(), 1, 1 - scaled.xP, 1 - scaled.yP, pressure);
    }

    //this.control.touchCommit(this.nextSeq());

    this.activateFinger(0, x, y, pressure);

    if (deleteGhostFinger) {
      this.deactivateFinger(1);
    }
    else if (this.fakePinch) {
      this.activateFinger(1, -e.pageX + screen.bounds.x + screen.bounds.w, -e.pageY + screen.bounds.y + screen.bounds.h, pressure);
    }
  }

  mouseUpListener(event) {
    let e = event;
    if (e.originalEvent) {
      e = e.originalEvent;
    }

    // Skip secondary click
    if (e.which === 3) {
      return;
    }
    e.preventDefault();

    //this.control.touchUp(this.nextSeq(), 0);

    if (this.fakePinch) {
      //this.control.touchUp(this.nextSeq(), 1);
    }

    //this.control.touchCommit(this.nextSeq());

    this.deactivateFinger(0);

    if (this.fakePinch) {
      this.deactivateFinger(1);
    }

    this.stopMousing();
  }

  mouseUpBugWorkaroundListener(e) {
    this.lastPossiblyBuggyMouseUpEvent = e;
  }

  startMousing() {
    //this.control.gestureStart(this.nextSeq())
    //input[0].focus();
  }

  stopMousing() {
    //this.element.unbind('mousemove', mouseMoveListener);
    //$document.unbind('mouseup', mouseUpListener);
    //$document.unbind('mouseleave', mouseUpListener);
    this.deactivateFingers();
    //this.control.gestureStop(this.nextSeq());
  }

  touchStartListener(event) {
    let e = event;
    e.preventDefault();

    //Make it jQuery compatible also
    if (e.originalEvent) {
      e = e.originalEvent;
    }

    this.calculateBounds()

    if (e.touches.length === e.changedTouches.length) {
      this.startTouching();
    }

    let currentTouches = Object.create(null);
    let i, l;

    for (i = 0, l = e.touches.length; i < l; ++i) {
      currentTouches[e.touches[i].identifier] = 1;
    }

    const maybeLostTouchEnd = (id) => {
      return !(id in currentTouches);
    }

    // We might have lost a touchend event due to letious edge cases
    // (literally) such as dragging from the bottom of the screen so that
    // the control center appears. If so, let's ask for a reset.
    if (Object.keys(this.slotted).some(maybeLostTouchEnd)) {
      Object.keys(this.slotted).forEach((id) => {
        this.slots.push(this.slotted[id]);
        delete this.slotted[id];
      })
      this.slots.sort().reverse();
      //this.control.touchReset(this.nextSeq());
      this.deactivateFingers();
    }

    if (!this.slots.length) {
      // This should never happen but who knows...
      throw new Error('Ran out of multitouch slots');
    }

    for (i = 0, l = e.changedTouches.length; i < l; ++i) {
      let touch = e.changedTouches[i];
      let slot = this.slots.pop();
      let x = touch.pageX - screen.bounds.x;
      let y = touch.pageY - screen.bounds.y;
      let pressure = touch.force || 0.5;
      //let scaled = scaler.coords(screen.bounds.w, screen.bounds.h, x, y, screen.rotation);

      this.slotted[touch.identifier] = slot;
      //this.control.touchDown(this.nextSeq(), slot, scaled.xP, scaled.yP, pressure);
      this.activateFinger(slot, x, y, pressure);
    }

    //element.bind('touchmove', touchMoveListener);
    //$document.bind('touchend', touchEndListener);
    //$document.bind('touchleave', touchEndListener);

    //this.control.touchCommit(this.nextSeq());
  }

  touchMoveListener(event) {
    let e = event;
    e.preventDefault();

    if (e.originalEvent) {
      e = e.originalEvent;
    }

    for (let i = 0, l = e.changedTouches.length; i < l; ++i) {
      let touch = e.changedTouches[i];
      let slot = this.slotted[touch.identifier];
      let x = touch.pageX - screen.bounds.x;
      let y = touch.pageY - screen.bounds.y;
      let pressure = touch.force || 0.5;
      //let scaled = scaler.coords(screen.bounds.w, screen.bounds.h, x, y, screen.rotation);

      //this.control.touchMove(this.nextSeq(), slot, scaled.xP, scaled.yP, pressure);
      this.activateFinger(slot, x, y, pressure);
    }

    //this.control.touchCommit(this.nextSeq());
  }

  touchEndListener(event) {
    let e = event;
    if (e.originalEvent) {
      e = e.originalEvent;
    }

    let foundAny = false;

    for (let i = 0, l = e.changedTouches.length; i < l; ++i) {
      let touch = e.changedTouches[i];
      let slot = this.slotted[touch.identifier];
      if (typeof slot === 'undefined') {
        // We've already disposed of the contact. We may have gotten a
        // touchend event for the same contact twice.
        continue;
      }
      delete this.slotted[touch.identifier];
      this.slots.push(slot);
      //this.control.touchUp(this.nextSeq(), slot);
      this.deactivateFinger(slot);
      foundAny = true;
    }

    if (foundAny) {
      //this.control.touchCommit(this.nextSeq());
      if (!e.touches.length) {
        this.stopTouching();
      }
    }
  }

  startTouching() {
    //this.control.gestureStart(this.nextSeq());
  }

  stopTouching(element) {
    //element.unbind('touchmove', touchMoveListener);
    //$document.unbind('touchend', touchEndListener);
    //$document.unbind('touchleave', touchEndListener);
    this.deactivateFingers();
    //this.control.gestureStop(this.nextSeq());
  }

}

export default Touch;
