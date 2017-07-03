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
	moveCounter = 0
	movesPerGame = 10000
	paletteSize = 8
	$('#completed_moves_area').html('0 moves of ' + movesPerGame + ' completed.')
	delay = parseInt($('#delay').val(), 10)
	processingStartTime = 0
	debug = $('#debug').prop('checked')
	currentAntIndex = 0
	maxPlayers = parseInt($('#max_players').val(), 10)
	display = true
	bigBatchSize = 100
	batchSize = 1
	zoomed = false
	zoomLocked = false
	continuousMoves = true
	singleAntStep = false
	gameInProgress = false
	gamesPlayed = 0
	ongoingTournament = false
	currentGameInfo = []
	zoomedAreaCentreX = 0
	zoomedAreaCentreY = 0
	zoomOnLeft = true
	timeoutID = 0
	permittedTime = parseInt($('#permitted_time_override').val(), 10)
	noMove = {cell: 4, color: 0, workerType: 0}
	arenaWidth = 2500
	arenaHeight = 1000
	arenaArea = arenaWidth * arenaHeight
	arena = new Array(arenaArea)
	for (var i=0; i<arenaArea; i++) {
		arena[i] = {
			food: 0,
			color: 1,
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
	paletteChoice = 0
	initialiseColorPalettes()
	initialiseSupplementaryCanvases()
}

function initialiseColorPalettes() {
	var arenaColor = {}
	arenaColors = []
	
	arenaColor.tile = [
		null,
		[255, 255, 255],
		[255, 255, 0],
		[255, 0, 255],
		[0, 255, 255],
		[255, 0, 0],
		[0, 255, 0],
		[0, 0, 255],
		[0, 0, 0]
	]
	arenaColor.food = arenaColor.tile[8]
	arenaColor.ant = arenaColor.tile[8]
	arenaColors.push(arenaColor)
	
	arenaColor = {}
	arenaColor.tile = [
		null,
		[255, 255, 255],
		[218, 218, 218],
		[181, 181, 181],
		[144, 144, 144],
		[108, 108, 108],
		[72, 72, 72],
		[36, 36, 36],
		[0, 0, 0]
	]
	arenaColor.food = arenaColor.tile[8]
	arenaColor.ant = arenaColor.tile[8]
	arenaColors.push(arenaColor)
	
	arenaColor = {}
	arenaColor.tile = [
		null,
		[255, 255, 255],
		[204, 121, 167],
		[213, 94, 0],
		[0, 114, 178],
		[240, 228, 66],
		[0, 158, 115],
		[86, 180, 233],
		[0, 0, 0]
	]
	arenaColor.food = arenaColor.tile[8]
	arenaColor.ant = arenaColor.tile[8]
	arenaColors.push(arenaColor)
}

function initialiseSupplementaryCanvases() {
	var i, j
	arenaCanvas = document.createElement('canvas')
	arenaCanvas.width = arenaWidth
	arenaCanvas.height = arenaHeight
	arenaCtx = arenaCanvas.getContext('2d')
	arenaImage = arenaCtx.createImageData(arenaWidth, arenaHeight)
	for (i=0; i<arenaCanvas.width*arenaCanvas.height; i++) {
		arenaImage.data[i*4 + 3] = 255
	}
	
	zoomCanvas = document.createElement('canvas')
	zoomCanvas.width = 1000
	zoomCanvas.height = 1000
	zoomCtx = zoomCanvas.getContext('2d')
	zoomCellsPerSide = parseInt($('#squares_per_side').val(), 10)
	zoomCellSideLength = zoomCanvas.width / zoomCellsPerSide
	zoomImage = zoomCtx.createImageData(zoomCanvas.width, zoomCanvas.height)
	for (i=0; i<zoomCanvas.width*zoomCanvas.height; i++) {
		zoomImage.data[i*4 + 3] = 255
	}
	zoomCtx.imageSmoothingEnabled = false
	
	displayCanvas = document.getElementById('display_canvas')
	displayCanvas.width = 1250
	displayCanvas.height = 500
	displayCtx = displayCanvas.getContext('2d')
	
	var paletteCanvas, paletteCtx, paletteImage
	paletteCanvases = []
	paletteContexts = []
	for (i=0; i<arenaColors.length; i++) {
		paletteCanvas = document.createElement('canvas')
		paletteCanvas.width = 9
		paletteCanvas.height = 1
		paletteCtx = paletteCanvas.getContext('2d')
		paletteImage = paletteCtx.createImageData(paletteCanvas.width, paletteCanvas.height)
		for (j=1; j<paletteSize+1; j++) {
			for (var c=0; c<3; c++) {
				paletteImage.data[j*4 + c] = arenaColors[i].tile[j][c]
			}
			paletteImage.data[j*4 + 3] = 255
		}
		paletteCtx.putImageData(paletteImage, 0, 0)
		paletteCanvases.push(paletteCanvas)
		paletteContexts.push(paletteCtx)
	}
	initialisePaletteDropdown()
}

function initialisePaletteDropdown() {
	var canvas, imageSource, i, content=''
	paletteImageSources = []
	paletteCanvases.forEach(function(canvas) {
		imageSource = canvas.toDataURL()
		paletteImageSources.push(imageSource)
	})	
	$('#selected_palette').attr('src', paletteImageSources[paletteChoice]) 
	for (i=0; i<paletteImageSources.length; i++) {
		content += '<div onclick="setNewPalette(' + i + ')"><img src=\'' + paletteImageSources[i] + '\' class=\'palette_row_image\'></img></div>'
	}
	$('#palette_dropdown_options').html(content)
}

function setNewPalette(selectedDropdownRow) {
	if (selectedDropdownRow !== paletteChoice) {
		paletteChoice = selectedDropdownRow
		$('#selected_palette').attr('src', paletteImageSources[paletteChoice])
		displayGameTable()
		displayLeaderboard()
		displayArena()
	}
}

function colorPlayers() {
	random = seededRandomInitialiser(1)
	var playerColorNumbers, canvas, context, count, color, x, y, imageSource
	var colors = [1, 2, 3, 4, 5, 6, 7, 8]
	players.forEach(function(player) {
		player.avatars = []
		player.imageTags = []
		shuffle(colors)
		playerColorNumbers = colors.slice(0, 4)
		paletteCanvases.forEach(function(paletteCanvas) {
			canvas = document.createElement('canvas')
			canvas.width = 2
			canvas.height = 2
			context = canvas.getContext('2d')
			count = 0
			for (y=0; y<2; y++) {
				for (x=0; x<2; x++) {
					color = playerColorNumbers[count]
					context.drawImage(paletteCanvas, color, 0, 1, 1, x, y, 1, 1)
					count++
				}
			}
			player.avatars.push(canvas)
			imageSource = canvas.toDataURL()
			player.imageTags.push('<img src=\'' + imageSource + '\' class=\'tableImage\'></img>')
		})
	})
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
	$('#run_single_game').prop('disabled', false)
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
		if (!gameInProgress) {
			startNewGame()
		}		
	})
	$('#run_ongoing_tournament').prop('disabled', false)
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
		batchSize = bigBatchSize
	})
	$('#delay').val(delay)
	$('#delay').change(function() {
		delay = parseInt($('#delay').val(), 10)
	})
	$('#play').prop('disabled', true)
	$('#play').click(function() {
		continuousMoves = true
		$('#play').prop('disabled', true)
		$('#pause').prop('disabled', false)
		clearTimeout(timeoutID)
		processAnts()			
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
		maxPlayers = parseInt($('#max_players').val(), 10)
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
			zoomedAreaCentreX = Math.floor(event.offsetX * arenaWidth / displayCanvas.width)
			zoomedAreaCentreY = Math.floor(event.offsetY * arenaHeight / displayCanvas.height)
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
		display = true
		batchSize = 1
	})
	$('#abandon_game').prop('disabled', true)
	$('#abandon_game').click(abandonGame)
	$('#reset_leaderboard').prop('disabled', true)
	$('#reset_leaderboard').click(function() {
		$('#reset_leaderboard').prop('disabled', true)
		leaderboardInfo = []
		initialiseLeaderboard()
	})
	$('#permitted_time_override').change(function() {
		permittedTime = parseInt($('#permitted_time_override').val(), 10)
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
		zoomCellsPerSide = parseInt($('#squares_per_side').val(), 10)
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
		content += '<tr><td><a href="' + row.link + '" target="_blank">' + row.title + '</a>' +
			'<td>' + row.player.imageTags[paletteChoice] +
			'<td>' + row.type1 +
			'<td>' + row.type2 +
			'<td>' + row.type3 +
			'<td>' + row.type4 +
			'<td>' + row.food
	})
	$('#current_game_body').html(content)
}

