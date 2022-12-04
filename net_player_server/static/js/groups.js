// groups page ........ /

var state = {};

// update group include
function GroupEditIncludeClick(){
    var selectedGroup = state.activeItem;
    var selectedPlayer = excludedPlayersList.value;
    if(selectedGroup && selectedPlayer){
        groupsModel.include({
            player: selectedPlayer.id,
            group: selectedGroup.id
        })
        .then(groupsList.update.bind(groupsList))
        .then(function(){
            var included = groupsModel
            .find('id', selectedGroup.id)
            .players;
            includedPlayersList.update(included);
            excludedPlayersList.update(collectionDiff(
                playersModel.data,
                included,
                function(a, b){ return a.id == b.id; }
            ));
        })
    } else {
        MessagePopup(translated('player_required'));
    }
}
// update group exclude
function GroupEditExcludeClick(){
    var selectedGroup = state.activeItem;
    var selectedPlayer = includedPlayersList.value;
    if(selectedGroup && selectedPlayer){
        groupsModel.exclude({
            player: selectedPlayer.id,
            group: selectedGroup.id
        })
        .then(groupsList.update.bind(groupsList))
        .then(function(){
            var included = groupsModel
            .find('id', selectedGroup.id)
            .players;
            includedPlayersList.update(included);
            excludedPlayersList.update(collectionDiff(
                playersModel.data,
                included,
                function(a, b){ return a.id == b.id; }
            ));
        })
    } else {
        MessagePopup(translated('player_required'));
    }
}

function GroupRemoveAction(item){
    groupsModel.remove({
        group: item.id
    }).then(groupsList.update.bind(groupsList));
}

function SetScheduleAction(chosenSchedule){
    var chosenGroup = state.activeItem;
    groupsModel.assign({
        group: chosenGroup.id,
        schedule: chosenSchedule.id
    }).then(function(){
        MessagePopup(translated('group_schedule_set'));
    });
    modals.schedule.hide();
}
//
// loadup ........ /
//
function loadup(){
    window.playersModel = new RestFactory({
        url: '/api/players/list',
        methods: {
            'status': {
                url: '/api/players/status'
            }
        }
    });
    window.groupsModel = new RestFactory({
        url: '/api/groups/list',
        methods: {
            'create': {
                url: '/api/groups/create',
                reload: false
            },
            'remove': {
                url: '/api/groups/remove'
            },
            'assign': {
                url: '/api/groups/assign',
                reload: false
            },
            'include': {
                url: '/api/groups/include'
            },
            'exclude': {
                url: '/api/groups/exclude'
            }
        }
    });
    // new api test
    window.schedulesModel = new RestFactory({
        url: '/api/schedules/list',
        methods: {
            'remove': {
                url: '/api/schedules/remove'
            }
        }
    });

    window.schedulesList = new BasicListView({
        elem: $$('scheduleList'),
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

    window.groupsList = new BasicListView({
        elem: $$('groupsList'),
        key: 'id',
        transform: function(item){
            return {
                image: '/static/icons/group.svg',
                text: '<b>' + item.name + '</b><div>Плееров в группе: ' + item.players.length + '</div>',
                defaultAction: item.id == 0 ? 'set_schedule' : 'edit',
                actions: item.id == 0 ? ['set_schedule'] : ['set_schedule', 'edit', 'delete']
            }
        },
        actions: {
            edit: {
                icon: '/static/icons/rename.svg',
                label: 'Изменить',
                handler: function(item){
                    modals.edit.open(item);
                }
            },
            delete: {
                icon: '/static/icons/delete.svg',
                label: 'Удалить',
                handler: GroupRemoveAction
            },
            set_schedule: {
                icon: '/static/icons/schedule.svg',
                label: 'Выбрать расписание',
                handler: function(item){
                    modals.schedule.open(item);
                }
            }
        }
    });

    window.includedPlayersList = new BasicListView({
        elem: $$('groupIncludedList'),
        key: 'id',
        transform: function(item){
            return {
                image: '/static/icons/online.svg',
                text: item.name,
                defaultAction: 'exclude',
                actions: ['exclude']
            }
        },
        actions: {
            exclude: {
                icon: '/static/icons/remove.svg',
                label: 'Exclude',
                handler: function(item){
                    groupsModel.exclude({
                        player: item.id,
                        group: state.activeItem.id
                    })
                    .then(groupsList.update.bind(groupsList))
                    .then(function(){
                        var included = groupsModel
                        .find('id', state.activeItem.id)
                        .players;
                        includedPlayersList.update(included);
                        excludedPlayersList.update(collectionDiff(
                            playersModel.data,
                            included,
                            function(a, b){ return a.id == b.id; }
                        ));
                    });
                }
            }
        }
    });

    window.excludedPlayersList = new BasicListView({
        elem: $$('groupExcludedList'),
        key: 'id',
        transform: function(item){
            return {
                image: '/static/icons/online.svg',
                text: item.name,
                defaultAction: 'include',
                actions: ['include']
            }
        },
        actions: {
            include: {
                icon: '/static/icons/add.svg',
                label: 'Include',
                handler: function(item){
                    groupsModel.include({
                        player: item.id,
                        group: state.activeItem.id
                    })
                    .then(groupsList.update.bind(groupsList))
                    .then(function(){
                        var included = groupsModel
                        .find('id', state.activeItem.id)
                        .players;
                        includedPlayersList.update(included);
                        excludedPlayersList.update(collectionDiff(
                            playersModel.data,
                            included,
                            function(a, b){ return a.id == b.id; }
                        ));
                    });
                }
            }
        }
    });
    
    window.modals = {
        add: new neModal(
            $$('groupNew'),
            function(ctx){
                $$('groupNewName').value = '';
                $$('groupNewName').focus();
            },
            function(ctx){
                var groupName = $$('groupNewName').value;
                if(groupName.trim() != ''){
                    groupsModel.create({
                        name: groupName
                    })
                    .then(function(r){
                        return r.json();
                    })
                    .then(function(data){
                        var newGroupId = data.result;
                        groupsModel.fetch()
                        .then(groupsList.update.bind(groupsList))
                        .then(function(){
                            MessagePopup(translated('group_create_done'));
                            modals.edit.open(groupsList.get(newGroupId))
                        })
                        .catch(function(e){
                            MessagePopup(translated('group_create_failed'));
                            console.log(e);
                        });
                    });
                    $$('groupNewName').value = '';
                } else {
                    MessagePopup(translated('groups_name_required'));
                    return false;
                }
            }
        ),
        schedule: new neModal(
            $$('groupSchedule'),
            function(ctx){
                state.activeItem = ctx;
            }
        ),
        edit: new neModal(
            $$('groupEdit'),
            function(ctx){
                state.activeItem = ctx;
                var included = ctx.players;
                includedPlayersList.update(included);
                excludedPlayersList.update(collectionDiff(
                    playersModel.data,
                    included,
                    function(a, b){ return a.id == b.id; }
                ));
            },
        )
    }

    groupsModel.fetch().then(groupsList.update.bind(groupsList));
    schedulesModel.fetch().then(schedulesList.update.bind(schedulesList));
    playersModel.fetch();
}
