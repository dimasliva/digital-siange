// players page ........ /

// select schedule
function PlayersAssignUser(){
	var selectedplayer = playersList.value;
	if(selectedplayer){
        userList.value = selectedplayer.userid;
		modals.assign.show();
    } else {
		MessagePopup(translated('player_required'));
    }
}
// select schedule confirm
function PlayersAssignUserConfirmClick(){
	var selectedplayer = playersList.value;
	var selecteduser = userList.value;
	if(selectedplayer && selecteduser){
		playersModel.setuser({
			player: selectedplayer.id,
			user: selecteduser.id
		}).then(function(resp){
			playersList.update(resp);
			modals.assign.hide();
		});
	} else {
		MessagePopup(translated('players_user_empty'));
	}
}
// select schedule close
function PlayersAssignUserCloseClick(){
	modals.assign.hide();
}

function PlayersForget(){
	var selectedplayer = playersList.value;
	if(selectedplayer){
		playersModel.forget({
			player: selectedplayer.id
		}).then(function(resp){
			playersList.update(resp);
		});
    } else {
		MessagePopup(translated('player_required'));
    }
}

// loadup ........ /

function loadup(){
    window.playersModel = new RestFactory({
        url: '/api/users/players',
        methods: {
            'setuser': {
                url: '/api/players/setuser'
            },
            'forget': {
            	url: '/api/players/forget'
            }
        }
    });
    window.usersModel = new RestFactory({
        url: '/api/users/list',
        methods: {}
    });
    window.playersList = new neListVw({
        elem: $$('playersList'),
        multi: false,
        key: 'id',
        display: function(elem, item, index){
            var namecol = document.createElement('div');
            namecol.style.display = 'inline-block';
            namecol.style.fontWeight = 'bold';
            namecol.style.width = '35%';
            namecol.style.marginLeft = '16px';
            namecol.textContent = item.name;
            var macspan = document.createElement('span');
            macspan.style.color = 'rgba(0, 0, 0, 0.3)';
            macspan.style.fontSize = '9pt';
            macspan.style.fontWeight = '400';
            macspan.style.fontFamily = '"Consolas", "Noto Mono", "Andale Mono", monospace'
            macspan.style.marginLeft = '16px';
            macspan.textContent = item.id;
            var userspan = document.createElement('span');
            userspan.style.float = 'right';
            userspan.textContent = item.username;
            namecol.appendChild(macspan);
            elem.appendChild(userspan);
            elem.appendChild(namecol);
        },
        style: {
            'normal': 'listview-item icon-player'
        }
    });
    window.userList = new neListVw({
        elem: $$('userList'),
        multi: false,
        key: 'id',
        display: {
            'username': String
        },
        style: {
            'normal': 'listview-item icon-user'
        }
    });

    window.modals = {
        assign: new neModal($$('playersUser'))
    }
    
    playersModel.fetch().then(function(resp){
        playersList.update(resp.sort(function(a, b){
            return a.id.localeCompare(b.id);
        }));
    })
    usersModel.fetch().then(userList.update);
}