function initialiseLeaderboard() {
	gamesPlayed = 0
	$('#game_counter').html('0 games played.')
	players.forEach(function(player) {
		var row = {
			player: player,
			id: player.id,
			position: 1,
			title: player.title,
			link: player.link,
			score: 0,
			confidence: 0,
			included: player.included
		}
		leaderboardInfo.push(row)
	})
	displayLeaderboard()
}

function displayLeaderboard() {
	var	content = ''
	leaderboardInfo.forEach(function(row) {
		var checkboxId = 'included_' + row.id
		content += '<tr><td>' + row.position
		content += '<td><a href="' + row.link + '" target="_blank">' + row.title + '</a>'
		content += '<td>' + row.player.imageTags[paletteChoice]
		content += '<td>' + row.score
		content += '<td>' + row.confidence
		content += '<td><input id=' + checkboxId + ' type=checkbox>'
	})
	$('#leaderboard_body').html(content)
	leaderboardInfo.forEach(function(row) {
		var id = row.id
		var checkboxId = '#included_' + id
		$(checkboxId).prop('checked', row.included)
		var player = players[players.findIndex(function(player){
			return player.id === id
		})]
		$(checkboxId).change(function() {
			player.included = $(checkboxId).prop('checked')
			row.included = $(checkboxId).prop('checked')
		})
	})	
}

