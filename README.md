# Formic Functions - Ant Queen of the Hill contest

This is the code behind the JavaScript programming contest hosted on Programming Puzzles & Code Golf Stack Exchange.

## [View/enter the contest here.](https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest)

![dance floor ant GIF](https://i.stack.imgur.com/7xiOD.gif)

<sup>Not actual game footage.</sup>

Each player starts with one ant - a queen, who collects food. Each piece of food can be held or used to produce a worker. Workers also collect food to be brought back to the queen.

All players compete in one arena. The winner is the queen holding the most food after she has taken 30,000 turns. The catch is that the ants can only communicate by changing the colors of the arena squares, which may also be changed by rival ants...

## Leaderboard

After 512 games (over 24 hours) a unique 1st place has emerged. These results are based on the players as they were at 21:42 UTC Sunday 29<sup>th</sup> April 2018.

<table><thead><tr><th>Position<th>Player<th>Score<th>Games<th>Score per game</thead><tbody><tr><td>1<sup>st</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/136694#136694" target="_blank">Sliding Miners 6.4 - dzaima</a><td>3959<td>275<td>14.40<tr><td>2<sup>nd</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/157198#157198" target="_blank">Hyperwave - Alion</a><td>3735<td>278<td>13.44<tr><td>2<sup>nd</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/153688#153688" target="_blank">Lightspeed - Alion</a><td>3409<td>256<td>13.32<tr><td>4<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/163363#163363" target="_blank">VinceAnt - GNiklasch</a><td>3449<td>282<td>12.23<tr><td>4<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/136158#136158" target="_blank">Glider - Draco18s</a><td>3280<td>271<td>12.10<tr><td>4<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/143980#143980" target="_blank">Windmill - GNiklasch</a><td>3275<td>281<td>11.65<tr><td>7<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/138434#138434" target="_blank">Single Queen - Crispy</a><td>3386<td>309<td>10.96<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135188#135188" target="_blank">Lone Wolf - Dave</a><td>2876<td>295<td>9.75<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135104#135104" target="_blank">Romanesco Road - trichoplax</a><td>2705<td>298<td>9.08<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135984#135984" target="_blank">Vampire Mk.8 (Re-Vamped) - Dave</a><td>2369<td>288<td>8.23<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/142207#142207" target="_blank">La Reine Bleue - Some runner guy</a><td>2381<td>294<td>8.10<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135108#135108" target="_blank">Forensic Ants - Dave</a><td>2068<td>274<td>7.55<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135278#135278" target="_blank">Straighter - ppperry</a><td>2094<td>292<td>7.17<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/145980#145980" target="_blank">Hoppemaur - Pelle Lundkvist</a><td>1970<td>299<td>6.59<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135103#135103" target="_blank">Brownian Jig - trichoplax</a><td>1598<td>266<td>6.01<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135818#135818" target="_blank">Claustrophobic Queen - DLosc</a><td>1682<td>284<td>5.92<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135183#135183" target="_blank">Wildfire Mk.3 - Dave</a><td>1531<td>277<td>5.53<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/140551#140551" target="_blank">FireFlyMkII - Moogie</a><td>1618<td>296<td>5.47<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135359#135359" target="_blank">Ziggurat v3.0 - Zgarb</a><td>1376<td>287<td>4.79<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/161838#161838" target="_blank">The Formation - eaglgenes101</a><td>1139<td>270<td>4.22<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135107#135107" target="_blank">Roman Ants Mk.2 - Dave</a><td>1034<td>260<td>3.98<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135156#135156" target="_blank">Antdom Walking Artist - Frenzy Li</a><td>1191<td>304<td>3.92<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/139964#139964" target="_blank">Monorail - QuoteBeta</a><td>1077<td>291<td>3.70<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135790#135790" target="_blank">Pierce - fireflame241</a><td>1020<td>290<td>3.52<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/136022#136022" target="_blank">Explorer - ATaco</a><td>943<td>283<td>3.33<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135157#135157" target="_blank">Black Hole - Draco18s</a><td>614<td>250<td>2.46<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135271#135271" target="_blank">Medusa - PhiNotPi</a><td>497<td>286<td>1.74<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/153601#153601" target="_blank">Langton's ant - Alion</a><td>442<td>280<td>1.58<tr><td>8<sup>th</sup><td><a href="https://codegolf.stackexchange.com/questions/135102/formic-functions-ant-queen-of-the-hill-contest/135125#135125" target="_blank">Trail-eraser - ppperry</a><td>260<td>276<td>0.94</tbody></table>
  
Each game involves a randomly selected 16 players. At the end of each game, a player's score is the number of players whose queen holds less food than theirs. The average score per game is used to determine the leaderboard order. Joint places indicate that the order of players is not yet consistent between 6 subsets of the games played so far. The list of games is split into 6 subsets because this is the minimum number that will give a probability of less than 5% that a given pair of players will be assigned distinct places in the wrong order.
