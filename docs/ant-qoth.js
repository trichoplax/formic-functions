// Many thanks to Helka Homba for these posts, which provided the idea of a Stack Snippets KotH and heavily informed this code.
// Red vs. Blue - Pixel Team Battlebots: https://codegolf.stackexchange.com/q/48353/20283
// Block Building Bot Flocks: https://codegolf.stackexchange.com/q/50690/20283

/* SETUP */

$(load)

function load() {
	setGlobals()
	loadPlayers()
	initialiseInterface()
}

function setGlobals() {
	qid = 50690
	site = 'codegolf'
	players = []
	gameStats = []
	leaderboardInfo = []
	population = []
	delay = 150
	debug = $('#debug').prop('checked')
	currentAntIndex = 0
	maxPlayers = 16
	display = true
	zoomed = false
	zoomLocked = false
	continuousMoves = true
	singleAntStep = false
	gameInProgress = false
	ongoingTournament = false
	currentGameInfo = []
	zoomedAreaCentreX = 0
	zoomedAreaCentreY = 0
	zoomOnLeft = true
	timeoutID = 0
	permittedTime = 5
	noMove = {cell: 4, colour: 0, workerType: 0}
	arenaWidth = 2500
	arenaHeight = 1000
	arenaArea = arenaWidth * arenaHeight
	arena = new Array(arenaArea)
	for (var i=0; i<arenaArea; i++) {
		arena[i] = {
			food: 0,
			colour: 1,
			ant: null
		}
	}
	rotator = [
		[0, 1, 2, 3, 4, 5, 6, 7, 8],
		[6, 3, 0, 7, 4, 1, 8, 5, 2],
		[8, 7, 6, 5, 4, 3, 2, 1, 0],
		[2, 5, 8, 1, 4, 7, 0, 3, 6]
	]
	neighbours = [
		{x:-1, y:-1},
		{x:0, y:-1},
		{x:1, y:-1},
		{x:-1, y:0},
		{x:1, y:0},
		{x:-1, y:1},
		{x:0, y:1},
		{x:1, y:1}
	]	
	arenaCanvas = document.createElement('canvas')
	arenaCanvas.width = arenaWidth
	arenaCanvas.height = arenaHeight
	arenaCtx = arenaCanvas.getContext('2d')
	arenaImage = arenaCtx.createImageData(arenaWidth, arenaHeight)
	for (var i=0; i<arenaCanvas.width*arenaCanvas.height; i++) {
		arenaImage.data[i*4 + 3] = 255
	}
	
	zoomCanvas = document.createElement('canvas')
	zoomCanvas.width = 1000
	zoomCanvas.height = 1000
	zoomCtx = zoomCanvas.getContext('2d')
	zoomCellsPerSide = $('#squares_per_side').val()
	zoomCellSideLength = zoomCanvas.width / zoomCellsPerSide
	zoomImage = zoomCtx.createImageData(zoomCanvas.width, zoomCanvas.height)
	for (var i=0; i<zoomCanvas.width*zoomCanvas.height; i++) {
		zoomImage.data[i*4 + 3] = 255
	}
	zoomCtx.imageSmoothingEnabled = false
	
	displayCanvas = document.getElementById('display_canvas')
	displayCanvas.width = 1250
	displayCanvas.height = 500
	displayCtx = displayCanvas.getContext('2d')
	
	arenaColour = {}
	arenaColour.food = [0, 0, 0]
	arenaColour.ant = [255, 0, 0]
	arenaColour.tile = [
		null,
		[255, 255, 255],
		[255, 255, 0],
		[255, 0, 255],
		[0, 255, 255],
		[255, 0, 0],
		[0, 255, 0],
		[0, 0, 255],
		[128, 128, 128],
		[128, 128, 0],
		[128, 0, 128],
		[0, 128, 128],
		[128, 0, 0],
		[0, 128, 0],
		[0, 0, 128],
		[128, 255, 255],
		[0, 0, 0]
	]
	
	paletteCanvas = document.createElement('canvas')
	paletteCanvas.width = 17
	paletteCanvas.height = 1
	paletteCtx = paletteCanvas.getContext('2d')
	paletteImage = paletteCtx.createImageData(paletteCanvas.width, paletteCanvas.height)
	for (var i=1; i<paletteCanvas.width; i++) {
		for (var c=0; c<3; c++) {
			paletteImage.data[i*4 + c] = arenaColour.tile[i][c]
		}
		paletteImage.data[i*4 + 3] = 255
	}
	paletteCtx.putImageData(paletteImage, 0, 0)
}