function fillArenaCanvas() {
	var x, y, cell, i
	for (y=0; y<arenaHeight; y++) {
		for (x=0; x<arenaWidth; x++) {
			cell = arena[x + y*arenaWidth]
			if (cell.food) {
				for (i=0; i<3; i++) {
					arenaImage.data[(x + y*arenaWidth) * 4 + i] = arenaColors[paletteChoice].food[i]
				}
			} else if (cell.ant) {
				for (i=0; i<3; i++) {
					arenaImage.data[(x + y*arenaWidth) * 4 + i] = arenaColors[paletteChoice].ant[i]
				}			
			} else {
				for (i=0; i<3; i++) {
					arenaImage.data[(x + y*arenaWidth) * 4 + i] = arenaColors[paletteChoice].tile[cell.color][i]
				}			
			}
		}
	}
	arenaCtx.putImageData(arenaImage, 0, 0)
}

function fillZoomCanvas() {
	var offset = Math.floor(zoomCellsPerSide / 2)
	var left = (zoomedAreaCentreX - offset + arenaWidth) % arenaWidth
	var top = (zoomedAreaCentreY - offset + arenaHeight) % arenaHeight
	for (var y=0; y<zoomCellsPerSide; y++) {
		var wrappedY = (y + top) % arenaHeight
		for (var x=0; x<zoomCellsPerSide; x++) {
			var wrappedX = (x + left) % arenaWidth
			var cell = arena[wrappedX + wrappedY*arenaWidth]
			paintTile(x, y, cell.color)
			if (cell.food || (cell.ant && cell.ant.type < 5 && cell.ant.food)) {
				paintFood(x, y)
			}
			if (cell.ant) {
				paintAnt(x, y, cell.ant)
			}
		}
	}
}

function paintTile(x, y, color) {
	zoomCtx.drawImage(paletteCanvases[paletteChoice], color, 0, 1, 1, x * zoomCellSideLength, y * zoomCellSideLength, zoomCellSideLength, zoomCellSideLength) 
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
	var player = ant.player
	zoomCtx.drawImage(player.avatars[paletteChoice], 0, 0, 2, 2, (x+0.5)*zoomCellSideLength - size, (y+0.5)*zoomCellSideLength - size, size*2, size*2)
}

function displayArena() {
	fillArenaCanvas()
	displayCtx.drawImage(arenaCanvas, 0, 0, arenaWidth, arenaHeight, 0, 0, displayCanvas.width, displayCanvas.height)
	if (zoomed) {
		displayZoomedArea()
	}
}

