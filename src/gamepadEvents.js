/**
 * Created by r.kravtsov on 04.09.2015.
 */
(function(root, factory){

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // TODO: Think about conflicts
        root.gamepads = root.gamepads || {};
        root.gamepads.GamepadEvents = factory();
    }
})(this, function() {

    'use strict';

    /**
     * @constructor
     */
    var GamepadEvents = function GamepadEvents() {

        // Empty. Must be defined in derived class, otherwise mapping won't work.
        this._buttonDict = {};
        this._axesDict = [{negative: '', positive: ''}];
        this._onEventCallbacks = {};
    };

    /**
     * Utility class for storing function together with provided context;
     * @param {function} callback
     * @param {object} context
     * @constructor
     */
    var CallbackAndContext = function(callback, context) {
        this.callback = callback;
        this.context = context;
    };

    /**
     * Allows to sign on specific event.
     * @param {string} evtName
     * @param {function} callback
     * @param {Object} [context]
     * @returns {GamepadEvents}
     */
    GamepadEvents.prototype.on = function (evtName, callback, context) {
        if (!(evtName in this._onEventCallbacks)) {
            this._onEventCallbacks[evtName] = [];
        }

        this._onEventCallbacks[evtName].push(new CallbackAndContext(callback, context));

        return this;
    };

    /**
     * Allows to sign off specific event or clear subscriptions all together.
     * @param {string} evtName
     * @param {function} callback
     * @returns {GamepadEvents}
     */
    GamepadEvents.prototype.off = function (evtName, callback) {
        if (arguments.length === 0) { // following modern convention, off with no params deletes all handlers.
            this._onEventCallbacks = {};
        }

        if (!(evtName in this._onEventCallbacks)) {
            return this;
        }

        this._onEventCallbacks = this._onEventCallbacks[evtName].filter(function (handler) {
            return handler.callback !== callback
        });

        return this;
    };

    /**
     * Triggers an event listener.
     * @param {string} evtName
     * @returns {GamepadEvents}
     */
    GamepadEvents.prototype.trigger = function (evtName) {
        if (!(evtName in this._onEventCallbacks)) {
            return this;
        }

        var args = Array.prototype.slice.call(arguments, 1);
        this._onEventCallbacks[evtName].forEach(function (callbackAndContext) {
            var callback = callbackAndContext.callback;
            var context = callbackAndContext.context;
            callback.apply(context, args);
        });

        return this;
    };

    GamepadEvents.prototype.getKey = function (buttonId) {
        return this._buttonDict[buttonId];
    };

    GamepadEvents.prototype.getCommand = function (axisValue, axisIndex) {
        var axis = this._axesDict[axisIndex];
        if (!axis) {
            return;
        }

        return (axisValue < 0) ? axis.negative : axis.positive; // Value of 0 is assumed as impossible for now.
    };

    return GamepadEvents;
});