function colourPlayers() {
	patternCanvas = document.createElement('canvas')
	patternCanvas.width = 2 * players.length
	patternCanvas.height = 2
	patternCtx = patternCanvas.getContext('2d')
	random = seededRandomInitialiser(1)
	for (var player=0; player<players.length; player++) {
		var colours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
		shuffle(colours)
		for (var square=0; square<4; square++) {
			var x = player * 2 + square % 2
			var y = Math.floor(square / 2)
			var colour = colours[square]
			patternCtx.drawImage(paletteCanvas, colour, 0, 1, 1, x, y, 1, 1)			
		}
	}
}

/* HELPERS */

function maskedEval(functionBody, params) //thanks http://stackoverflow.com/a/543820 (with the warning not to use this with untrusted code)
{
    var mask = {}
    for (var i in this)
        mask[i] = undefined
    for (var i in params) {
        if (params.hasOwnProperty(i))
            mask[i] = params[i]
    }
    return (new Function('with(this) { ' + functionBody + ';}')).call(mask)
}

function decode(html) {
	return $('<textarea>').html(html).text()
}

cryptoRandom = (function() {
	var a = new Uint32Array(16384)
	var i = a.length - 1
	return function(n) {
		i = (i + 1) % a.length
		if (i === 0) {
			window.crypto.getRandomValues(a)
		}
		return a[i] % n
	}
})()

seededRandomInitialiser = function(seed) {		// thanks https://en.wikipedia.org/wiki/Xorshift
	var stateArray = new Uint32Array(1)
	stateArray[0] = seed
	return function(n) {
		stateArray[0] ^= stateArray[0] << 13
		stateArray[0] ^= stateArray[0] >> 17
		stateArray[0] ^= stateArray[0] << 5
		return stateArray[0] % n
	}
}

function shuffle(array) {
	for (var t=0; t<2; t++) {	// Shuffle twice to disguise bias in the random number generator
		for (var i=0; i<array.length; i++) {
			var target = random(array.length - i) + i
			var temp = array[i]
			array[i] = array[target]
			array[target] = temp
		}
	}
}

/* INTERFACE */

