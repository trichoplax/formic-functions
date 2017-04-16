// Many thanks to Helka Homba for these posts, which provided the idea of a Stack Snippets KotH and heavily informed this code.
// Red vs. Blue - Pixel Team Battlebots: https://codegolf.stackexchange.com/q/48353/20283
// Block Building Bot Flocks: https://codegolf.stackexchange.com/q/50690/20283

/* SETUP */

$(load)

function load() {
	setGlobals()
	loadPlayers()
}

function setGlobals() {
	qid = 50690
	site = 'codegolf'
	players = []
	leaderboard_info = []
}

/* HELPERS */

function decode(html) { return $('<textarea>').html(html).text() }

/* INTERFACE */

function showLoadedTime() {
	$('#loaded_at').html('<i>Players loaded from contest post</i> ' + (new Date()).toString())
}

function initialiseLeaderboard() {
	players.forEach(function(player) {
		var row = { id: player['id'], position: 1, name: player['title'], score: 0, confidence: 0, included: player['included'] }
		leaderboard_info.push(row)
	})
	display_leaderboard()
}

function display_leaderboard() {
	var	content = ''
	leaderboard_info.forEach(function(row) {
		var checkbox_id = row['id'] + '_included'
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
		content += '<input id=' + checkbox_id + ' type=checkbox>'
		content += '</td>'
		content += '</tr>'
	})
	$('#leaderboard_body').html(content)
	leaderboard_info.forEach(function(row) {
		var checkbox_id = '#' + row['id'] + '_included'	
		$(checkbox_id).prop('checked', row['included'])
	})	
}

/* GAMEPLAY */

function runTournament() {}

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
	
	var testPlayer = { id: -1, included: false, code: '', link: 'javascript:;', title: 'NEW CHALLENGER [-1]' }
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
			player.title = nameMatch[1].substring(0,20) + ' - ' + user + ' [' + player.id.toString() + ']'
			players.push(player)
		}		
	})
	initialiseLeaderboard()
}

