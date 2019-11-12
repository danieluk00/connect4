In this game, two players take turns inserting counters which drop to the bottom of the board. The aim is to make a line of four counters of the same colour in any direction.

You can find the game at https://danieluk00.github.io/connect4/

MAIN GRID

The game works from an array of arrays: [rows][columns]. To start with, every spot in the array is marked 'Blank', except the lowest empty spot in each column which is marked 'Free' to indicate a move can be played there. As counters are played and the game progresses, the spots are marked as 'Red' or 'Yellow', and the 'Free' spot in each column is moved higher as new moves are now possible higher up the board.

HIERARCHY OF MOVES

The computer player (yellow) in this version of the game works by having a hierarchy of moves it considers:

1. It first looks for a line of 3 yellow counters and a free spot (which would give a computer win). It looks for this vertically, horizontally and diagonally up and down.

2. If that can't be found after iterating through each column, it then looks for a line of 3 red counters and a free spot (to block a red win).

3. Then moves which will 'snooker' the opponent, i.e. enable a win in two different places the following turn.

4. Then 2 counters and a free spot together etc.

5. If all else fails, it picks a random column to play.

COLUMNS TO AVOID

Each turn the computer also populates an array with columns to avoid. These are columns where a computer (yellow) move would enable the player (red) to win the following turn.

If one of the hierarchy of the moves considered matches a column in this array, then the move is ignored... unless the move would give a yellow win or block a red win immediately - then it is still worth playing.

COMPUTER ABILITY LEVEL

You have the option to set the ability of the computer player (from weak to strong).

Each turn the computer generates a random number up to 100. This number is weighted so the stronger the computer, the more likely the number will be close to 100.

For each of the moves in the hierarchy, the computer player will only consider the move if the random number is above a threshold. e.g. A weak computer player will have an 80% chance of considering a horizontal or vertical line of 3 yellow counters and a free spot for a win, or a 50% chance of blocking a diagonal red win.

TWO PLAYER AND ONLINE MODES

The game can also be played by two players on one computer, or remotely over the internet. The latter writes the moves to a Firebase database and uses a randomly generated 'host code' as the identifier for the game.

OTHER BITS

There are a few additional option (e.g. which colour starts and the board style) which are persisted for future sessions via a cookie. The animations are a cool Bootstrap library found at daneden.github.io/animate.css/.