function initialiseInterface() {
	$('document').keypress(function(event) {
		if ((String.fromCharCode(event.which)).toUpperCase() == 'S') {
			if (display) {
				step()
			}
		} else if ((String.fromCharCode(event.which)).toUpperCase() == 'A') {
			if (display) {
				stepAnt()
			}
		}
	})
	$('#run_single_game').click(function() {
		ongoingTournament = false
		$('#run_single_game').html('<h2>Running single game</h2>')
		$('#run_single_game').prop('disabled', true)
		$('#run_ongoing_tournament').html('<h2>Run ongoing tournament</h2>')
		$('#run_ongoing_tournament').prop('disabled', false)
		$('#no_display').prop('disabled', false)
		if (continuousMoves) {
			$('#play').prop('disabled', true)
			$('#pause').prop('disabled', false)
		} else {
			$('#play').prop('disabled', false)
			$('#pause').prop('disabled', true)
		}
		$('#step').prop('disabled', false)
		$('#step_ant').prop('disabled', false)
		$('#abandon_game').prop('disabled', false)
		$('#reset_leaderboard').prop('disabled', false)
		if (!gameInProgress) {
			startNewGame()
		}		
	})
	$('#run_ongoing_tournament').click(function() {
		ongoingTournament = true
		$('#run_single_game').html('<h2>Run single game</h2>')
		$('#run_single_game').prop('disabled', false)
		$('#run_ongoing_tournament').html('<h2>Running ongoing tournament</h2>')
		$('#run_ongoing_tournament').prop('disabled', true)
		$('#no_display').prop('disabled', false)
		if (continuousMoves) {
			$('#play').prop('disabled', true)
			$('#pause').prop('disabled', false)
		} else {
			$('#play').prop('disabled', false)
			$('#pause').prop('disabled', true)
		}
		$('#step').prop('disabled', false)
		$('#step_ant').prop('disabled', false)
		$('#abandon_game').prop('disabled', false)
		$('#reset_leaderboard').prop('disabled', false)
		if (!gameInProgress) {
			startNewGame()
		}
	})
	$('#no_display').prop('disabled', true)
	$('#no_display').click(function() {
		$('#top_hidden_area').hide(300)
		$('#bottom_hidden_area').hide(300)
		$('#abandon_game').hide(300)
		$('#reset_leaderboard').hide(300)
		$('#restore_display').show(300)
		display = false
		continuousMoves = true
	})
	$('#delay').val(delay)
	$('#delay').change(function() {
		delay = $('#delay').val()
	})
	$('#play').prop('disabled', true)
	$('#play').click(function() {
		continuousMoves = true
		$('#play').prop('disabled', true)
		$('#pause').prop('disabled', false)
		clearTimeout(timeoutID)
		processCurrentAnt()			
	})
	$('#pause').prop('disabled', true)
	$('#pause').click(function() {
		continuousMoves = false
		$('#play').prop('disabled', false)
		$('#pause').prop('disabled', true)
		clearTimeout(timeoutID)			
	})
	$('#step').prop('disabled', true)
	$('#step').click(function() {
		step()
	})
	$('#step_ant').prop('disabled', true)
	$('#step_ant').click(function() {
		stepAnt()
	})
	$('#max_players').val(maxPlayers)
	$('#max_players').change(function() {
		maxPlayers = $('#max_players').val()
	})
	$('#fit_canvas').click(function() {
		displayCanvas.style.borderLeft = 'none'
		displayCanvas.style.borderRight = 'none'
		displayCanvas.width = document.body.clientWidth
		displayCanvas.height = displayCanvas.width * 500/1250
		$('#new_challenger_text').width(Math.min(1250, displayCanvas.width - 20))
		displayArena()
	})
	$('#display_canvas').mousemove(function(event) {
		if (!zoomLocked) {
			zoomed = true
			zoomedAreaCentreX = event.offsetX * arenaWidth / displayCanvas.width
			zoomedAreaCentreY = event.offsetY * arenaHeight / displayCanvas.height
			if (zoomedAreaCentreX < (arenaWidth + 2*arenaHeight) / 4) {
				zoomOnLeft = false
			} else if (zoomedAreaCentreX > (3*arenaWidth - 2*arenaHeight) / 4) {
				zoomOnLeft = true
			}
			fillZoomCanvas()
			displayArena()
		}
	})
	$('#display_canvas').mouseleave(function() {
		if (!zoomLocked) {
			zoomed = false
			displayArena()
		}
	})
	$('#display_canvas').click(function() {
		zoomLocked = !zoomLocked
	})
	$('#restore_display').hide()
	$('#restore_display').click(function() {
		$('#restore_display').hide(300)
		$('#top_hidden_area').show(300)
		$('#bottom_hidden_area').show(300)
		$('#abandon_game').show(300)
		$('#reset_leaderboard').show(300)
	})
	$('#abandon_game').prop('disabled', true)
	$('#abandon_game').click(function() {
		if (ongoingTournament) {
			startNewGame()
		} else {
			$('#completed_moves_area').html('0 moves of 10000 completed')
			$('#current_game_body').html('')
			$('#run_single_game').prop('disabled', false)
			$('#no_display').prop('disabled', true)
			$('#play').prop('disabled', true)
			$('#pause').prop('disabled', true)
			$('#step').prop('disabled', true)
			$('#step_ant').prop('disabled', true)
			$('#abandon_game').prop('disabled', true)
		}		
	})
	$('#reset_leaderboard').prop('disabled', true)
	$('#reset_leaderboard').click(function() {
		$('#reset_leaderboard').prop('disabled', true)
		leaderboardInfo = []
		initialiseLeaderboard()
	})
	$('#permitted_time_override').val(permittedTime)
	$('#permitted_time_override').change(function() {
		permittedTime = $('#permitted_time_override').val()
	})
	$('#debug').change(function() {
		debug = $('#debug').prop('checked')
	})
	$('#seeded_random').prop('checked', false)
	$('#seeded_random').change(function() {
		$('#seed').prop('disabled', !$('#seeded_random').prop('checked'))
	})
	$('#seed').prop('disabled', true)
	$('#new_challenger_text').change(function() {})
	$('#squares_per_side').change(function() {
		zoomCellsPerSide = $('#squares_per_side').val()
		zoomCellSideLength = zoomCanvas.width / zoomCellsPerSide
		if (zoomed) {
			fillZoomCanvas()
			displayZoomedArea()
		}
	})
}