function displayZoomedArea() {
	fillZoomCanvas()
	if (zoomOnLeft) {
		displayCtx.drawImage(zoomCanvas, 0, 0, zoomCanvas.width, zoomCanvas.height, 0, 0, displayCanvas.height, displayCanvas.height)
	} else {
		displayCtx.drawImage(zoomCanvas, 0, 0, zoomCanvas.width, zoomCanvas.height, displayCanvas.width - displayCanvas.height, 0, displayCanvas.height, displayCanvas.height)		
	}
}

/* GAMEPLAY */

function startNewGame() {
	gameInProgress = true
	if ($('#seeded_random').prop('checked')) {
		random = parseInt(seededRandomInitialiser($('#seed').val()), 10)
	} else {
		random = cryptoRandom
	}
	moveCounter = 0
	for (var i=0; i<arenaWidth; i++) {
		arena[i].food = 1
		arena[i].color = 1
		arena[i].ant = null
	}
	for (var i=arenaWidth; i<arenaArea; i++) {
		arena[i].food = 0
		arena[i].color = 1
		arena[i].ant = null
	}
	shuffle(arena)
	var includedPlayers = []
	players.forEach(function(player) {
		if (player.included) {
			includedPlayers.push(player)
			if (player.id === 0) {
				player.code = $('#new_challenger_text').val()
			}
		}
	})
	var numberOfPlayers = Math.min(includedPlayers.length, maxPlayers)
	for (i=0; i<numberOfPlayers; i++) {
		var r = random(includedPlayers.length)
		var temp = includedPlayers[i]
		includedPlayers[i] = includedPlayers[r]
		includedPlayers[r] = temp
	}
	var playersThisGame = includedPlayers.slice(0, numberOfPlayers)
	gameStats = []
	population = []
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
			player: player,
			id: player.id,
			title: player.title,
			link: player.link,
			type1: 0,
			type2: 0,
			type3: 0,
			type4: 0,
			food: 0
		}
		gameStats.push(row)
	})
	currentAntIndex = 0
	displayGameTable()
	clearTimeout(timeoutID)
	processingStartTime = performance.now()
	timeoutID = setTimeout(prepareForNextBatch, 0)
}

function abandonGame() {
	gameInProgress = false
	clearTimeout(timeoutID)
	if (ongoingTournament) {
		startNewGame()
	} else {
		$('#run_single_game').html('<h2>Run single game</h2>')
		$('#run_single_game').prop('disabled', false)
		$('#no_display').prop('disabled', true)
		$('#play').prop('disabled', true)
		$('#pause').prop('disabled', true)
		$('#step').prop('disabled', true)
		$('#step_ant').prop('disabled', true)
		$('#abandon_game').prop('disabled', true)
	}		
}

function processAnts() {
	processingStartTime = performance.now()
	for (var t=0; t<batchSize; t++) {
		processCurrentAnt()
		currentAntIndex = (currentAntIndex + 1) % population.length
		if (currentAntIndex === 0) {
			moveCounter++
		}
		if (moveCounter >= movesPerGame) {
			break
		}
	}
	if (moveCounter === 1) {
		$('#completed_moves_area').html('1 move of ' + movesPerGame + ' completed.')
	} else {
		$('#completed_moves_area').html(moveCounter + ' moves of ' + movesPerGame + ' completed.')
	}
	if (moveCounter >= movesPerGame) {
		gameOver()
	} else {
		prepareForNextBatch()
	}
}

function prepareForNextBatch() {	
	if (display) {
		if (continuousMoves) {
			if (currentAntIndex === 0) {
				var adjustment = performance.now() - processingStartTime
				var adjustedDelay = Math.max(delay - adjustment, 0)
				timeoutID = setTimeout(processAnts, adjustedDelay)
				displayArena()
			} else {
				timeoutID = setTimeout(processAnts, 0)
			}
		} else {
			if (singleAntStep) {
				if (zoomed && atLeastOneVisibleAnt() && !visible(population[currentAntIndex])) {
					timeoutID = setTimeout(processAnts, 0)
				} else {
					displayArena()
				}
			} else {
				if (currentAntIndex !== 0) {
					timeoutID = setTimeout(processAnts, 0)
				} else {
					displayArena()
				}
			}
		}
	} else {
		timeoutID = setTimeout(processAnts, 0)
	}
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
	if (debug && currentAnt.player.id === 0) {
		displayMoveInfo(currentAnt, rotatedView, response)
	}
	var targetCell = rotator[rotation][response.cell]
	var x = (currentAnt.x + targetCell%3 - 1 + arenaWidth) % arenaWidth
	var y = (currentAnt.y + Math.floor(targetCell/3) - 1 + arenaHeight) % arenaHeight
	if (response.color) {
		setColor(x, y, response.color)
	} else if (response.workerType) {
		makeWorker(x, y, response.workerType, currentAnt)
	} else if (response.cell !== 4) {
		moveAnt(x, y, currentAnt)
	}
}

