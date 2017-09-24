if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* Alongpath component for A-Frame.
* Move Entities along a predefined Curve
*/
AFRAME.registerComponent('alongpath', {
  schema: {
    curve: {default: ''},
    triggers: {default: 'a-curve-point'},
    triggerRadius: {type: 'number', default: 0.5},
    dur: {default: 1000},
    delay: {default: 0},
    loop: {default: false},
    rotate: {default: false},
    resetonplay: {default:true},
    isPlaying:{default: true},
    canReverse:{default: true},
    isReversing:{default: false},
  },

  init: function () {
  },

  update: function (oldData) {
    this.curve = document.querySelector(this.data.curve);
    const triggers = this.curve.querySelectorAll(this.data.triggers);


    if (!this.curve) {
      console.warn("Curve not found. Can't follow anything...");
    } else {
      this.initialPosition = this.el.object3D.position;
    }

    this.triggers = Array.from(triggers);
    this.reset('update');
  },

  reset: function(source) {
    // Reset to initial state
    this.interval = 0;

    this.el.removeState("endofpath");
    this.el.removeState("moveonpath");

    if (this.activeTrigger) {
      this.activeTrigger.removeState("alongpath-active-trigger");
      this.activeTrigger = null;
    }
  },

  getI_: function (interval, delay, dur) {
    var i = 0;

    if (interval - delay >= dur) {
      // Time is up, we should be at the end of the path
      i = 1;
    } else if ((interval - delay < 0)) {
      // We are still waiting for the delay-time to finish
      // so keep entity at the beginning of the path
      i = 0;
    } else {
      // Update path position based on timing
      i = (interval - delay) / dur;
    }

    return i
  },

  tick: function (time, timeDelta) {
    if (!this.data.isPlaying) { return; }
    const { isReversing, canReverse } = this.data;
    let isLastFrame = false;

    var curve = this.curve.components['curve'] ? this.curve.components['curve'].curve : null;

    if (curve) {
      // Only update position if we didn't reach
      // the end of the path
      if (!this.el.is("endofpath")) {
        this.interval = this.interval + timeDelta;

        // i is a percent of the animation to render.
        // a value between 0 - 1
        var i = this.getI_(this.interval, this.data.delay, this.data.dur);
        isLastFrame = i >= 1;

        // Last Frame when moving forward
        if (isLastFrame && !isReversing && canReverse) {
          this.data.isReversing = true;
        }
        // Last Frame when moving backwards
        else if (isLastFrame && isReversing && canReverse) {
          this.data.isReversing = false;
        }

        // i is a percentage complete
        // For reversing, we just invert the percent so it animates backwards
        if (isReversing) {
          i = 1 - i;
        }

        // not looping, end of path
        if (isLastFrame && (this.data.loop === false)) {
          // Set the end-position
          this.el.setAttribute('position', curve.points[curve.points.length - 1]);

          // We have reached the end of the path and are not going
          // to loop back to the beginning therefore set final state
          this.el.removeState("moveonpath");
          this.el.addState("endofpath");
          this.el.emit("movingended");
        }
        // looping, end of path
        else if (isLastFrame && (this.data.loop === true)) {
          // We have reached the end of the path
          // but we are looping through the curve,
          // so restart here.
          this.el.emit("movingended");
          this.interval = this.data.delay;
        } else {
          // We are starting to move or somewhere in the middle of the path…
          if (!this.el.is("moveonpath")) {
            this.el.addState("moveonpath");
            this.el.emit("movingstarted");
          }

          // …updating position
          var p = curve.getPoint(i);
          this.el.setAttribute('position', p);
        }

        // Update Rotation of Entity
        if (this.data.rotate === true) {

          var nextInterval = this.interval + timeDelta
          var nextPosition = curve.getPoint(this.getI_(nextInterval, this.data.delay, this.data.dur));

          this.el.object3D.lookAt(nextPosition)

        }

        // Check for Active-Triggers
        if (this.triggers && (this.triggers.length > 0)) {
          this.updateActiveTrigger();
        }
      }
    } else {
      console.error("The entity associated with the curve property has no curve component.");
    }
  },

  play: function () {
    if (this.data.resetonplay) {
      this.reset('play');
    }
  },

  remove: function () {
    this.el.object3D.position.copy(this.initialPosition);
  },

  updateActiveTrigger: function() {
    const { el, triggers, lastTrigger } = this;
    const { triggerRadius } = this.data;
    const activeTrigger = triggers.find((item) => {
      // short version
      return item.object3D.position.distanceTo(el.object3D.position) <= triggerRadius;
    });

    // if we found an active trigger
    // Emit the event
    // dedup so we don't re-emit the event
    if (activeTrigger && lastTrigger !== activeTrigger) {
      // this.data.lastTrigger = activeTrigger;
      this.lastTrigger = activeTrigger;
      activeTrigger.emit('alongpath-trigger-activated');
    }
    else if (!activeTrigger && lastTrigger) {
      this.lastTrigger = null;
    }

    // for (var i = 0; i < this.triggers.length; i++) {
    //   if (this.triggers[i].object3D) {
    //     if (this.triggers[i].object3D.position.distanceTo(this.el.object3D.position) <= this.data.triggerRadius) {
    //       // If this element is not the active trigger, activate it - and if necessary deactivate other triggers.
    //       if (this.activeTrigger && (this.activeTrigger != this.triggers[i])) {
    //         this.activeTrigger.removeState("alongpath-active-trigger");
    //         console.log('alongpath 9', 'alongpath-trigger-deactivated');
    //         this.activeTrigger.emit("alongpath-trigger-deactivated");
    //
    //         this.activeTrigger = this.triggers[i];
    //         this.activeTrigger.addState("alongpath-active-trigger");
    //         console.log('alongpath 1', 'alongpath-trigger-activated');
    //         this.activeTrigger.emit("alongpath-trigger-activated");
    //       } else if (!this.activeTrigger) {
    //         this.activeTrigger = this.triggers[i];
    //         this.activeTrigger.addState("alongpath-active-trigger");
    //         console.log('alongpath 2', 'alongpath-trigger-activated');
    //         this.activeTrigger.emit("alongpath-trigger-activated");
    //       }
    //
    //       break;
    //     } else {
    //       // If this Element was the active trigger, deactivate it
    //       if (this.activeTrigger && (this.activeTrigger == this.triggers[i])) {
    //         this.activeTrigger.removeState("alongpath-active-trigger");
    //         console.log('alongpath 8', 'alongpath-trigger-deactivated');
    //         this.activeTrigger.emit("alongpath-trigger-deactivated");
    //         this.activeTrigger = null;
    //       }
    //     }
    // }
    // }
  }
});