function showLoadedTime() {
	$('#loaded_at').html('<i>Players loaded from contest post</i> ' + (new Date()).toString())
}

function displayGameTable() {
	var content = ''
	gameStats.forEach(function(row) {
		content += '<tr><td>' + row['title'] + '</td><td>' + row['type1'] +
			'</td><td>' + row['type2'] + '</td><td>' + row['type3'] +
			'</td><td>' + row['type4'] + '</td><td>' + row['food'] +
			'</td></tr>'
	})
	$('#current_game_body').html(content)
}

function initialiseLeaderboard() {
	players.forEach(function(player) {
		var row = {
			id: player['id'],
			position: 1,
			title: player['title'],
			score: 0,
			confidence: 0,
			included: player['included']
		}
		leaderboardInfo.push(row)
	})
	displayLeaderboard()
}

function displayLeaderboard() {
	var	content = ''
	leaderboardInfo.forEach(function(row) {
		var checkboxId = 'included_' + row['id']
		content += '<tr>'
		content += '<td>'
		content += row['position']
		content += '</td>'
		content += '<td>'
		content += row['title']
		content += '</td>'
		content += '<td>'
		content += row['score']
		content += '</td>'
		content += '<td>'
		content += row['confidence']
		content += '</td>'
		content += '<td>'
		content += '<input id=' + checkboxId + ' type=checkbox>'
		content += '</td>'
		content += '</tr>'
	})
	$('#leaderboard_body').html(content)
	leaderboardInfo.forEach(function(row) {
		var id = row['id']
		var checkboxId = '#included_' + id
		$(checkboxId).prop('checked', row['included'])
		var player = players[players.findIndex(function(player){
			return player['id'] === id
		})]
		$(checkboxId).change(function() {
			player['included'] = $(checkboxId).prop('checked')
		})
	})	
}

function fillArenaCanvas() {
	for (y=0; y<arenaHeight; y++) {
		for (x=0; x<arenaWidth; x++) {
			var cell = arena[x + y*arenaWidth]
			if (cell.food) {
				for (var i=0; i<3; i++) {
					arenaImage.data[(x + y*arenaWidth) * 4 + i] = arenaColour.food[i]
				}
			} else if (cell.ant) {
				for (var i=0; i<3; i++) {
					arenaImage.data[(x + y*arenaWidth) * 4 + i] = arenaColour.ant[i]
				}			
			} else {
				for (var i=0; i<3; i++) {
					arenaImage.data[(x + y*arenaWidth) * 4 + i] = arenaColour.tile[cell.colour][i]
				}			
			}
			arenaImage.data[(x + y*arenaWidth) * 4]
		}
	}
	arenaCtx.putImageData(arenaImage, 0, 0)
}

function fillZoomCanvas() {
	var left = Math.floor((zoomedAreaCentreX - zoomCellsPerSide/2 + arenaWidth) % arenaWidth)
	var top = Math.floor((zoomedAreaCentreY - zoomCellsPerSide/2 + arenaHeight) % arenaHeight)
	for (var y=0; y<zoomCellsPerSide; y++) {
		wrappedY = (y + top) % arenaHeight
		for (var x=0; x<zoomCellsPerSide; x++) {
			wrappedX = (x + left) % arenaWidth
			var cell = arena[wrappedX + wrappedY*arenaWidth]
			paintTile(x, y, cell.colour)
			if (cell.food || (cell.ant && cell.ant.type < 5 && cell.ant.food)) {
				paintFood(x, y)
			}
			if (cell.ant) {
				paintAnt(x, y, cell.ant)
			}
		}
	}
}

function paintTile(x, y, colour) {
	zoomCtx.drawImage(paletteCanvas, colour, 0, 1, 1, x * zoomCellSideLength, y * zoomCellSideLength, zoomCellSideLength, zoomCellSideLength) 
}