function displayMoveInfo(ant, rotatedView, response) {
	var identity, carrying
	identity = ['', 'Worker type 1', 'Worker type 2', 'Worker type 3', 'Worker type 4', 'Queen'][ant.type]
	if (ant.type === 5) {
		carrying = ''
	} else {
		if (ant.food) {
			carrying = 'Laden '
		} else {
			carrying = 'Unladen '
		}
	}
	console.log(carrying + identity + ': location (' + ant.x + ', ' + ant.y + '):')
	console.log('  Received: ' + JSON.stringify(rotatedView))
	console.log('  Response: ' + JSON.stringify(response))
}

function setColor(x, y, color) {
	arena[x + y*arenaWidth].color = color
}

function makeWorker(x, y, workerType, parent) {
	if (parent.type < 5) {
		disqualify(player, 'A worker cannot create a new worker.')
		return
	}
	if (!parent.food) {
		disqualify(player, 'Cannot create a new worker without food.')
		return
	}
	var birthCell = arena[x + y*arenaWidth]
	if (birthCell.food) {
		disqualify(player, 'Cannot create new worker on top of food.')
		return
	}
	if (birthCell.ant) {
		if (parent.x === x && parent.y === y) {
			disqualify(player, 'Cannot create new worker on own cell.')
			return
		} else {
			disqualify(player, 'Cannot create new worker on top of another ant.')
			return
		}
	}
	var newAnt = {
		player: parent.player,
		type: workerType,
		food: 0,
		x: x,
		y: y
	}
	birthCell.ant = newAnt
	population.splice(currentAntIndex, 0, newAnt)
	currentAntIndex++
	parent.food--
	var id = parent.player.id
	gameStats.forEach(function(row) {
		if (row.id === id) {
			var type = 'type' + workerType
			row[type]++
			row.food--
		}
	})
	sortGameStats()
	displayGameTable()
}

function moveAnt(x, y, ant) {
	var departureCell = arena[ant.x + ant.y*arenaWidth]
	var destinationCell = arena[x + y*arenaWidth]	
	if (destinationCell.ant) {
		disqualify(player, 'Cannot move onto another ant.')
		return
	}
	if (destinationCell.food && ant.type < 5 && ant.food) {
		disqualify(player, 'A laden worker cannot move onto food.')
		return
	}	
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
					row.food++
				}
			})
			sortGameStats()
			displayGameTable()					
		}
	}
	passFood(ant)
}

function passFood(ant) {
	if (ant.type === 5) {
		passFoodQueen(ant)
	} else {
		passFoodWorker(ant)
	}
}

function adjustFood(ant, change) {
	var id
	ant.food = ant.food + change
	id = ant.player.id
	gameStats.forEach(function(row) {
		if (row.id === id) {
			row.food = row.food + change
		}
	})
	sortGameStats()
	displayGameTable()
}

function passFoodQueen(ant) {
	var x, y, i, cell, cells, candidate
	cells = neighbours.slice()
	shuffle(cells)
	for (i=0; i<cells.length; i++) {	// Check for enemy workers to lose food to.
		if (!ant.food) {
			break
		}
		x = (ant.x + cells[i].x + arenaWidth) % arenaWidth
		y = (ant.y + cells[i].y + arenaHeight) % arenaHeight
		cell = arena[x + y*arenaWidth]
		candidate = cell.ant
		if (candidate && candidate.type < 5 && !candidate.food && candidate.player !== ant.player) {
			candidate.food = 1
			adjustFood(ant, -1)
		}
	}
	for (i=0; i<cells.length; i++) {	// Check for own workers to take food from.
		x = (ant.x + cells[i].x + arenaWidth) % arenaWidth
		y = (ant.y + cells[i].y + arenaHeight) % arenaHeight
		cell = arena[x + y*arenaWidth]
		candidate = cell.ant
		if (candidate && candidate.type < 5 && candidate.food && candidate.player === ant.player) {
			candidate.food = 0
			adjustFood(ant, 1)
		}
	}
}
	
