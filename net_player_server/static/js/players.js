// players page ........ /

var state = {
    activeItem: null,
    headlines: {}
}

// view status
function PlayerStatusClick(){
	var selectedplayer = state.activeItem;
	if(selectedplayer)
		location.href = '/players/' + selectedplayer.id + '/'
	else
		MessagePopup(translated('player_required'));
}

function PlayerScreenshotUpdate(element, playerId){
    element.src = '/thumb/' + playerId + '.png?rnd=' + Math.floor(Math.random() * 1e6);
}

function SetScheduleAction(item){
    var selectedplayer = state.activeItem;
	var selectedgroup = item;
    playersModel.assign({
        player: selectedplayer.id,
        group: selectedgroup.id
    }).then(function(resp){
        playersList.update(resp);
        MessagePopup(translated('player_schedule_set'))
        modals.schedule.hide();
    });
}

function updateHeadlines(){
    subsModel.fetch().then(function(data){
        data.forEach(function(item){
            state.headlines[item.id] = item.text;
        })
    })
}

function setPlayerHeadline(){
	subsModel.write({
        player: subcontrols.playerID(),
        content: $$('playerSummaryHeadline').value
    }).then(function(resp){
        updateHeadlines();
        MessagePopup('Установлена бегущая строка для плеера');
    })
}

// loadup ........ /