function paintFood(x, y) {
	zoomCtx.fillStyle = 'rgb(0, 0, 0)'
	zoomCtx.beginPath()
	zoomCtx.moveTo((x+1) * zoomCellSideLength, y * zoomCellSideLength + zoomCellSideLength/2)
	zoomCtx.lineTo(x * zoomCellSideLength + zoomCellSideLength/2, y * zoomCellSideLength)
	zoomCtx.lineTo(x * zoomCellSideLength, y * zoomCellSideLength + zoomCellSideLength/2)
	zoomCtx.lineTo(x * zoomCellSideLength + zoomCellSideLength/2, (y+1) * zoomCellSideLength)
	zoomCtx.fill()
}

function paintAnt(x, y, ant) {
	if (ant.type === 5) {
		var size = zoomCellSideLength * .3
	} else {
		var size = zoomCellSideLength * .2
	}
	zoomCtx.drawImage(patternCanvas, ant.player.colourIndex*2, 0, 2, 2, (x+0.5)*zoomCellSideLength - size, (y+0.5)*zoomCellSideLength - size, size*2, size*2)
}

function displayArena() {
	displayCtx.drawImage(arenaCanvas, 0, 0, arenaWidth, arenaHeight, 0, 0, displayCanvas.width, displayCanvas.height)
	if (zoomed) {
		displayZoomedArea()
	}
}

function displayZoomedArea() {
	if (zoomOnLeft) {
		displayCtx.drawImage(zoomCanvas, 0, 0, zoomCanvas.width, zoomCanvas.height, 0, 0, displayCanvas.height, displayCanvas.height)
	} else {
		displayCtx.drawImage(zoomCanvas, 0, 0, zoomCanvas.width, zoomCanvas.height, displayCanvas.width - displayCanvas.height, 0, displayCanvas.height, displayCanvas.height)		
	}
}

/* GAMEPLAY */

function startNewGame() {
	if ($('#seeded_random').prop('checked')) {
		random = seededRandomInitialiser($('#seed').val())
	} else {
		random = cryptoRandom
	}
	for (var i=0; i<arenaWidth; i++) {
		arena[i].food = 1
		arena[i].colour = 1
		arena[i].ant = null
	}
	for (var i=arenaWidth; i<arenaArea; i++) {
		arena[i].food = 0
		arena[i].colour = 1
		arena[i].ant = null
	}
	shuffle(arena)
	var includedPlayers = []
	players.forEach(function(player) {
		if (player['included']) {
			includedPlayers.push(player)
			if (player.id === 0) {
				player.code = $('#new_challenger_text').val()
			}
		}
	})
	var numberOfPlayers = Math.min(includedPlayers.length, maxPlayers)
	for (i=0; i<numberOfPlayers; i++) {
		var r = random(numberOfPlayers)
		var temp = includedPlayers[i]
		includedPlayers[i] = includedPlayers[r]
		includedPlayers[r] = temp
	}
	var playersThisGame = includedPlayers.slice(0, numberOfPlayers)
	gameStats = []
	playersThisGame.forEach(function(player) {
		player.time = 0
		player.permittedTime = 0
		while (true) {
			var x = random(arenaWidth)
			var y = random(arenaHeight)
			if (arena[x + y*arenaWidth].ant === null && arena[x + y*arenaWidth].food === 0) {
				var ant = {
					player: player,
					type: 5,
					food: 0,
					x: x,
					y: y
				}
				arena[x + y*arenaWidth].ant = ant
				population.push(ant)
				break
			}
		}
		var row = {
			id: player.id,
			title: player.title,
			type1: 0,
			type2: 0,
			type3: 0,
			type4: 0,
			food: 0
		}
		gameStats.push(row)
	})
	currentAntIndex = population.length
	fillArenaCanvas()
	if (zoomed) {
		fillZoomCanvas()
	}
	displayGameTable()
	clearTimeout(timeoutID)
	timeoutID = setTimeout(prepareForNextAnt, 0)
}