function passFoodWorker(ant) {
	var x, y, i, cell, cells, candidate
	if (ant.food) {	// Check for own queen to give food to.
		for (i=0; i<neighbours.length; i++) {
			x = (ant.x + neighbours[i].x + arenaWidth) % arenaWidth
			y = (ant.y + neighbours[i].y + arenaHeight) % arenaHeight
			cell = arena[x + y*arenaWidth]
			candidate = cell.ant
			if (candidate && candidate.type === 5 && candidate.player === ant.player) {
				ant.food = 0
				adjustFood(candidate, 1)
				return
			}		
		}
	} else {	// Check for enemy queen to take food from.
		cells = neighbours.slice()
		shuffle(cells)
		for (i=0; i<cells.length; i++) {
			x = (ant.x + cells[i].x + arenaWidth) % arenaWidth
			y = (ant.y + cells[i].y + arenaHeight) % arenaHeight
			cell = arena[x + y*arenaWidth]
			candidate = cell.ant
			if (candidate && candidate.type === 5 && candidate.food && candidate.player !== ant.player) {
				ant.food = 1
				adjustFood(candidate, -1)
				return
			}
		}
	}
}

function gameOver() {
	var id, score
	gameStats.forEach(function(row) {
		id = row.id
		score = playersWithLessFood(id)
		addScoreToLeaderboard(id, score)
	})
	updateLeaderboardPositions()
	sortLeaderboard()
	$('#reset_leaderboard').prop('disabled', false)
	displayLeaderboard()
	gamesPlayed++
	if (gamesPlayed === 1) {
		$('#game_counter').html('1 game played.')
	} else {
		$('#game_counter').html(gamesPlayed + ' games played.')
	}
	abandonGame()
}

function sortLeaderboard() {	//	Sort by position, then by confidence if position equal, then by age if those equal.
	leaderboardInfo.sort(function(a, b) {
		if (a.position > b.position) {
			return 1
		}
		if (a.position < b.position) {
			return -1
		}
		if (a.confidence > b.confidence) {
			return -1
		}
		if (a.confidence < b.confidence) {
			return 1
		}
		if (a.id > b.id) {
			return 1
		}
		if (a.id < b.id) {
			return -1
		}
	})
}

function sortGameStats() {	//	Sort by food, then by number of workers if food equal, then by age if those equal.
	gameStats.sort(function(a, b) {
		if (a.food > b.food) {
			return -1
		}
		if (a.food < b.food) {
			return 1
		}
		if (a.type1 + a.type2 + a.type3 + a.type4 > b.type1 + b.type2 + b.type3 + b.type4) {
			return -1
		}
		if (a.type1 + a.type2 + a.type3 + a.type4 < b.type1 + b.type2 + b.type3 + b.type4) {
			return 1
		}
		if (a.id > b.id) {
			return 1
		}
		if (a.id < b.id) {
			return -1
		}
	})
}

function updateLeaderboardPositions() {
	leaderboardInfo.forEach(function(row) {
		row.position = playersWithHigherScore(row.id, row.score) + 1		
	})
}

function playersWithHigherScore(id, score) {
	var count = 0
	leaderboardInfo.forEach(function(row) {
		if (row.score > score) {
			count++
		}
	})
	return count
}

function playersWithLessFood(id) {
	var count = 0
	var playerFood = 0
	gameStats.forEach(function(row) {
		if (row.id === id) {
			playerFood = row.food
		}
	})
	gameStats.forEach(function(row) {
		if (row.food < playerFood) {
			count++
		}
	})
	return count
}

function addScoreToLeaderboard(id, score) {
	leaderboardInfo.forEach(function(row) {
		if (row.id === id) {
			row.score += score
		}
	})
}

