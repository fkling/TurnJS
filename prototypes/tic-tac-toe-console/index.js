/*jshint node: true*/
"use strict";

var readline = require('readline');
var Q = require('q');

var TurnJS = require('../../lib/TurnJS');
var object_storage = require('../../lib/backends/ObjectStorage');
var console_interface = require('../../lib/interfaces/console');
var console_notify = require('../../lib/notifier/console');

var lastPlayer;
var matchID;

/**
 * Convert match state to ASCII and creates message for next player
 */
function match2ascii(match, users, msg) {
  var out = '';
  if (lastPlayer && !msg) {
    out += lastPlayer + ' made their move. Result: \n\n';
  }
  out += '   1 2 3 \n';
  out += '  |-----|\n';
  out += ' A|' + match.state[0].join('|') + '|\n';
  out += '  |-----|\n';
  out += ' B|' + match.state[1].join('|') + '|\n';
  out += '  |-----|\n';
  out += ' C|' + match.state[2].join('|') + '|\n';
  out += '  |-----|\n\n';


  out += msg ? msg :
    ('Player ' + (lastPlayer !== player1 ? player1 : player2) + ', your move!\n');


  return Q.fcall(function() {
    return out;
  });
}

/**
 * Convert user input to game moves.
 */
function ascii2actions(line) {
  line = line.toLowerCase();
  return Q.fcall(function() {
    try {
      var row = /[a-z]/.exec(line)[0];
      var column = +/\d/.exec(line)[0];
      return {
        matchID: matchID,
        player: lastPlayer !== player1 ? player1 : player2,
        actions: [['move', [row, column]]]
      };
    }
    catch(ex) {
      throw new Error('Invalid move! Use e.g. "a2" or "2a".');
    }
  });
}

/**
 * Tests whether the finished state is reached
 */
function finished(match) {
  var rows = match.state;
  var result = false;
  // rows
  result = rows.some(function(row) {
    return row[0] !== ' ' && row[0] === row [1] && row[1] === row[2];
  });
  // columns
  result = result || [0,1,2].some(function(i) {
    return rows[0][i] !== ' ' && rows[0][i] === rows[1][i] &&
      rows[1][i] === rows[2][i];
  });
  // diagonals
  if (!result && (rows[0][0] !== ' ' && rows[0][0] === rows[1][1] && rows[1][1] === rows[2][2] ||
      rows[0][2] !== ' ' && rows[0][2] === rows[1][1] && rows[1][1] === rows[2][0])) {
    result = true;
  }
  else if (!result &&
     rows.every(function(row) { return row.every(function(v) { return v !== ' '; }); })) {
    // all cells are full
      result = true;
  }
  return result;
}


var input = console_interface(ascii2actions);

TurnJS.setBackend(object_storage);
TurnJS.addNotifier(console_notify(match2ascii));
TurnJS.addInterface(input);

TurnJS.on('turn', function(matchID, playerID, actions) {
  TurnJS.getMatch(matchID).then(function(match) {
    var move = actions[0][1];
    var row = {a:0, b:1, c:2}[move[0]];
    var column = move[1] - 1;

    try {
      var cell = match.state[row][column];
      if (cell !== ' ') {
        throw new Error('Cell is already occupied');
      }
      else {
        match.state[row][column] = playerID === player1 ? 'X' : 'O';
        match.actions = actions;
        lastPlayer = playerID;
      }

      TurnJS.saveMatch(match).then(function() {
        if (finished(match)) {
          input.stop();
          TurnJS.notify(match, [player1, player2], 'Game over!').then(function() {
            process.exit(0);
          });
        }
        else {
          TurnJS.notify(match, [playerID === player1 ? player2 : player1]);
        }
      });
    }
    catch(e) {
      TurnJS.notify(match, playerID, e);
    }
  }, function(e) {
      TurnJS.notify(null, playerID, e);
  });

});

var player1;
var player2;

function startMatch() {
  console.log('Game begins!');
  TurnJS.createMatch({
    users: [player1, player2],
    state: [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']]
  }).then(function(match) {
    matchID = match.id;
    TurnJS.notify(match, [player1]).then(function() {
      input.start();
    });
  });
}


var rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt('Player 1: '); 
rl.on('line', function handler(line) {
  line = line.trim();
  if (!player1 && line) {
    player1 = line + '(X)';
    rl.setPrompt('Player 2: ');
    rl.prompt();
  }
  else if(player1 && !player2 && line) {
    rl.close();
    player2 = line + '(o)';
    startMatch();
  }
});
rl.prompt();