function processCurrentAnt() {
	var currentAnt = population[currentAntIndex]	
	var unrotatedView = nineVisibleSquares(currentAnt)	
	var rotation = random(4)
	var rotatedView = []
	for (i=0; i<9; i++) {
		rotatedView.push(unrotatedView[rotator[rotation][i]])
	}
	var response = getMove(currentAnt, rotatedView)
	if (debug) {
		console.log('Rotated view: ' + rotatedView)
		console.log('Unrotated view: ' + unrotatedView)
		console.log('Response: ' + response)
	}
	var targetCell = rotator[rotation][response.cell]
	var x = (currentAnt.x + targetCell%3 - 1 + arenaWidth) % arenaWidth
	var y = (currentAnt.y + Math.floor(targetCell/3) - 1 + arenaHeight) % arenaHeight
	if (response.colour) {
		if (response.workerType) {
			console.log('Not permitted: Both colour and worker type specified.')
		} else {
			setColour(x, y, response.colour)
		}
	} else {
		if (response.workerType) {
			makeWorker(x, y, response.workerType, currentAnt)
		} else {
			moveAnt(x, y, currentAnt)
		}
	}		
	passFood(currentAnt)	
	prepareForNextAnt()
}

function setColour(x, y, colour) {
	arena[x + y*arenaWidth].colour = colour
}

function makeWorker(x, y, workerType, parent) {
	var birthCell = arena[x + y*arenaWidth]
	if (parent.type === 5) {
		if (parent.food > 0) {
			if (!birthCell.food) {
				if (!birthCell.ant) {
					var newAnt = {
						player: parent.player,
						type: workerType,
						food: 0,
						x: x,
						y: y
					}
					birthCell.ant = newAnt
					parent.food--
					var id = parent.player.id
					gameStats.forEach(function(row) {
						if (row.id === id) {
							var type = 'type' + workerType
							row[type]++
							row['food']--
						}
					})
					displayGameTable()
				}				
			}
		}
	}
}

function moveAnt(x, y, ant) {
	var departureCell = arena[ant.x + ant.y*arenaWidth]
	var destinationCell = arena[x + y*arenaWidth]
	if (!destinationCell.ant) {
		if (destinationCell.food && ant.type < 5 && ant.food) {
			if (debug) {
				console.log('Error: a laden worker cannot move onto food.')
			}
		} else {			
			destinationCell.ant = ant
			departureCell.ant = null
			ant.x = x
			ant.y = y
			if (destinationCell.food) {
				destinationCell.food = 0
				ant.food++
				if (ant.type === 5) {
					var id = ant.player.id
					gameStats.forEach(function(row) {
						if (row.id === id) {
							row['food']++
						}
					})
					displayGameTable()					
				}
			}
		}
	}
}

function passFood(ant) {
	if (ant.type === 5) {
		for (var i=0; i<neighbours.length; i++) {
			var x = (ant.x + neighbours[i].x + arenaWidth) % arenaWidth
			var y = (ant.y + neighbours[i].y + arenaHeight) % arenaHeight
			var cell = arena[x + y*arenaWidth]
			var candidate = cell.ant
			if (candidate && candidate.type < 5 && candidate.food) {
				candidate.food = 0
				ant.food++
				var id = ant.player.id
				gameStats.forEach(function(row) {
					if (row.id === id) {
						row['food']++
					}
				})
				displayGameTable()
			}
		}
	} else {
		if (ant.food) {
			var cells = neighbours.slice()
			shuffle(cells)
			for (var i=0; i<cells.length; i++) {
				var x = (ant.x + cells[i].x + arenaWidth) % arenaWidth
				var y = (ant.y + cells[i].y + arenaHeight) % arenaHeight
				var cell = arena[x + y*arenaWidth]
				var candidate = cell.ant
				if (candidate && candidate.type === 5) {
					ant.food = 0
					candidate.food++
					var id = candidate.player.id
					gameStats.forEach(function(row) {
						if (row.id === id) {
							row['food']++
						}
					})
					displayGameTable()
					return
				}
			}
		}
	}
}

function prepareForNextAnt() {
	currentAntIndex = (currentAntIndex + 1) % population.length
	if (display) {
		if (continuousMoves) {
			if (currentAntIndex === 0) {
				timeoutID = setTimeout(processCurrentAnt, delay)
				displayArena()
			} else {
				timeoutID = setTimeout(processCurrentAnt, 0)
			}
		} else {
			if (singleAntStep) {
				if (zoomed && !visible(currentAntIndex)) {
					timeoutID = setTimeout(processCurrentAnt, 0)
				} else {
					displayArena()
				}
			} else {
				if (currentAntIndex !== 0) {
					timeoutID = setTimeout(processCurrentAnt, 0)
				} else {
					displayArena()
				}
			}
		}
	}
}