function loadup(){
    window.playersModel = new RestFactory({
        url: '/api/players/list',
        methods: {
            'status': {
                url: '/api/players/status'
            },
            'assign': {
                url: '/api/players/assign'
            },
            'rename': {
                url: '/api/players/rename'
            }
        }
    });
    window.subsModel = new RestFactory({
        url: '/api/subs/list',
        methods: {
            'write': {
                url: '/api/subs/update'
            },
            'broadcast': {
                url: '/api/subs/broadcast'
            }
        }
    });
    window.schedulesModel = new RestFactory({
        url: '/api/schedules/list',
        methods: {}
    });
    window.playersList = new BasicListView({
        elem: $$('playerList'),
        key: 'id',
        transform: function(item){
            var taskStatus = item.next == null ? item.scheduleName : item.scheduleName + ' (' + translated('players_next_schedule') + ' ' + item.nextScheduleName + ')';
			if(item.lastError !== null){
				if(
                    (item.lastError.request !== undefined) &&
                    (item.lastError.request !== null) &&
                    (item.lastError.request.attributes !== null) &&
                    (item.lastError.request.method === 'set_schedule')
                ){
					var errorDescription = translated('request_schedule_failed') + ': ' + item.lastError.request.scheduleName + ' (' + item.lastError.error + ')';
				} else {
					var errorDescription = translated('request_generic_failed') + ': '+ item.lastError.error;
				}
				taskStatus += ' <span style="color:red">' + errorDescription + '</span>';
			};
            var icons = {
                offline: '/static/icons/offline.svg',
                live: '/static/icons/online.svg',
                deadline: '/static/icons/warning.svg'
            };
            var extraCss = {
                offline: 'player-status-offline',
                live: null,
                deadline: 'player-status-deadline'
            };
            return {
                image: icons[item.status],
                text: '<b>' + item.name + '</b><div>' + item.status + '</div><div>' + taskStatus + '</div>',
                defaultAction: 'status',
                actions: item.status == 'offline' ? ['status', 'rename'] : ['status', 'set_schedule', 'rename', 'screenshot'],
                class: extraCss[item.status]
            }
        },
        actions: {
            status: {
                icon: '/static/icons/info.svg',
                label: 'Status',
                handler: function(item){
                    modals.summary.open(item);
                }
            },
            set_schedule: {
                icon: '/static/icons/schedule.svg',
                label: 'Set schedule',
                handler: function(item){
                    modals.schedule.open(item);
                }
            },
            rename: {
                icon: '/static/icons/rename.svg',
                label: 'Rename',
                handler: function(item){
                    modals.rename.open(item);
                }
            },
            screenshot: {
                icon: '/static/icons/camera.svg',
                label: 'Screenshot',
                handler: function(item){
                    modals.screenshot.open(item);
                }
            }
        }
    })
    window.schedulesList = new BasicListView({
        elem: $$('groupList'),
        transform: function(item){
            return {
                image: '/static/icons/playlist.svg',
                text: item.name,
                defaultAction: 'set_schedule',
                actions: []
            }
        },
        actions: {
            set_schedule: {
                icon: null,
                label: 'Set schedule',
                handler: SetScheduleAction
            }
        }
    });
    window.sortList = new neListVw({
        elem: $$('playerSortList'),
        multi: false,
        key: 'value',
        display: {
            'text': String
        },
        style: {
            'normal': 'listview-item'
        }
    });

    window.sortList.update([
        {text: translated('players_sort_schedule'), value: "group"},
        {text: translated('players_sort_accessed'), value: "lastacc"},
    ]);

    try {
        window.subcontrols = {
            playerID: ko.observable(null),
            volume: ko.observable('20'),
        }
        ko.applyBindings(window.subcontrols);
    } catch(e) {
        console.warn(e);
    }

    window.modals = {
        schedule: new neModal(
            $$('playerGroup'),
            function(item){
                state.activeItem = item;
            }
        ),
        broadcastHeadline: new neModal(
            $$('playerBroadcast'),
            function(){
                $$('broadcastHeadline').value = '';
                $$('broadcastHeadline').focus();
            },
            function(){
                subsModel.broadcast({
                    content: $$('broadcastHeadline').value
                }).then(function(resp){
                    updateHeadlines();
                })	
            }
        ),
        summary: new neModal(
            $$('playerSummary'),
            function(selectedplayer){
                state.activeItem = selectedplayer;
                subcontrols.playerID(selectedplayer.id);
                $$('playerSummaryHeadline').value = state.headlines[selectedplayer.id];
                fetcher({url: '/api/players/' + selectedplayer.id + '/status'})
                .then(function(x){
                    var now = new Date();
                    var data = JSON.parse(x.response).data;
                    $$('playerSummaryName').innerText = data.name;
                    $$('playerSummaryId').innerText = data.id;
                    $$('playerSummarySchedule').innerText = data.group;
                    $$('playerSummaryAddress').innerText = data.stats.ip_address;
                    $$('playerSummaryLastmod').innerText = DateFormatter(data.lastacc) + ' (' + DateDifference(data.lastacc) + ')';
                    var diff = (now.getTime()/1e3) - data.lastacc;
                    if(diff > 90){
                        $$('playerSummaryActivity').innerHTML = translated('player_inactive');
                    } else {
                        $$('playerSummaryActivity').innerHTML = data.stats.process_executable + (data.stats.process_status != '' ? ' &ndash; ' + data.stats.process_status : '');
                        if(['play', 'slideshow'].indexOf(data.stats.process_executable) != -1){
                            fetcher({url: '/api/files/list'})
                            .then(function(stats, x){
                                var data = JSON.parse(x.response).result;
                                $$('playerSummaryActivity').innerHTML = stats.process_executable + (stats.process_status != '' ? ' &ndash; ' + stats.process_status : '')
                                for(var i in data){
                                    if(data[i].id == stats.process_status){
                                        console.log(data[i], stats.process_status);
                                        $$('playerSummaryActivity').innerHTML = stats.process_executable + ' &ndash; ' + data[i].name;
                                        break;
                                    }
                                }
                            }.bind(null, data.stats))
                            .catch(function(e){
                                console.warn('Failed to do response');
                            })
                        }
                    }
                })
                .catch(function(e){
                    console.warn('Failed to do status request', e);
                });

                fetcher({url: '/api/subcontrols/get_state', method: 'post', body: {'id': selectedplayer.id}, json: true})
                .then(function(x){
                    var data = JSON.parse(x.response).result;
                    if((typeof data == 'undefined') || (data == null)) return;
                    subcontrols.volume(('volume' in data) ? Math.round(data.volume / 5).toString() : '20');
                })
                .catch(function(e){
                    console.warn('Failed to do state request', e);
                });
            },
            function(item){
                fetcher({
                    url: '/api/subcontrols/set_volume',
                    body: {'id': subcontrols.playerID(), 'volume': parseInt(subcontrols.volume()) * 5},
                    json: true,
                    method: 'post'
                }).then(function(x){
                    if(x.status > 300){
                        console.warn('Failed to set volume');
                    }
                }).catch(function(e){
                    console.warn('Failed to do response');
                });
            }
        ),
        screenshot: new neModal(
            $$('playerScreenshotPreview'),
            function(item){
                var screenshotView = $$('playerScreenshotImage');
                if(window.updateScreenshotTimer != null) clearInterval(window.updateScreenshotTimer);
                var updateScreenshotTimer = setInterval(PlayerScreenshotUpdate.bind(null, screenshotView, item.id), 5000);
                window.updateScreenshotTimer = updateScreenshotTimer;
                screenshotView.onerror = function(){
                    clearInterval(window.updateScreenshotTimer);
                    window.updateScreenshotTimer = null;
                    screenshotView.src = '/static/no-image-16x9.png';
                }
                screenshotView.src = '/thumb/' + item.id + '.png?rnd=' + Math.floor(Math.random() * 1e6);
            },
            function(){

            },
            function(){
                clearInterval(updateScreenshotTimer);
            }
        ),
        rename: new neModal(
            $$('playerRename'),
            function(item){
                $$('playerNewName').value = item.name;
                $$('playerNewName').focus();
            },
            function(item){
                var newName = $$('playerNewName').value.trim();
                if(newName != ''){
                    playersModel.rename({
                        player: item.id,
                        name: newName
                    }).then(function(resp){
                        playersList.update(resp);
                    });
                } else {
                    MessagePopup(translated('player_name_required'));
                }
            }
        )
    }

    function updatePlayers(){
        var selection = playersList.value; // saving "key" of current item
        playersModel.fetch().then(function(sel){ return function(r){
            playersList.update(r);
            if(sel != null)
            playersList.value = sel.id; // restoring selection by "key"
        }}(selection));
    }

    updatePlayers();
    updateHeadlines();
    setInterval(updatePlayers, 10000);
    schedulesModel.fetch().then(schedulesList.update.bind(schedulesList));
}
