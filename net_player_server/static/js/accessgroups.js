// setup users page ........ /

function AccessGroupAddClick(){
	modals.add.show();
}

function AccessGroupAddConfirmClick(){
	var name = $$('accessGroupAddName').value;
	if(name.trim() == ''){
		MessagePopup(translated('accessgroup_name_empty'));
		return;
	}
	accessGroupsModel.create({
		'name': name
	}).then(function(resp){
		accessGroupsList.update(resp);
		modals.add.hide();
	})
}

function AccessGroupAddCloseClick(){
	modals.add.hide();
}

function AccessGroupEditClick(){
	var selected = accessGroupsList.value;
	if(selected != null){
		modals.update.show();
		var permissions = selected.permissions.split(',');
		permissionsList.reset();
		permissions.forEach(function(x){
			permissionsList.value = x;
		});
	} else {
		MessagePopup(translated('accessgroup_required'));
	}
}

function AccessGroupEditConfirmClick(){
	var permissions = permissionsList.value.map(function(it){ return it.value; });
	accessGroupsModel.update({
		'group': accessGroupsList.value.id,
		'permissions': permissions
	}).then(function(resp){
		accessGroupsList.update(resp);
		modals.update.hide();
	})
}

function AccessGroupEditCloseClick(){
	modals.update.hide();
}

function AccessGroupDelClick(){
	var selected = accessGroupsList.value;
	if(selected != null){
		modals.remove.show();
	} else {
		MessagePopup(translated('accessgroup_required'));
	}
}

function AccessGroupDelConfirmClick(){
	accessGroupsModel.remove({
		group: accessGroupsList.value.id
	}).then(function(resp){
		modals.remove.hide();
		accessGroupsList.update(resp);
	})
}

function AccessGroupDelCloseClick(){
	modals.remove.hide();
}

//
// loadup ........ /
//
function loadup(){
    window.accessGroupsModel = new RestFactory({
        url: '/api/users/groups/list',
        methods: {
            'create': {
                url: '/api/users/groups/create'
            },
            'remove': {
                url: '/api/users/groups/remove'
            },
            'update': {
                url: '/api/users/groups/update'
            }
        }
    });

    window.accessGroupsList = new neListVw({
        elem: $$('accessGroupList'),
        multi: false,
        key: 'id',
        display: {
            'name': String
        },
        style: {
            'normal': 'listview-item icon-user'
        }
    });
    
    window.permissionsList = new neListVw({
    	elem: $$('accessGroupEditPermissions'),
    	multi: true,
    	key: 'value',
    	display: {
    		'text': String
    	}
    });
	permissionsList.update([
		{'text': translated('privileges_admin'), 'value': 'admin'},
		{'text': translated('privileges_upload'), 'value': 'upload'}
	]);
    window.modals = {
        add: new neModal($$('accessGroupAddModal')),
        update: new neModal($$('accessGroupEditModal')),
        remove: new neModal($$('accessGroupDelModal'))
    }

    accessGroupsModel.fetch().then(accessGroupsList.update);
    
}