function nineVisibleSquares(currentAnt) {
	var view = []
	for (var vertical=-1; vertical<=1; vertical++) {
		for (var horizontal=-1; horizontal<=1; horizontal++) {
			var x = (currentAnt.x + horizontal + arenaWidth) % arenaWidth
			var y = (currentAnt.y + vertical + arenaHeight) % arenaHeight
			var arenaSquare = arena[x + y*arenaWidth]
			var square = {}
			square.colour = arenaSquare.colour
			square.food = arenaSquare.food
			var ant = arenaSquare.ant
			if (ant) {
				if (ant.player = currentAnt.player) {
					square.friend = {
						food: ant.food,
						type: ant.type
					}
					square.enemy = null
				} else {
					square.friend = null
					square.enemy = {
						food: ant.food,
						type: Math.sign(ant.type)
					}
				}
			} else {
				square.friend = null
				square.enemy = null
			}
			view.push(square)
		}
	}
	return view
}

function getMove(ant, rotatedView) {
	var player = ant.player
	var code = player.code
	var parameters = {}
	parameters.view = rotatedView
	if (player.id === 0) {
		parameters.console = console
	}
	var time = performance.now()
	try {
		var response = maskedEval(code, parameters)
	} catch(e) {
		var response = noMove
		disqualifyPlayer(e + '    Disqualified for error')
	}
	time = performance.now() - time
	if (debug && time > permittedTime) {
		console.log('Exceeded permitted time of ' + permittedTime + 'ms: ' + time)
	}
	player.time += time
	player.permittedTime += permittedTime
	if (player.time > 10000 && player.time > player.permittedTime) {
		response = noMove
		disqualifyPlayer('    Disqualified for exceeding permitted time')
	}
	return response
}

function disqualifyPlayer(message) {
	if (debug) {
		console.log(message)
	}
	
}

function step() {
	continuousMoves = false
	singleAntStep = false
	$('#play').prop('disabled', false)
	$('#pause').prop('disabled', true)
	clearTimeout(timeoutID)
	processCurrentAnt()		
}

function stepAnt() {	// Step next visible ant, or next ant if no zoom (only if display not hidden)
	continuousMoves = false
	singleAntStep = true
	$('#play').prop('disabled', false)
	$('#pause').prop('disabled', true)
	clearTimeout(timeoutID)
	processCurrentAnt()
}

function visible(ant) {
	// return true if the ant is within the zoomed area, including the first layer of out of range cells since they still affect the area 
}

/* PLAYER LOADING */

function loadPlayers() {
	loadAnswers(site, qid, function(answers) {
        createPlayers(answers)
	})
	showLoadedTime()
}

function loadAnswers(site, qid, onFinish) {
    var answers = []
    function loadPage() {
        $.get(
            'https://api.stackexchange.com/2.2/questions/' +
            qid.toString() + '/answers?page=' +
            (page++).toString() +
            '&pagesize=100&order=asc&sort=creation&site=' +
            site + '&filter=!YOKGPOBC5Yad4mOOn8Z4WcAE6q', readPage)
    }
    function readPage(data) {
        answers = answers.concat(data.items)
        if (data.hasMore)
            loadPage()
        else
            onFinish(answers)
    }
    var page = 1
    loadPage(page, readPage)
}

function createPlayers(answers) {
    var codePattern = /<pre\b[^>]*><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/
    var namePattern = /<h1\b[^>]*>(.*?)<\/h1>/
	
	var colourIndex = 0
	var testPlayer = { id: 0, included: false, code: '', link: 'javascript:;', title: 'NEW CHALLENGER', colourIndex: colourIndex }
	players.push(testPlayer)
	
	answers.forEach(function(answer) {
		var user = decode(answer.owner.display_name)
		var codeMatch = codePattern.exec(answer.body)
		var nameMatch = namePattern.exec(answer.body)
		if (codeMatch !== null && codeMatch.length > 0 && nameMatch !== null && nameMatch.length > 0) {
			var player = {}
			player.id = answer.answer_id
			player.included = true
			player.code = decode(codeMatch[1])
			player.link = answer.link
			player.title = nameMatch[1].substring(0,20) + ' - ' + user
			colourIndex++
			player.colourIndex = colourIndex
			players.push(player)
		}		
	})
	colourPlayers()
	initialiseLeaderboard()
}

