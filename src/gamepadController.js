/**
 * Created by r.kravtsov on 04.09.2015.
 */

(function(root, factory){

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['./gamepadListener'], factory);
    } else {
        var namespace = root.gamepads;
        namespace.GamepadController = factory(namespace.GamepadListener);
    }
})(this, function(GamepadListener) {

    'use strict';

    /**
     * Main object of the lib. Represents a single point for controlling all gamepads.
     * @constructor
     */
    function GamepadController() {
        this._gamepadLastStates = {};
        this._gamepadListener = new GamepadListener();
    }


    /**
     * Entry point of the GamepadController.
     * Must be called after object created and all initial listeners attached.
     * @param {Boolean} isContinuousUpdate
     */
    GamepadController.prototype.start = function (isContinuousUpdate) {
        this._setHandlers(isContinuousUpdate);
        this._gamepadListener.startListening();
    };

    /**
     * Toggles update mode on demand. Notice that performance is greater if gamepadId is specified.
     * @param {string} [gamepadId]
     */
    GamepadController.prototype.toggleUpdateMode = function (gamepadId){
        if(typeof gamepadId === "string"){
            var gamepadLastState = this._gamepadLastStates[gamepadId];
            if(gamepadLastState){
                gamepadLastState.updateMode.continuous = !gamepadLastState.updateMode.continuous;
            }
        }else{
            Object.keys(this._gamepadLastStates).forEach(function(gamepadId){
                var lastUpdate = this._gamepadLastStates[gamepadId];
                lastUpdate.updateMode.continuous = !lastUpdate.updateMode.continuous;
            }, this);
        }
    };

    /**
     * Sets update mode on demand. Notice that performance is greater if gamepadId is specified.
     * @param {Boolean} isContinuousUpdate
     * @param {string} [gamepadId]
     */
    GamepadController.prototype.setUpdateMode = function (isContinuousUpdate, gamepadId){
        if(typeof gamepadId === "string"){
            var gamepadLastState = this._gamepadLastStates[gamepadId];
            if(gamepadLastState && (gamepadLastState.updateMode.continuous !== isContinuousUpdate)){
                gamepadLastState.continuous = isContinuousUpdate;
            }
        }else{
            Object.keys(this._gamepadLastStates).forEach(function(gamepadId){
                var lastUpdate = this._gamepadLastStates[gamepadId];
                if(lastUpdate.updateMode.continuous !== isContinuousUpdate){
                    lastUpdate.updateMode.continuous = isContinuousUpdate;
                }
            }, this);
        }
    };

    /**
     * Listens to a gamepad's axes update while the gamepad controller is in discrete mode.
     * @param {number} axisValue
     * @param {number} axisIndex
     * @param {string} gamepadId
     */
    GamepadController.prototype.onAxisDiscreteStateChanged = function (axisValue, axisIndex, gamepadId) {
    };

    /**
     *  Listens to a gamepad's axes update while the gamepad controller is in continuous mode.
     * @param {number} axisValue
     * @param {number} axisIndex
     * @param {string} gamepadId
     */
    GamepadController.prototype.onAxisStateChanged = function (axisValue, axisIndex, gamepadId) {
    };

    /**
     * Listens to a gamepad's buttons update. Works in both discrete and continuous modes.
     * @param {number} buttonIndex
     * @param {string} gamepadId
     */
    GamepadController.prototype.onButtonStateChanged = function (buttonIndex, gamepadId) {
    };

    /**
     * Triggers, when gamepad is connected.
     * @param {Gamepad} gamepad
     */
    GamepadController.prototype.onGamepadConnected = function (gamepad) {
    };

    /**
     * Triggers when gamepad is disconnected
     * @param {Gamepad} gamepad
     */
    GamepadController.prototype.onGamepadDisconnected = function (gamepad) {
    };

    /**
     * Subscribes on gamepadListener's events.
     * @param {Boolean} isContinuousUpdate
     * @private
     */
    GamepadController.prototype._setHandlers = function (isContinuousUpdate) {
        var self = this;
        this._gamepadListener.addGamepadConnectedCallback(function (evt) {
            self._addGamepad(evt.gamepad, {continuous: isContinuousUpdate});
        }, self);

        this._gamepadListener.addGamepadDisconnectedCallback(function (evt) {
            self._removeGamepad(evt.gamepad);
        }, self);

        this._gamepadListener.addgamepadUpdateCallback(self._updateGamepad, self);
    };


    /**
     * GamepadState is internal object for storing
     * gamepad state in older frames.
     * @param {Gamepad} gamepad
     * @param {number} lastUpdateTimestamp
     * @param {object} updateMode
     * @constructor
     */
    function GamepadState(gamepad, lastUpdateTimestamp, updateMode) {
        this.axes = gamepad.axes;
        this.buttons = gamepad.buttons;
        this.lastUpdateTimestamp = lastUpdateTimestamp;
        this.updateMode = updateMode || {continuous: true};
    }

    /**
     * Maybe useful in future. Resets last state to default.
     * @private
     * @returns {GamepadState}
     */
    GamepadState.prototype._clearState = function () {
        for (var i = 0; i < this.axes.length; i++) {
            this.axes[i] = 0;
        }

        // Caution! I don't know of other way to reset buttons
        for (var i = 0; i < this.buttons.length; i++) {
            this.buttons[i] = Object.create(GamepadButton.prototype, {
                value: {
                    value: i,
                    writable: false,
                    configurable: false
                },
                pressed: {
                    value: false
                }
            });
        }

        this.lastUpdateTimestamp = Date.now();

        return this;
    };

    /**
     * Conveniently updates last state for a given controller
     * @param {Gamepad} gamepad
     * @param {object} updateMode
     * @private
     */
    GamepadController.prototype._updateLastState = function (gamepad, updateMode) {
        if (!updateMode) {
            updateMode = {continuous: true};
        }

        this._gamepadLastStates[gamepad.id] = new GamepadState(gamepad, Date.now(), updateMode);
    };

    /**
     * Works only in the discrete mode
     * @type {number}
     */
    GamepadController.updateDelayInMs = 350;

    /**
     * Helps to ignore gamepad updates when axis values oscillate
     * close to the zero.
     * Important for discrete mode, especially when a gamepad is too sensitive.
     * @type {number}
     */
    GamepadController.minAxisValueInDiscreteMode = 0.2;

    /**
     * Helps to ignore gamepad updates when axis values oscillate
     * close to the zero.
     * This is for continuous mode where more sensitivity is required.
     * @type {number}
     */
    GamepadController.minAxisValueInContinuousMode = 0.05;

    /**
     * Updates button states.
     * @param {Gamepad} gamepad
     * @private
     */
    GamepadController.prototype._updateButtons = function (gamepad) {
        var currentStateButtons = gamepad.buttons;
        for (var i = 0; i < currentStateButtons.length; i++) {
            if (currentStateButtons[i].pressed) {
                this.onButtonStateChanged(i, gamepad.id);
            }
        }
    };

    /**
     * Update axes states, applying rules for continuous mode.
     * @param gamepad {Gamepad}
     * @private
     */
    GamepadController.prototype._updateAxes = function (gamepad) {
        var currentStateAxes = gamepad.axes;
        for (var i = 0; i < currentStateAxes.length; i++) {
            if (Math.abs(currentStateAxes[i]) < GamepadController.minAxisValueInContinuousMode) {
                // If gamepad hasn't moved along this axis proceed to the next.
                continue;
            }

            this.onAxisStateChanged(currentStateAxes[i], i, gamepad.id);
        }
    };

    /**
     * Invokes listeners when controller is in the continuous mode.
     * @param {GamepadState} lastState
     * @param {Gamepad} gamepad
     * @private
     */
    GamepadController.prototype._triggerContinuousEvents = function (lastState, gamepad) {
        this._updateButtons(gamepad);
        this._updateAxes(gamepad);
        this._updateLastState(gamepad, lastState.updateMode);
    };

    /**
     * Updates axes states, applying rules for discrete mode
     * @param {Gamepad} gamepad
     * @private
     */
    GamepadController.prototype._updateAxesDiscrete = function (gamepad) {
        var currentStateAxes = gamepad.axes;
        for (var i = 0; i < currentStateAxes.length; i++) {
            if (Math.abs(currentStateAxes[i]) < GamepadController.minAxisValueInDiscreteMode) {
                // If gamepad movement is subtle along this axis then proceed to the next.
                continue;
            }

            this.onAxisDiscreteStateChanged(currentStateAxes[i], i, gamepad.id);
        }
    };

    /**
     * Invokes listeners when controller is in the discrete mode.
     * @param {GamepadState} lastState
     * @param {Gamepad} gamepad
     * @private
     */
    GamepadController.prototype._triggerDiscreteEvents = function (lastState, gamepad) {
        if (lastState.updateMode.continuous) {
            throw Error('Called discrete update in continuous mode');
        }

        if (Date.now() < lastState.lastUpdateTimestamp + GamepadController.updateDelayInMs) {
            return;
        }

        this._updateButtons(gamepad);
        this._updateAxesDiscrete(gamepad);
        this._updateLastState(gamepad, lastState.updateMode);
    };

    /**
     * Main method. It's invoked every time gamepad state changes.
     * @param {Gamepad} gamepad
     * @private
     */
    GamepadController.prototype._updateGamepad = function (gamepad) {
        var lastState = this._gamepadLastStates[gamepad.id];
        if (lastState.updateMode.continuous) {
            this._triggerContinuousEvents(lastState, gamepad);
        } else {
            this._triggerDiscreteEvents(lastState, gamepad);
        }
    };

    /**
     * This method is invoked when a gamepad is connected.
     * @param {Gamepad} gamepad
     * @param {object} updateMode
     * @private
     */
    GamepadController.prototype._addGamepad = function (gamepad, updateMode) {
        this._updateLastState(gamepad, updateMode);
        this.onGamepadConnected(gamepad);
    };

    /**
     * This method is invoked when a gamepad is disconnected.
     * @param {Gamepad} gamepad
     * @private
     */
    GamepadController.prototype._removeGamepad = function (gamepad) {
        delete this._gamepadLastStates[gamepad.id]; // One may argue that delete operation is slow.
        this.onGamepadDisconnected(gamepad);
    };

    return GamepadController;
});
