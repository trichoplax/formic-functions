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
	leaderboardInfo = []
	population = []
	delay = 150
	currentAnt = 0
	maxPlayers = 16
	display = true
	zoomed = false
	zoomLocked = false
	continuousMoves = true
	singleAntStep = false
	gameInProgress = false
	ongoingTournament = false
	currentGameInfo = []
	arena = []
	zoomedAreaCentreX = 0
	zoomedAreaCentreY = 0
	zoomOnLeft = true
	timeoutID = 0
}

/* HELPERS */

function decode(html) { return $('<textarea>').html(html).text() }

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
		$('#play').prop('disabled', false)
		$('#pause').prop('disabled', false)
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
		$('#play').prop('disabled', false)
		$('#pause').prop('disabled', false)
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
		moveNextAnt()			
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
	$('#fit_canvas').click(function() {})
	$('#arena_canvas').mousemove(function(event) {
		if (!zoomLocked) {
			zoomed = true
			zoomedAreaCentreX = event.offsetX
			zoomedAreaCentreY = event.offsetY
		}
	})
	$('#arena_canvas').mouseleave(function() {
		if (!zoomLocked) {
			zoomed = false
		}
	})
	$('#arena_canvas').click(function() {
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
			$('#abandon_game').prop('disabled',true)
		}		
	})
	$('#reset_leaderboard').prop('disabled', true)
	$('#reset_leaderboard').click(function() {
		$('#reset_leaderboard').prop('disabled', true)
		leaderboardInfo = []
		initialiseLeaderboard()
	})
	$('#permitted_time_override').change(function() {})
	$('#new_challenger_text').change(function() {})

}

function showLoadedTime() {
	$('#loaded_at').html('<i>Players loaded from contest post</i> ' + (new Date()).toString())
}

function initialiseLeaderboard() {
	players.forEach(function(player) {
		var row = { id: player['id'], position: 1, name: player['title'], score: 0, confidence: 0, included: player['included'] }
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
		content += row['name']
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


/* GAMEPLAY */

function startNewGame() {}

function moveNextAnt() {
	
	
	currentAnt = (currentAnt + 1) % population.length
	if (display) {
		if (continuousMoves) {
			if (currentAnt === 0) {
				timeoutID = setTimeout(moveNextAnt, delay)
				displayArena()
			} else {
				timeoutID = setTimeout(moveNextAnt, 0)
			}
		} else {
			if (singleAntStep) {
				if (zoomed && !visible(currentAnt)) {
					timeoutID = setTimeout(moveNextAnt, 0)
				} else {
					displayArena()
				}
			} else {
				if (currentAnt !== 0) {
					timeoutID = setTimeout(moveNextAnt, 0)
				} else {
					displayArena()
				}
			}
		}
	}
}

function step() {
	continuousMoves = false
	singleAntStep = false
	$('#play').prop('disabled', false)
	$('#pause').prop('disabled', true)
	clearTimeout(timeoutID)
	moveNextAnt()		
}

function stepAnt() {	// Step next visible ant, or next ant if no zoom (only if display not hidden)
	continuousMoves = false
	singleAntStep = true
	$('#play').prop('disabled', false)
	$('#pause').prop('disabled', true)
	clearTimeout(timeoutID)
	moveNextAnt()
}

function visible(ant) {
	// return true if the ant is within the zoomed area, including the first layer of out of range cells since they still affect the area 
}

function displayArena() {
	
	if (zoomed) {
		displayZoomedArea()
	}
}

function displayZoomedArea() {}


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
	
	var testPlayer = { id: 0, included: false, code: '', link: 'javascript:;', title: 'NEW CHALLENGER' }
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
			players.push(player)
		}		
	})
	initialiseLeaderboard()
}

