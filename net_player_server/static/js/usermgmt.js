// setup users page ........ /

function UserAddClick(){
    $$('userAddLogin').value = '';
    $$('userAddPassword').value = '';
    modals.add.show();
}

function UserSetPasswordClick(){
    var selected = usersList.value;
    if(!selected){
        MessagePopup('users_edit_empty');
        return false;
    }
    usersModel.current = selected.id;
    editorViewModel.login(selected.username);
    editorViewModel.password('');
    editorViewModel.passwordRepeat('');
    editorViewModel.group(selected.group);
    modals.setpass.show();
}

function UserDelClick(){
    var selected = usersList.value;
    if(!selected){
        MessagePopup('users_edit_empty');
        return false;
    }
    usersModel.current = selected.id;
    modals.remove.show()
}

function UserAddSaveClick(){
    var user = $$('userAddLogin').value;
    var pass = $$('userAddPassword').value;
    if(user == ''){
        MessagePopup('users_username_empty');
        return false;
    }
    if(pass == ''){
        MessagePopup('users_password_empty');
        return false;
    }
    usersModel.create({
        username: user,
        password: pass
    }).then(function(resp){
        usersList.update(resp);
        UserAddCloseClick();
    })
}

function UserAddCloseClick(){
    modals.add.hide();
}

function UserEditSaveClick(){
	var login = editorViewModel.login();
	var group = editorViewModel.groupAsInt();
    var pass = editorViewModel.password();
    var repeatpass = editorViewModel.passwordRepeat();
    if((pass != '') && (repeatpass == '')){
        MessagePopup('users_repeat_password');
        return false;
    }
    if(repeatpass != pass){
        MessagePopup('users_missmatch_password');
        return false;
    }
    if(login.trim() == ''){
        MessagePopup('users_empty_login');
        return false;
    }
    if(pass == '') pass = null;
    usersModel.update({
        id: usersModel.current,
        username: login,
        group: group,
        password: pass,
        
    }).then(function(resp){
    	usersList.update(resp);
        UserEditCloseClick();
    });
}

function UserEditCloseClick(){
    modals.setpass.hide();
}

function UserDelConfirmClick(){
    usersModel.remove({
        id: usersModel.current
    }).then(function(resp){
        usersList.update(resp);
        UserDelCloseClick();
    });
}

function UserDelCloseClick(){
    modals.remove.hide();
}
//
// loadup ........ /
//
function loadup(){
    window.usersModel = new RestFactory({
        url: '/api/users/list',
        methods: {
            'create': {
                url: '/api/users/create'
            },
            'remove': {
                url: '/api/users/remove'
            },
            'update': {
                url: '/api/users/update'
            }
        }
    });
    window.groupsModel = new RestFactory({
    	url: '/api/users/groups/list'
    })

    window.usersList = new neListVw({
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
        add: new neModal($$('userAddModal')),
        setpass: new neModal($$('userEditModal')),
        remove: new neModal($$('userDelModal'))
    }
    
    window.editorViewModel = {
        login: ko.observable(''),
        password: ko.observable(''),
        passwordRepeat: ko.observable(''),
        group: ko.observable('')
    };
    window.editorViewModel.groupAsInt = ko.computed(function(){
        return parseInt(window.editorViewModel.group());
    });
    ko.applyBindings(editorViewModel);


    usersModel.fetch().then(usersList.update);
    groupsModel.fetch().then(function(list){
    	var selector = document.getElementById('userEditGroup');
    	selector.length = 0;
    	for(var i = 0; i < list.length; i++){
    		selector.add(new Option(list[i].name, list[i].id));
    	}
    });
    
}
