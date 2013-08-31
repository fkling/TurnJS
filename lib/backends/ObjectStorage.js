/*jshint node:true */
"use strict";

/**
 * A simple match store
 */

var Q = require('q');

var storage = {};

var storage = {
  getMatch: function(id) {
    return Q.fcall(function() {
        var match = storage[id];
        if (!match) {
          throw new Error();
        }
        return JSON.parse(JSON.stringify(match)); // create copy
    });
  },

  saveMatch: function(match) {
    storage[match.id] = match;
    return Q.fcall(function() {
      return match;
    });
  }
};

module.exports = storage;
