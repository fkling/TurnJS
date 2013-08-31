/*jshint node: true*/
"use strict";

/**
 * Reads input from the console.
 */

var EventEmitter = require('events').EventEmitter;
var readline = require('readline');


module.exports = function(handler) {
  var i = Object.create(EventEmitter.prototype);
  EventEmitter.call(i);
  var rl;

  i.start = function() {
    rl = readline.createInterface(process.stdin, process.stdout);
    rl.setPrompt('> ');
    rl.on('line', function(line) {
      process.nextTick(function() {
        handler(line.trim()).then(function(data) {
          i.emit('turn', data.matchID, data.player, data.actions);
          rl.prompt();
        }, function(error) {
          console.log(error + '\n'); // How should incorrect input be handled?
          rl.prompt();
        });
      });
    });
    rl.prompt();
  };

  i.stop = function() {
    rl.close();
  };

  return i;
};
