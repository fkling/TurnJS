# TurnJS

TurnJS is a JavaScript library which provides a framework for turn based
computer games.

## Terminology

- Match: A match is a specific instance of a game which is played by two or more
  players. A match is identifier by a *match ID*.

- Player: A player is a user participating in a match. A player must be
  identifiable by a unique ID.

- Turn: A turn is a series of actions of a player that changes the match state.
  This usually means a progression in the game towards the end state.

- State: A state describes a specific situation of the match. Usually each turn
  changes the state of a match. The *start state* is the initial state of the
  match, before any player made a move. The *end state* is the final state of
  the match, after which there is no valid move anymore. Either one player
  *wins* the match or there is a *tie*.


## Purpose of the library

The library provides the components to manage turn based games. In particular it 
will

- Store and retrieve match turns.
- Provide various interfaces to accept a player's turns (e.g. programatically,
  email, web, etc.).
- Notify users about the match state and their turn, depending on their
  availability and preferences.

Those features will be explained in more detail in the following sections.


### Manage match turns

A match is a document and each turn creates a new version of the document. Thus
document-oriented DBs such as CouchDB are perfectly suitable backends. Each
document MUST contain the following information:

- players: A list of player information. This data MUST contain information to 
  uniquly identify the player. The data CAN also contain game or match specific 
  information.
- actions: A list of game-specific actions executed by a player in this turn. 
  In its simplest form there would only be one action, e.g. the positioning of
  a piece (for chess encoded with the 
  [chess notation](http://en.wikipedia.org/wiki/Chess_notation). In a card game
  there might be multiple actions, e.g. the first one being the draw of a card
  from the deck and then playing a card from your hand.  
  See section **actions** for more information.

The document CAN contain further game or match specific information. For
example:

- timestamp: The date and time when the document/revision was created (i.e. when
  the turn was made).
- state: A game-specific representation of the match's state. E.g. the positions
  of moved pieces in chess. Even though the current match state can be recreated
  by replaying every turn, keeping an explicit representation of the state can
  acceralte this process.


### Interfaces for turns

TurnJS focuses on making it simple to provide multiple interfaces to submit a
player's turn. Some interfaces are very game-specific, such as a GUI, but others
are more generic and only differ in the content that has to be transmitted.

The most generic interface is the library's API. This allows game 
implementations to use any means to record a player's turn they see fit. This 
API allows implementations to

- Create a new match
- Record actions


Other interfaces are provided as components:

- REST
- Email

A game implementation has to provide callbacks which parse the content of a
message received via such an interface and convert it to an action.


### Notify users

Whenever a turn ends, the other player(s) must be notified about this event and
must be told whose turn it is next. *How* a player is notified depends on the
player's preferred way of contact.

If we assume that the primary interface for playing a game is a website, then
the first choice of notifying a player about their opponent's move is to show a
message on the website and execute the opponent's move.  
To handle this situation, the library triggers an event when a turn was
completed. Whenever a user logs in, the game implementation can bind an event
listener to it and notify the user instantly.

Otherwise, the other player(s) could be notified via other services, if they
provided the necessary information. Other services available are:

- Email

The game implementation has to provide callbacks to generate the content of the
messages.


## Technology

The library is implemented in JavaScipt/Node.js.
