/**
 * Created by r.kravtsov on 08.09.2015.
 */
/**
 * Axis T8311 joystick mapping.
 * @constructor
 */

(function(root, factory){

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['./gamepadEvents'], factory);
    } else {
        var namespace = root.gamepads;
        namespace.AxisT8311Events = factory(namespace.GamepadEvents);
    }
})(this, function(GamepadEvents) {

    /**
     * Defines an event mapping for AxisT8311 controller.
     * @constructor
     */
    function AxisT8311Events() {
        GamepadEvents.call(this); // Base constructor call

        this._buttonDict = {
            0: 'J1',
            1: 'J2',
            2: 'J3',
            3: 'J4',
            4: 'L',
            5: 'R'
        };

        this._axesDict = [
            {negative: 'left', positive: 'right'},
            {negative: 'up', positive: 'down'},
            {negative: 'zoom-out', positive: 'zoom-in'}
        ];
    }

    AxisT8311Events.prototype = Object.create(GamepadEvents.prototype);
    AxisT8311Events.prototype.constructor = AxisT8311Events;

    return AxisT8311Events
});
