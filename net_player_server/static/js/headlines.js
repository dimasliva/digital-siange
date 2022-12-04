// headlines page ........ /

var state = {
    activeItem: null
}

function HeadlinesBroadcastClick(){
	$$('broadcastHeadline').value = '';
    $$('broadcastHeadline').focus();
    modals.broadcast.show();
}

function HeadlinesEditConfirmClick(){
	subsModel.write({
        player: subsModel.current,
        content: $$('playerHeadline').value
    }).then(function(resp){
        playersList.update(resp);
        HeadlinesEditCancelClick();
    })
}

function HeadlinesEditCancelClick(){
    subsModel.current = null;
	modals.edit.hide();
}

function HeadlinesBroadcastConfirmClick(){
	subsModel.broadcast({
        content: $$('broadcastHeadline').value
    }).then(function(resp){
        playersList.update(resp);
        HeadlinesBroadcastCancelClick();
    })	
}

function HeadlinesBroadcastCancelClick(){
	modals.broadcast.hide();
}

function updatePlayers(){
    var selection = playersList.value; // saving "key" of current item
    subsModel.fetch().then(function(sel){ return function(r){
        playersList.update(r);
        if(sel != null)
        playersList.value = sel.id; // restoring selection by "key"
    }}(selection));
}

function HeadlinesEditAction(item){
	subsModel.current = item.id;
	$$('playerHeadline').value = item.text;
    $$('playerHeadline').focus();
    modals.edit.show();
}

// loadup ........ /

function loadup(){
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
    window.playersList = new BasicListView({
        elem: $$('playersList'),
        key: 'id',
        transform: function(item){
            return {
                image: '/static/16/video-display.png',
                text: '<b>' + item.name + '</b>' + (item.text != null ? '<div>' + item.text + '</div>' : '<div class="no-items">Строка не установлена</div>'),
                defaultAction: 'set_headline',
                actions: ['set_headline']
            }
        },
        actions: {
            set_headline: {
                icon: '/static/icons/rename.svg',
                label: 'Set headline',
                handler: function(item){
                    HeadlinesEditAction(item);
                }
            }
        }
    })
    /* new neListVw({
        elem: $$('playersList'),
        multi: false,
        key: 'id',
        display: function(elem, item, index){
            elem.style.display = 'flex';
            var namecol = document.createElement('div');
            namecol.style.display = 'inline-block';
            namecol.style.fontWeight = 'bold';
            namecol.style.width = '35%';
            namecol.style.marginLeft = '16px';
            namecol.textContent = item.name;
            var textcol = document.createElement('div');
            textcol.style.textOverflow = 'ellipsis';
            textcol.style.overflow = 'hidden';
            textcol.style.whiteSpace = 'nowrap';
            textcol.style.display = 'inline-block';
            textcol.style.width = '65%';
            textcol.textContent = item.text;
            elem.appendChild(namecol);
            elem.appendChild(textcol);
        },
        style: {
            'normal': 'listview-item icon-player'
        }
    }); */
    
    window.modals = {
        edit: new neModal($$('headlineEdit')),
        broadcast: new neModal($$('headlineBroadcast'))
    }

    updatePlayers();
    setInterval(updatePlayers, 10000);
}
