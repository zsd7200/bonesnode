# [bonesnode](https://bonesgame.herokuapp.com/)
Bones dice game, this time running on Node.

## Rules
- A player must get a score of 1000 or higher for their first roll to be counted.

- One and five are the only dice worth points on their own. A one is worth 100 points, and a five is worth 50 points.
  - One and five are the only dice that a player can keep before rolling more, unless there are three of the same number.

- Three of the same number is worth that number multiplied by 100. For example, three dice showing four is worth 400 points, despite the four having no value on its own.
  - Three dice showing 1 is worth 1000 points.
  - Four dice showing the same number follows a similar rule. For every extra die, you multiply the score from that roll by two. For example, if four dice are showing four, that is worth 800 points. If five dice are showing four, that is worth 1600 points.

- If there are no valid dice selected when your turn is ended, you will go back 100 points.
  - Going below 1000 points results in a score of 0, meaning the player will have to start over.

- If a player uses all 6 dice on their turn, they must roll all 6 dice again.
  - If a player rolls 1, 2, 3, 4, 5, and 6 in one roll, that is worth 1000, and that player's turn immediately comes to an end. This is the only exception to the rolling again rule.

- If a player goes above 10000 points, the other players are given one turn to attempt to beat that score. If another player goes over 10000 during this "redemption phase", this player becomes the winner. The other players who have not taken their "redemption" turn now have to attempt to beat this player.
