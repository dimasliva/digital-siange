function FetchPlayerData(playerid, filesMap){
	fetcher({url: '/api/players/' + playerid + '/status'})
	.then(function(x){
        var ret = JSON.parse(x.response);
        if(ret.status == 'ok'){
           DisplayPlayerData(ret.data, filesMap)
        }
    })
    .catch(function(e){
		console.warn('Failed to get response');
	});
}

function DisplayPlayerData(data, fileMap) {

    $$('playerName').innerText = data.name;
    $$('playerGroup').innerText = data.group;
    $$('playerAddress').innerText = data.stats.ip_address;
    $$('playerLast').innerText = DateFormatter(data.lastacc) + ' (' + DateDifference(data.lastacc) + ')';
    $$('playerTimezone').value = data.tz_offset;
    switch(data.stats.process_executable){
        case 'play':
        case 'slideshow':
            var nowPlaying = data.stats.process_status in fileMap ? fileMap[data.stats.process_status] : data.stats.process_status;
            $$('telemetryProc').innerHTML = data.stats.process_executable + (data.stats.process_status != '' ? ' &ndash; ' + nowPlaying : '');
            break;
        default:
            $$('telemetryProc').innerHTML = data.stats.process_executable + (data.stats.process_status != '' ? ' &ndash; ' + data.stats.process_status : '');
            break;
    }
    

    var graphs = $$('telemetryGraphs').getContext('2d');
    graphs.font = '11px Tahoma, sans-serif';
    graphs.fillStyle = '#F66';
    graphs.fillRect(0, 8, 300, 20);
    graphs.fillStyle = '#A00';
    graphs.fillRect(0, 8, Math.round(parseFloat(data.stats.cpu) * 3), 20);
    graphs.fillStyle = '#6AF';
    graphs.fillRect(0, 38, 300, 20);
    graphs.fillStyle = '#06A';
    graphs.fillRect(0, 38, Math.round(parseFloat(data.stats.ram) * 3), 20);
    graphs.fillStyle = '#8C2';
    graphs.fillRect(0, 68, 300, 20);
    graphs.fillStyle = '#6A0';
    var t = data.stats.temperature ? Number(data.stats.temperature) : '0.0';
    graphs.fillRect(0, 68, Math.round(((t > 30 ? t : 30) - 30) * 6), 20);
    graphs.fillStyle = '#fff';
    graphs.fillText('CPU:  ' + data.stats.cpu, 6, 22);
    graphs.fillText('RAM:  ' + data.stats.ram, 6, 52);
    graphs.fillText('Температура: ' + t + '°C', 6, 82);
    
}

function FetchRemoteCommandHistory(playerId){
    fetcher({url: '/api/players/remotecmd/list', method: 'POST', json: true, body: {player: playerId}})
    .then(function(x){
        var statusNames = ['Ожидается', 'Выполнено', 'Ошибка']
        var commands = JSON.parse(x.response).data;
        $$('remoteCommandLog').innerHTML = '';
        commands.forEach(function(command){
            var record = $$('remoteCommandLog').insertRow()
            record.insertCell(0).innerText = command.timestamp;
            record.insertCell(1).innerText = command.params[0];
            record.insertCell(2).innerText = statusNames[command.status];
            var actionsField = record.insertCell(3);
            if(command.status == 0){
                var cancelButton = document.createElement('button');
                cancelButton.onclick = RemoteCommandCancel.bind(null, command.id);
                cancelButton.innerText = 'Отменить';
                actionsField.appendChild(cancelButton);
            }
        });
    })
}

function RemoteCommandCancel(id){
    fetcher({
        url: '/api/players/remotecmd/delete',
        method: 'POST',
        json: true,
        body: {
            requestId: id
        }
    }).then(function(x){
        FetchRemoteCommandHistory(window.playerId);
    }).catch(function(e){
        MessagePopup(e.toString());
    });
}

function RemoteCommandSend(){
    var output = $$('remoteCommandLog');
    var command = $$('remoteCommandInput').value.trim();
    if(command == ''){
        MessagePopup('Enter command line')
        return;
    }
    fetcher({
        url: '/api/players/remotecmd',
        method: 'POST',
        json: true,
        body: {
            player: window.playerId,
            command: command
        }
    }).then(function(x){
        $$('remoteCommandInput').value = '';
        FetchRemoteCommandHistory(window.playerId);
    }).catch(function(e){
        MessagePopup(e.toString());
    });
}

function RemoteCommandClearHistory(){
     fetcher({
        url: '/api/players/remotecmd/clear',
        method: 'POST',
        json: true,
        body: {
            player: window.playerId
        }
    }).then(function(x){
        FetchRemoteCommandHistory(window.playerId);
    }).catch(function(e){
        MessagePopup('Failed to remove remote command history');
    });
}

function PlayerSetTimezone(){
    var timezone_offset = $$('playerTimezone').value;
    fetcher({url: '/api/players/set_timezone', method: 'POST', json: true, body: {player: window.playerId, tzOffset: timezone_offset}})
    .then(function(){
        MessagePopup('Player timezone set');
    })
}

// loadup ........ /
function loadup(){
    var id = decodeURIComponent(/\/players\/([^\/]*)/.exec(location.href)[1]);
    window.playerId = id;
    fetcher({url: '/api/files/list'}).then(function(x){
        var files = JSON.parse(x.response).result;
        var filesMap = files.reduce(function(map, item){
            map[item.id] = item.name;
            return map;
        }, {})
        FetchPlayerData(id, filesMap);
        setInterval(FetchPlayerData.bind(null, id, filesMap), 20000);
    })
    FetchRemoteCommandHistory(id);
    setInterval(FetchRemoteCommandHistory.bind(null, id), 5000);
    var timezoneSelector = $$('playerTimezone');
    for(var i = -12; i < 13; i++){
       timezoneSelector.add(new Option(
           (i > 0 ? '+' : '') + i.toString() + ':00',
           i * 3600
       ));
    }
}
