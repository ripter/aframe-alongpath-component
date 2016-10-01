if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Alongpath component for A-Frame.
 * Move Entities along a predefined path
 */
AFRAME.registerComponent('alongpath', {
    schema: {
        path: {default: ''},
        closed: {default: false},
        dur: {default: 1000},
        delay: {default: 2000},
        loop: {default: false},
    },

    init: function () {
        this.data.initialPosition = this.el.getAttribute("position");
    },

    update: function (oldData) {

        // Only restart following the path when
        // Path-Data has been changed.
        if (oldData.path != this.data.path) {

            var points = this.data.path.split(' ').map(function (p) {
                p = p.split(',');
                return new THREE.Vector3(
                    parseFloat(p[0]),
                    parseFloat(p[1]),
                    parseFloat(p[2])
                );
            });


            var curve = new THREE.CatmullRomCurve3(points);
            curve.closed = this.data.closed;

            this.data.curve = curve;

            // Reset to initial state
            this.data.interval = 0;
            this.el.removeState("endofpath");
        }

    },

    tick: function (time, timeDelta) {

        // Only update position if we didn't reach
        // the end of the path
        if (!this.el.is("endofpath")) {
            this.data.interval = this.data.interval + timeDelta;

            var i = 0;

            if (this.data.interval - this.data.delay >= this.data.dur) {
                // Time is up, we should be at the end of the path
                i = 1;
            } else if ((this.data.interval - this.data.delay < 0)) {
                // We are still waiting for the delay-time to finish
                // so keep entity at the beginning of the path
                i = 0;
            } else {
                // Update path position based on timing
                i = (this.data.interval - this.data.delay) / this.data.dur;
            }

            try {
                if ((this.data.loop === false) && i >= 1) {
                    // We have reached the end of the path and are not going
                    // to loop back to the beginning therefore set final state
                    this.el.removeState("moveonpath");
                    this.el.addState("endofpath");

                    // Set the end-position
                    if (this.data.closed) {
                        this.el.setAttribute('position', this.data.curve.points[0]);
                    } else {
                        this.el.setAttribute('position', this.data.curve.points[this.data.curve.points.length - 1]);
                    }
                } else if ((this.data.loop === true) && i >= 1) {
                    // We have reached the end of the path
                    // but we are looping through the curve,
                    // so restart here.
                    this.data.interval = this.data.delay;
                } else {
                    // We are somewhere in the middle of the path
                    // updating position
                    var p = this.data.curve.getPoint(i);
                    this.el.setAttribute('position', p);
                    if (!this.el.is("moveonpath")) {
                        this.el.addState("moveonpath");
                    }
                }
            } catch (ex) {
            }
        }
    },

    remove: function () {
        this.el.setAttribute("position", this.data.initialPosition);
    }
});