function nineVisibleSquares(currentAnt) {
	var view = []
	for (var vertical=-1; vertical<=1; vertical++) {
		for (var horizontal=-1; horizontal<=1; horizontal++) {
			var x = (currentAnt.x + horizontal + arenaWidth) % arenaWidth
			var y = (currentAnt.y + vertical + arenaHeight) % arenaHeight
			var arenaSquare = arena[x + y*arenaWidth]
			var square = {}
			square.color = arenaSquare.color
			square.food = arenaSquare.food
			var ant = arenaSquare.ant
			if (ant) {
				square.ant = {
					food: ant.food,
					type: ant.type,
					friend: ant.player === currentAnt.player
				}
			} else {
				square.ant = null
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
		disqualify(player, e)
	}
	time = performance.now() - time
	if (time > permittedTime) {
		console.log(player + ': Exceeded permitted time of ' + permittedTime + 'ms: ' + time)
	}
	player.time += time
	player.permittedTime += permittedTime
	if (player.time > 10000 && player.time > player.permittedTime) {
		disqualify(player, 'Exceeded permitted time averaged over more than 10 seconds.')
		return noMove
	}
	if (response.color && response.workerType) {
		disqualify(player, 'Both color and worker type specified.')
		return noMove
	}
	if (response.cell < 0 || response.cell > 8) {
		disqualify(player, 'Cell out of range: ' + response.cell)
		return noMove
	}
	if (response.color < 0 || response.color > paletteSize) {
		disqualify(player, 'Color out of range: ' + response.color)
		return noMove
	}
	if (response.workerType < 0 || response.workerType > 4) {
		disqualify(player, 'Worker type out of range: ' + response.workerType)
		return noMove
	}
	return response
}

function disqualify(player, message) {
	console.log(message)
	console.log('    ' + player + ' DISQUALIFIED.')
	// TODO 
}

function step() {	// Step all ants up to the last one in the population.
	continuousMoves = false
	singleAntStep = false
	$('#play').prop('disabled', false)
	$('#pause').prop('disabled', true)
	clearTimeout(timeoutID)
	processAnts()		
}

function stepAnt() {	// Step next visible ant, or next ant if no zoom (only if display not hidden).
	continuousMoves = false
	singleAntStep = true
	$('#play').prop('disabled', false)
	$('#pause').prop('disabled', true)
	clearTimeout(timeoutID)
	processAnts()
}

function visible(ant) {	// Return true if the ant is within the zoomed area.
	var offset = Math.floor(zoomCellsPerSide / 2)
	var littleOffset = zoomCellsPerSide - offset
	var x = ant.x, y = ant.y
	var cx = zoomedAreaCentreX, cy = zoomedAreaCentreY
	if (((cx - x <= offset) && (x - cx <= littleOffset) || (cx + arenaWidth - x <= offset) && (x + arenaWidth - cx <= littleOffset)) && 
		((cy - y <= offset) && (y - cy <= littleOffset) || (cy + arenaHeight - y <= offset) && (y + arenaHeight - cy <= littleOffset))) {
		return true
	}
	return false
}

function atLeastOneVisibleAnt() {
	for (var i=0; i<population.length; i++) {
		if (visible(population[i])) {
			return true
		}
	}
	return false
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

	var testPlayer = { id: 0, included: false, code: '', link: '#new_challenger_heading', title: 'NEW CHALLENGER' }
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
			
			player.code = '' +
				'if (view[4].color === 1) {'+
				'	return { cell: 4, workerType: 0, color: 5 }' +
				'}' +
				'for (var i=0; i<9; i++) {' +
				'	if (view[i].food) {' +
				'		return { cell: i, workerType: 0, color: 0 }' +
				'	}' +
				'}' +
				'if (view[0].color === 1) {'+
				'return { cell: 0, workerType: 0, color: 0 }'+
				'}'+
				'if (view[2].color === 1) {'+
				'return { cell: 2, workerType: 0, color: 0 }'+
				'}'+
				'if (view[6].color === 1) {'+
				'return { cell: 6, workerType: 0, color: 0 }'+
				'}'+
				'if (view[8].color === 1) {'+
				'return { cell: 8, workerType: 0, color: 0 }'+
				'}'+
				'return { cell: 0, workerType: 0, color: 0 }'

			
			player.link = answer.link
			player.title = nameMatch[1].substring(0,20) + ' - ' + user
			players.push(player)
		}		
	})
	colorPlayers()
	initialiseLeaderboard()
}

