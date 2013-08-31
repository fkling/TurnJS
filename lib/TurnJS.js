/*jshint node: true*/
"use strict";

var EventEmitter = require('events').EventEmitter;
var uuid = require('node-uuid');

var backend_, notifiers_ = [], interfaces_ = [];

var TurnJS = Object.create(EventEmitter.prototype);
EventEmitter.call(TurnJS);


/**
 * Choose backend to store the matches in. Has to comply with backend interface.
 */
TurnJS.setBackend = function(backend) {
  backend_ = backend;
};


/**
 * Adds a function to be called whenever users have to be notified of match 
 * changes.
 *
 * The notifier gets passed three arguments: 
 *   - The match object
 *   - An array of users. Each user must be notified
 *   - A message.
 *
 * Notifiers are executed in the order the are added. If any of the function
 * returns `true`, the remaining notifiers won't be called.
 *
 * @param {function} notifier
 */
TurnJS.addNotifier = function(notifier) {
  notifiers_.push(notifier);
};


/**
 * Adds interfaces for users inputs. An interface must implement the EventEmitter 
 * interface and emit the event "turn" upon receiving user input. It must pass
 * three arguments to the event listeners:
 *
 *   - The match ID
 *   - The ID of the player who made the turn
 *   - An array of actions.
 *
 * Interfaces encapsulate the logic of waiting for user input and converting it
 * to data understood by the implementation.
 *
 * @param {EventEmitter} handler
 */
TurnJS.addInterface = function(handler) {
  handler.on('turn', function(matchID, playerID, actions) {
    this.emit('turn', matchID, playerID, actions);
  }.bind(this));
  interfaces_.push(handler);
};


/**
 * Notifies each user in users.
 */
TurnJS.notify = function(match, users, msg) {
  // Iterate over notifiers and stop after the first one that handles the 
  // notification
  return notify(match, users, msg);
};


TurnJS.createMatch = function(data) {
  data.id = uuid.v4(); // generate unique IDs
  return backend_.saveMatch(data);
};


TurnJS.getMatch = function(matchID) {
  return backend_.getMatch(matchID);
};


TurnJS.saveMatch = function(match) {
  return backend_.saveMatch(match);
};

module.exports = TurnJS;


/* Helper functions */

function notify(match, users, msg, index) {
  index = index || 0;
 return  notifiers_[index](match, users, msg).then(null, function() {
      // notification was not handled
      if (index < notifiers_.length - 1) {
        return notify(match, users, index + 1);
      }
  });
}
