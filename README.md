# FindYourHatGame
## Terminal game (maze solver)
### Description

The main goal of the game is to make your way to a hat (green square) using directional moves and not to fall down in a hole (black square)
To play the game, visit this [web-site](https://find-your-hat.onrender.com/);

* Before you start, you have to enter your name and field size. The field is always a square;
* Game features 2 levels of difficulty (Easy, Hard). It affects the percentage of holes on a field;
* Game has random field generator, if game restarts it generates new field of the same size and difficulty automatically;
* Field generator uses depth first search algorithm to make sure the field is actually beatable;



## Upadate v1.2

* Added help button with the legend;
* Fixes;
* Added multiplayer;
* Now you can move with the keyboard;

### Multiplayer

The game now features a multiplayer. To play with your friend, hit the multiplayer button, that will create your private room. Copy the page link and send it to your friend. As soon as your opponent connects the game starts.

Multiplayer updates:

* Chat with your opponent;
* Scoring system. If a player fails (falls down, for instance) the round goes to the opponent automatically;
* After the round ends, both players receive a message from the server with the game update. The Winner can restart a launch a new round;

Every pair of players can play in a separate room. If a room doesn't exist, you can't join it, instead new room will be created.
Only two players can play, so it's the Duel type game. However, your game can be watched by the others in real time (Observer mode is still experimental. You may encounter some inconsistencies).

## Upadate v1.3

* Upgraded singleplayer mode
* Added scoring system
* Now you can play against AI on different difficulty levels
* UI fixes
* Different difficulty levels features different search algorithms for AI, including depth first search and A* star
* Added mobile support