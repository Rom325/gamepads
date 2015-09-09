/**
 * Created by r.kravtsov on 03.09.2015.
 */
/**
 * @module GamepadListener
 */
(function(root, factory){

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        root.gamepads = root.gamepads || {};
        root.gamepads.GamepadListener = factory();
    }
})(this, function (){

    'use strict';

    /**
     * If this function is not available nothing will work.
     * @type {function(this:(Navigator|WorkerNavigator))}
     */
    var getGamepads = navigator.getGamepads.bind(navigator);

    /**
     * Factory returning a function that removes handlers from a specified invocation list.
     * @param invocationList {Array}
     * @returns {Function}
     * @private
     */
    function _removeCallback(invocationList){
        return function(callback) {
            var existsAt = -1;
            for (var i = 0; i < invocationList.length; i++) {
                if (invocationList[i].callback == callback) {
                    existsAt = i;
                }
            }

            if (existsAt === -1) {
                return;
            }

            invocationList.splice(existsAt, 1);
        }
    }

    /**
     * Factory returning a function that add handlers to a specified invocation list.
     * @param invocationList {Array}
     * @returns {Function}
     * @private
     */
    function _addCallback(invocationList){
        return function(callback, context) {
            var existsAt = -1;
            for (var i = 0; i < invocationList.length; i++) {
                if (invocationList[i].callback == callback) {
                    existsAt = i;
                }
            }

            if (existsAt === -1) {
                invocationList.push({callback: callback, context: context});
            }
        }
    }

    /**
     * Factory returning a function that calls handlers from specified invocation list.
     * @param {Array} invocationList
     * @returns {Function}
     * @private
     */
    function _invokeCallbacks(invocationList) {
        return function(callback){
            var args = arguments;
            invocationList.forEach(function(callbackAndContextObj){
                    var callback = callbackAndContextObj.callback;
                    var context = callbackAndContextObj.context;
                    callback.apply(context, Array.prototype.slice.call(args));
                }
            );
        };
    }

    var gamepadUpdateCallbacks = [];
    var addgamepadUpdateCallback = _addCallback(gamepadUpdateCallbacks);
    var removegamepadUpdateCallback = _removeCallback(gamepadUpdateCallbacks);
    var invokegamepadUpdateCallbacks = _invokeCallbacks(gamepadUpdateCallbacks);

    var gamepadConnectedCallbacks = [];
    var addGamepadConnectedCallback = _addCallback(gamepadConnectedCallbacks);
    var removeGamepadConnectedCallback = _removeCallback(gamepadConnectedCallbacks);
    var invokeGamepadConnectedCallbacks = _invokeCallbacks(gamepadConnectedCallbacks);

    var gamepadDisconnectedCallbacks = [];
    var addGamepadDisconnectedCallback = _addCallback(gamepadDisconnectedCallbacks);
    var removeGamepadDisconnectedCallback = _removeCallback(gamepadDisconnectedCallbacks);
    var invokeGamepadDisconnectedCallbacks = _invokeCallbacks(gamepadDisconnectedCallbacks);

    var registeredGamepadTimestamps = {length: 0}; // This object is used like a hash table.

    /**
     * The timestamp changes when gamepad's state does.
     * @param {Gamepad} gamepad
     * @returns {boolean}
     */
    function timeStampHasChanged(gamepad) {

        if(gamepad.id in registeredGamepadTimestamps){

            if(gamepad.timestamp === registeredGamepadTimestamps[gamepad.id]){
                return false;
            }

            registeredGamepadTimestamps[gamepad.id] = gamepad.timestamp;
            return true;
        }

        // Insure that gamepad is registered. Although gamepad should be registered in gamepadconnected event handler.
        registeredGamepadTimestamps[gamepad.id] = gamepad.timestamp;
        registeredGamepadTimestamps.length += 1;
        return false;
    }

    /**
     * Stores current requestAnimationFrame id for the purpose of canceling.
     * @type {number}
     */
    var requestId = 0;

    /**
     * Main loop function. Schedules itself every animation frame.
     * This is intended, throttling is to be implemented by calling code.
     */
    function updateGamepads(){
        getGamepads().forEach(function(gamepad){
            if(timeStampHasChanged(gamepad)){
                invokegamepadUpdateCallbacks(gamepad);
            }
        });

        requestId = window.requestAnimationFrame(updateGamepads);
    }

    /**
     * Makes all work listening for gamepads updates. You should have only one instance of GamepadListener.
     * @constructor
     */
    function GamepadListener(){
        this.startListening = function(){
            window.addEventListener('gamepadconnected', onGamepadConnected, false);
            window.addEventListener('gamepaddisconnected', onGamepadDisconnected, false);
        }
    }

    /**
     * At the moment of writing works in Chrome too, but further Chrome behaviour is incorrect.
     * @param {Event} evt
     */
    function onGamepadConnected(evt){
        registeredGamepadTimestamps[evt.gamepad.id] = evt.gamepad.timestamp;
        registeredGamepadTimestamps.length += 1;
        invokeGamepadConnectedCallbacks(evt);
        if(registeredGamepadTimestamps.length === 1){
            requestId = window.requestAnimationFrame(updateGamepads);
        }
    }

    /**
     * At the moment of writing works in Chrome too, but further Chrome behaviour is incorrect.
     * @param {Event} evt
     */
    function onGamepadDisconnected(evt){
        registeredGamepadTimestamps[evt.gamepad.id] = undefined;
        registeredGamepadTimestamps.length -= 1;
        invokeGamepadDisconnectedCallbacks(evt);
        if(registeredGamepadTimestamps.length === 0){
            window.cancelAnimationFrame(requestId);
        }
    }

    GamepadListener.prototype.addgamepadUpdateCallback = addgamepadUpdateCallback;
    GamepadListener.prototype.removegamepadUpdateCallback = removegamepadUpdateCallback;
    GamepadListener.prototype.addGamepadConnectedCallback = addGamepadConnectedCallback;
    GamepadListener.prototype.removeGamepadConnectedCallback = removeGamepadConnectedCallback;
    GamepadListener.prototype.addGamepadDisconnectedCallback = addGamepadDisconnectedCallback;
    GamepadListener.prototype.removeGamepadDisconnectedCallback = removeGamepadDisconnectedCallback;

    return GamepadListener;
});
