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
	continuousMoves = true
	ongoingTournament = false
	currentGameInfo = []
	arena = []
}

/* HELPERS */

function decode(html) { return $('<textarea>').html(html).text() }

/* INTERFACE */

function initialiseInterface() {
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
		$('#abandon_tournament').prop('disabled', false)
		
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
		$('#abandon_tournament').prop('disabled', false)
	})
	$('#no_display').prop('disabled', true)
	$('#no_display').click(function() {
		$('#top_hidden_area').hide(300)
		$('#bottom_hidden_area').hide(300)
		$('#abandon_game').hide(300)
		$('#abandon_tournament').hide(300)
		$('#restore_display').show(300)
	})
	$('#delay').val(delay)
	$('#delay').change(function() {
		delay = $('#delay').val()
	})
	$('#play').prop('disabled', true)
	$('#play').click(function() {})
	$('#pause').prop('disabled', true)
	$('#pause').click(function() {})
	$('#step').prop('disabled', true)
	$('#step').click(function() {})			// Step all ants in the population
	$('#step_ant').prop('disabled', true)
	$('#step_ant').click(function() {})		// Step next visible ant, or next ant if no zoom
	$('#max_players').val(maxPlayers)
	$('#max_players').change(function() {
		maxPlayers = $('#max_players').val()
	})
	$('#fit_canvas').click(function() {})
	$('#arena_canvas').mousemove(function() {})		// Relocate zoomed region unless frozen
	$('#arena_canvas').mouseleave(function() {})	// Remove zoomed region unless frozen
	$('#arena_canvas').click(function() {})			// Toggle freezing of location of zoomed region
	$('#restore_display').hide()
	$('#restore_display').click(function() {
		$('#restore_display').hide(300)
		$('#top_hidden_area').show(300)
		$('#bottom_hidden_area').show(300)
		$('#abandon_game').show(300)
		$('#abandon_tournament').show(300)
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
	if (continuousMoves) {
		if (currentAnt === 0) {
			setTimeout(moveNextAnt, delay)
		} else {
			setTimeout(moveNextAnt, 0)
		}
	}
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

