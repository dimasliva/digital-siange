// schedules page ........ /

var state = {
    activeItem: null
}

function EditAction(item){
    location.href = '/edit/' + item.id + '/';
}

function RemoveAction(item){
    schedulesModel.remove({
        schedule: item.id
    }).then(schedulesList.update.bind(schedulesList));
}

function CopyAction(item){
    var newName = item.name;
    for(var i = 2; i < 100; i++){
        var newName = item.name + ' - ' + i.toString();
        var dublicates = schedulesModel.data.filter(function(x){
            return x.name == newName;
        }).length;
        if(dublicates < 1) break;
    }
    schedulesModel.copy({
        schedule: item.id,
        copy_name: newName
    }).then(schedulesList.update.bind(schedulesList));
}

//
// loadup ........ /
//
function loadup(){
    window.schedulesModel = new RestFactory({
        url: '/api/schedules/list',
        methods: {
            'remove': {
                url: '/api/schedules/remove'
            },
            'rename': {
                url: '/api/schedules/rename'
            },
            'copy': {
                url: '/api/schedules/copy'
            }
        }
    });
    
    window.modals = {
        add: new neModal(
            $$('confNew'),
            function(item){
                $$('confNewName').value = '';
                $$('confNewName').focus();
            },
            function(item){
                var groupname = $$('confNewName').value;
                if(groupname.trim() == ''){
                    MessagePopup(translated('schedule_name_required'));
                    return false;
                }
                if(window.schedulesModel.data.filter(function(x){ return x.name == groupname; }).length > 0){
                    MessagePopup(translated('schedule_exists'));
                    return false;
                }
                fetcher({
                    url: '/api/schedules/create',
                    method: 'post',
                    body: {'name': groupname},
                    json: true
                }).then(function(r){
                    return r.json();
                }).then(function(data){
                    location.href = '/edit/' + data.data + '/';
                });
            }
        ),
        rename: new neModal(
            $$('scheduleRename'),
            function(item){
                $$('scheduleRenameName').value = item.name;
                $$('scheduleRenameName').focus();
            },
            function(item){
                schedulesModel.rename({
                    schedule: item.id,
                    name: $$('scheduleRenameName').value
                }).then(schedulesList.update.bind(schedulesList));
            }
        ),
        remove: new neModal(
			$$('scheduleDelete'),
			function(item){
				$$('deletingSchedule').textContent = item.name;
			},
			function(item){
				schedulesModel.remove({
                    schedule: item.id
                }).then(schedulesList.update.bind(schedulesList));
                MessagePopup('schedule_deleted');
			}
		)
    }
    window.schedulesList = new BasicListView({
        elem: $$('groupList'),
        key: 'id',
        transform: function(item){
            return {
                image: '/static/icons/playlist.svg',
                text: '<b>' + item.name + '</b><div>Последнее изменение: ' + DateFormatter(item.lastmod) + '</div>',
                defaultAction: 'edit',
                actions: ['edit', 'rename', 'copy', 'delete']
            }
                
        },
        actions: {
            edit: {
                icon: '/static/icons/settings.svg',
                label: 'Настроить',
                handler: EditAction
            },
            delete: {
                icon: '/static/icons/delete.svg',
                label: 'Удалить',
                handler: function(item){
                    modals.remove.open(item);
                }
            },
            rename: {
                icon: '/static/icons/rename.svg',
                label: 'Переименовать',
                handler: function(item){
                    modals.rename.open(item);
                }
            },
            copy: {
                icon: '/static/icons/copy.svg',
                label: 'Скопировать',
                handler: CopyAction
            }
        }
    });
    schedulesModel.fetch().then(schedulesList.update.bind(schedulesList));
}
