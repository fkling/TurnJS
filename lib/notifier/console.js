/*jshint node: true*/
"use strict";

/**
 * Prints notification on the console.
 */

module.exports = function(convert) {

  return function(match, users, msg) {
    return convert(match, users, msg).then(function(msg) {
      console.log(msg);
    }, function(reason) {
      return reason;
    });
  };

};
