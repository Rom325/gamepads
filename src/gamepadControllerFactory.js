/**
 * Created by r.kravtsov on 08.09.2015.
 */
(function(root, factory){

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['./gamepadController', './gamepadEvents'], factory);
    } else {
        var namespace = root.gamepads;
        namespace.GamepadControllerFactory = factory(namespace.GamepadController, namespace.GamepadEvents);
    }
})(this, function(GamepadController, GamepadEvents) {

    /**
     * This class composes controller with custom or default mapping
     * allowing to subscribe on events with certain control names
     * instead of generic axes and buttons.
     * @param {GamepadEvents} [GamepadEventsMapping]
     * @param {GamepadController} [GamepadCustomController]
     * @constructor
     */
    function GamepadControllerFactory(GamepadEventsMapping, GamepadCustomController) {
        this._gamepadEventsMapping = new (GamepadEventsMapping || GamepadEvents);
        this._gamepadController = new (GamepadCustomController || GamepadController);
        this._setHandlers();
    }

    /**
     * @private
     */
    GamepadControllerFactory.prototype._setHandlers = function () {
        var self = this;
        this._gamepadController.onAxisDiscreteStateChanged = function (axisValue, axisIndex, gamepadId) {
            var evtName = self._gamepadEventsMapping.getCommand(axisValue, axisIndex);
            if (!evtName) {
                return;
            }

            self._gamepadEventsMapping.trigger(evtName, axisValue, axisIndex, gamepadId);
        };

        this._gamepadController.onAxisStateChanged = function (axisValue, axisIndex, gamepadId) {
            var evtName = self._gamepadEventsMapping.getCommand(axisValue, axisIndex);
            if (!evtName) {
                return;
            }

            self._gamepadEventsMapping.trigger(evtName, axisValue, axisIndex, gamepadId);
        };

        this._gamepadController.onButtonStateChanged = function (buttonIndex, gamepadId) {
            var evtName = self._gamepadEventsMapping.getKey(buttonIndex);
            if (!evtName) {
                return;
            }

            self._gamepadEventsMapping.trigger(evtName, buttonIndex, gamepadId);
        };

        this._gamepadController.onGamepadConnected = function (gamepad){
            self._gamepadEventsMapping.trigger('gamepadconnected', gamepad);
        };

        this._gamepadController.onGamepadDisconnected = function (gamepad) {
            self._gamepadEventsMapping.trigger('gamepaddisconnected', gamepad);
        }
    };

    /**
     * By passes 'on' calls to the underlying eventMapping.
     * @param {string} evtName
     * @param {function} callback
     * @param {object} [context]
     * @returns {GamepadControllerFactory}
     */
    GamepadControllerFactory.prototype.on = function (evtName, callback, context) {
        this._gamepadEventsMapping.on(evtName, callback, context);
        return this;
    };

    /**
     * By passes 'off' calls to the underlying eventMapping.
     * @param {string} evtName
     * @param {function} callback
     * @returns {GamepadControllerFactory}
     */
    GamepadControllerFactory.prototype.off = function (evtName, callback) {
        this._gamepadEventsMapping.off(evtName, callback);
        return this;
    };

    /**
     * By passes 'trigger' calls to the underlying eventMapping.
     * @param {string} evtName
     * @returns {GamepadControllerFactory}
     */
    GamepadControllerFactory.prototype.trigger = function (evtName) {
        this._gamepadEventsMapping.trigger(evtName, Array.prototype.slice.call(arguments, 1));
        return this;
    };

    /**
     * Starts attached gamepadController.
     * @returns {GamepadControllerFactory}
     */
    GamepadControllerFactory.prototype.start = function (isContinuousMode) {
        this._gamepadController.start(isContinuousMode);
        return this;
    };

    /**
     * Calls the same method on underlying gamepadController.
     * Works faster when gamepadId is specified.
     * @param {string} [gamepadId]
     * @returns {GamepadControllerFactory}
     */
    GamepadControllerFactory.prototype.toggleUpdateMode = function(gamepadId){
        this._gamepadController.toggleUpdateMode(gamepadId);
        return this;
    };

    /**
     * Calls the same method on underlying gamepadController.
     * Works faster when gamepadId is specified.
     * @param isContinuousMode
     * @param [gamepadId]
     * @returns {GamepadControllerFactory}
     */
    GamepadControllerFactory.prototype.setUpdateMode = function(isContinuousMode, gamepadId){
        this._gamepadController.setUpdateMode(isContinuousMode, gamepadId);
        return this;
    };

    return GamepadControllerFactory;
});
