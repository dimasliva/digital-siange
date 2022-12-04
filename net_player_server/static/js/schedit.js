// schedule editor page ........ /

var state = {
	activeItem: null,
	activeTaskType: null,
	currentFolder: null
};

// add task
function TaskAddClick(){
    taskTypesList.selected = -1;
    taskTypesList.render();
	modals.add.show();
}
// add task confirm
function TaskAddConfirmClick(tasktype){
	if(tasktype){
		if(typeof schedulesModel.tasks == 'undefined')
			schedulesModel.tasks = [];
		var schedule = editorViewModel.hasDefaultTask() ? [{ hour: '00', minute: '00' }, { hour: '00', minute: '00' }] : null;
		switch(tasktype.value){
			case 'play':
			case 'slideshow':
			case 'doc':
				schedulesModel.tasks.push({'method': tasktype.value, 'resource': [], 'schedule': schedule});
				break;
			case 'stream':
			case 'web':
				schedulesModel.tasks.push({'method': tasktype.value, 'resource': '', 'schedule': schedule});
				break;
            case 'sleep':
			    schedulesModel.tasks.push({'method': tasktype.value, 'resource': null, 'schedule': [
                    { hour: '00', minute: '00' }, { hour: '06', minute: '00' }
                ]});
                break;
            case 'update':
			default:
				schedulesModel.tasks.push({'method': tasktype.value, 'resource': null, 'schedule': schedule});
				break;

		}
		tasksList.update(schedulesModel.tasks);
		// NOTE: ugly ugly hack
		TaskEditAction(schedulesModel.tasks[schedulesModel.tasks.length - 1], schedulesModel.tasks.length - 1);
		modals.add.hide();
	} else {
		MessagePopup(translated('task_required'));
	}
}
// add task cancel
function TaskAddCloseClick(){
	modals.add.hide();
}
// remove task
function TaskRemoveAction(item, index){
	if(item){
		var task = schedulesModel.tasks.splice(index, 1);
		if(task[0].schedule == null){
			editorViewModel.hasDefaultTask(false);
		}
		tasksList.update(schedulesModel.tasks);
		MessagePopup(translated('task_removed'));
	} else {
		MessagePopup(translated('task_required'));
	}
}

function updateRestList(type){
	switch(type){
		case 'play':
			suffix = new RegExp('.*\.(mp4|webm|mkv|mpg)','i');
			break;
		case 'slideshow':
			suffix = new RegExp('.*\.(jpg|png|jpeg)','i');
			break;
		case 'doc':
			suffix = new RegExp('^.*\.pdf$','i');
			break;
		default:
			suffix = new RegExp('.*','i');
	}
	var rlist = filesModel.data.filter(function(x){
		return (x.folder == state.currentFolder) && (x.isFolder || suffix.test(x.id));
	});
	if(state.currentFolder != null){
		rlist.unshift({
			special: 'up'
		});
	}

	excludedList.update(rlist);
}

// update task
// TODO: REWORK THIS
function TaskEditAction(selected, index){
	if(selected){
		state.activeItem = index;
		MessagePopup(translated('task_loaded'));
		// DISPLAYING EDIT DIALOG
		var task = new TaskWrapper();
        task.fromStruct(selected);
		var suffix;
		editorViewModel.taskType(task.type);
		state.activeTaskType = task.type;
		switch(task.type){
			case 'play':
				suffix = new RegExp('.*\.(mp4|webm|mkv|mpg)','i');
				break;
			case 'slideshow':
				suffix = new RegExp('.*\.(jpg|png|jpeg)','i');
				break;
			case 'doc':
			    suffix = new RegExp('^.*\.pdf$','i');
                break;
			default:
				suffix = new RegExp('.*','i');
		}
		switch(task.type){
		case 'play':
		case 'slideshow':
		case 'doc':
			if(task.type == 'play'){
				hideContainer('slideshowIntervalBox');
			} else {
				showContainer('slideshowIntervalBox');
				editorViewModel.taskSlideshowDelay = task.slideshowDelay;
			}
			showContainer('taskFilesBox');
			hideContainer('taskUrlBox');
			hideContainer('taskStreamBox');
			console.log(task.arguments);
			var plist = task.arguments.reduce(function(a, x){
				for(var i = 0; i < filesModel.data.length; i++){
					if(filesModel.data[i].id == x.id){
						a.push(filesModel.data[i]);
						return a;
					}
				}
				return a;
			}, []);
			/*
			var plist = availableFiles.filter(function(args, x){
				return args.indexOf(x.id) != -1;
			}.bind(null, task.arguments));
			*/
			console.log(plist);
			/*
			var rlist = collectionDiff(
				availableFiles,
				task.arguments,
				function(a, b){
					return a.id == b;
				}
			);
			*/
			includedList.update(plist);
			updateRestList(task.type);
			break;
		case 'stream':
			hideContainer('taskFilesBox');
			hideContainer('taskUrlBox');
			hideContainer('slideshowIntervalBox');
			showContainer('taskStreamBox');
			var isLocal = (new RegExp(location.host)).test(task.arguments);
			$$('taskLocalStreams').value = (isLocal ? task.arguments.replace(' live=1','') : 'custom');
			if(!isLocal) $$('taskStreamURL').removeAttribute('readonly', false);
			$$('taskStreamURL').value = task.arguments.replace(' live=1','');
			break;
		case 'web':
			hideContainer('taskFilesBox');
			hideContainer('taskStreamBox');
			hideContainer('slideshowIntervalBox');
			showContainer('taskUrlBox');
			$$('taskUrlHint').innerHTML = translated('task_web_example');
			$$('taskUrl').value = task.arguments;
			break;
		case 'sleep':
		default:
			hideContainer('taskUrlBox');
			hideContainer('taskFilesBox');
			hideContainer('taskStreamBox');
			hideContainer('slideshowIntervalBox');
			break;
		}
		switch(task.scheduleType){
            case 'default':
                editorViewModel.taskScheduleType('default');
				editorViewModel.taskTimeStart('');
				editorViewModel.taskTimeEnd('');
                break;
            case 'interval':
                editorViewModel.taskScheduleType('interval');
                if(task.schedule[0].hour == '*'){
                    editorViewModel.taskScheduleMode('hour');
                    editorViewModel.taskTimeStart(task.schedule[0].minute);
                    editorViewModel.taskTimeEnd(task.schedule[1].minute);
                } else {
                    editorViewModel.taskScheduleMode('exact');
                    editorViewModel.taskTimeStart(formatDate(task.schedule[0]));
                    editorViewModel.taskTimeEnd(formatDate(task.schedule[1]));
                }
                break;
            case 'oneshot':
                editorViewModel.taskScheduleType('oneshot');
				editorViewModel.taskTimeEnd('');
                if(task.schedule[0].hour == '*'){
                    editorViewModel.taskScheduleMode('hour');
                    editorViewModel.taskTimeStart(task.schedule[0].minute);
                } else {
                    editorViewModel.taskScheduleMode('exact');
                    editorViewModel.taskTimeStart(formatDate(task.schedule[0]));
                }
                break;
		}
		modals.edit.show()
	} else {
		MessagePopup(translated('task_required'));
	}
}
// update task confirm
function TaskEditConfirmClick(){
	var selected = state.activeItem;
	var isValid = true;
	// rough validation
	// check hourly
	var scType = editorViewModel.taskScheduleType();
	var scStart = editorViewModel.taskTimeStart();
	var scEnd = editorViewModel.taskTimeEnd();
	var scMode = editorViewModel.taskScheduleMode();

	if((scType == 'interval') && (scStart == scEnd)){
		isValid = false;
	}
	if(scType != 'default'){
		if(scMode == 'hour'){
			if(!(/^[0-9]+$/.test(scStart)) || (parseInt(scStart) > 59)){
				isValid = false;
			}
			if((scType == 'interval') && !(/^[0-9]+$/.test(scEnd)) || (parseInt(scEnd) > 59)){
				isValid = false;
			}
		} else {
			if(!(/^[0-9]{1,2}:[0-9]{1,2}$/.test(scStart))){
				isValid = false;
			}
			if((scType == 'interval') && !(/^[0-9]{1,2}:[0-9]{1,2}$/.test(scEnd))){
				isValid = false;
			}
		}
	} else {
		editorViewModel.hasDefaultTask(true);
	}
	if(!isValid){
		MessagePopup('Время для задачи указано в неверном формате');
		return false;
	}
	switch(schedulesModel.tasks[selected].method){
		case 'play':
			schedulesModel.tasks[selected].resource = includedList.data.map(function(x){
				return { id: x.id, folder: x.isFolder };
			});
			break;
		case 'slideshow':
		case 'doc':
			schedulesModel.tasks[selected].resource = includedList.data.map(function(x){
				return { id: x.id, folder: x.isFolder };
			});
			var slideshowDelay = parseInt(editorViewModel.taskSlideshowDelay);
			if(slideshowDelay < 1){
				MessagePopup('Интервал показа должен быть больше или равен 1 с');
				return false;
			}
			schedulesModel.tasks[selected].delay = slideshowDelay;
			break;
		case 'web':
			schedulesModel.tasks[selected].resource = $$('taskUrl').value;
			break;
		case 'stream':
			var stream_url = $$('taskStreamURL').value;
			schedulesModel.tasks[selected].resource = $$('taskStreamURL').value + ((/^rtmp:/.test(stream_url) && !(/live=1$/.test(stream_url))) ? ' live=1' : '');
			break;
	}
	var scheduleBegin = $$('scheduleBegin').value.split(':');
	var scheduleEnd = $$('scheduleEnd').value.split(':');
	var startAt = scMode == 'hour' ? {'hour': '*', 'minute': scheduleBegin[0]} : {'hour': scheduleBegin[0], 'minute': scheduleBegin[1]};
	var endAt = scMode == 'hour' ? {'hour': '*', 'minute': scheduleEnd[0]} : {'hour': scheduleEnd[0], 'minute': scheduleEnd[1]};
	switch(scType){
		case 'interval':
			schedulesModel.tasks[selected].schedule = [startAt, endAt];
			break;
		case 'oneshot':
			schedulesModel.tasks[selected].schedule = [startAt];
			break;
		case 'default':
		default:
			schedulesModel.tasks[selected].schedule = null;
	}
	tasksList.update(schedulesModel.tasks);
    TaskEditCloseClick();
}
// update task cancel
function TaskEditCloseClick(){
	modals.edit.hide();
}

// submit schedule
function TaskCommitClick(){
    // check for multiple default tasks
    var default_task = 0;
    for(var i = 0; i < schedulesModel.tasks.length; i++){
        if(schedulesModel.tasks[i].schedule == null){
            default_task++;
        }
    }
    if(default_task > 1){
        MessagePopup(translated('many_default_tasks'));
        return false;
    } else if(default_task == 0) {
        MessagePopup(translated('no_default_task'));
        return false;
    }
	schedulesModel.write({
		id: schedulesModel.id,
		description: schedulesModel.tasks
	}).then(function(){
		MessagePopup(translated('schedule_saved'))
	});
	schedulesModel.fetch();
}

// helper: schedule type set
function TaskScheduleTypeSet(val){
	switch(val){
		case 'default':
			document.querySelector('#scheduleRecurrenceSection').style.visibility = 'hidden';
			document.querySelector('#scheduleEndSection').style.visibility = 'hidden';
			document.querySelector('#scheduleBeginSection').style.visibility = 'hidden';
			break;
		case 'interval':
			document.querySelector('#scheduleRecurrenceSection').style.visibility = 'visible';
			document.querySelector('#scheduleEndSection').style.visibility = 'visible';
			document.querySelector('#scheduleBeginSection').style.visibility = 'visible';
			break;
		case 'oneshot':
			document.querySelector('#scheduleRecurrenceSection').style.visibility = 'visible';
			document.querySelector('#scheduleEndSection').style.visibility = 'hidden';
			document.querySelector('#scheduleBeginSection').style.visibility = 'visible';
			break;
	}
}

function displaySchedule(schedule){
	if(schedule.length == 2){
		if(schedule[0].hour == '*'){
			return 'С ' + schedule[0].minute + ' по ' + schedule[1].minute + ' минуту каждый час';
		} else {
			return 'С ' + schedule[0].hour + ':' + schedule[0].minute + ' до ' + schedule[1].hour + ':' + schedule[1].minute;
		}
	} else {
		if(schedule[0].hour == '*'){
			return 'В ' + schedule[0].minute + ' каждый час';
		} else {
			return 'В ' + schedule[0].hour + ':' + schedule[0].minute;
		}
	}
}

function formatDate(schedule){
	return (parseInt(schedule.hour) < 10 ? '0' + parseInt(schedule.hour) : schedule.hour) + ':' + (parseInt(schedule.minute) < 10 ? '0' + parseInt(schedule.minute) : schedule.minute);
}

//
// loadup ........ /
//
function loadup(){
    var schedule_id = decodeURIComponent(/\/edit\/([^\/]*)/.exec(location.href)[1]);

    var documentRegex = new RegExp('\.(pdf|doc|docx|odt)', 'i');
    var spreadsheetRegex = new RegExp('\.(xls|xlsx|ods)', 'i');
    var presentationRegex = new RegExp('\.(ppt|pptx|pps|ppsx|odp)', 'i');
	var taskTypeIcons = {
		'play': '/static/icons/type-video.svg', // '/static/16/video-x-generic.png',
		'slideshow': '/static/icons/type-image.svg', // '/static/16/image-x-generic.png',
		'web': '/static/icons/type-web.svg', // '/static/16/text-html.png',
		'doc': '/static/icons/type-document.svg', // '/static/16/office-spreadsheet.png',
		'stream': '/static/icons/type-stream.svg', // '/static/16/stream.png',
		'sleep': '/static/icons/monitor.svg', // '/static/16/display-sleep.png',
		'default': '/static/icons/monitor.svg', // '/static/16/video-display.png'
	};
	var methodDescription = {
		play: 'Видео',
		slideshow: 'Слайдшоу',
		web: 'Web-страница',
		stream: 'Трансляция',
		doc: 'Документы'
	};

    editorViewModel = {
        taskTimeStart: ko.observable(''),
        taskTimeEnd: ko.observable(''),
        taskScheduleType: ko.observable(''),
        taskScheduleMode: ko.observable(''),
        taskType: ko.observable(''),
		taskSlideshowDelay: ko.observable(5),
		hasDefaultTask: ko.observable(false)
    }
    editorViewModel.taskScheduleType.subscribe(function(t){
        switch(t){
            case 'default':
                document.querySelector('#scheduleRecurrenceSection').style.visibility = 'hidden';
                document.querySelector('#scheduleEndSection').style.visibility = 'hidden';
                document.querySelector('#scheduleBeginSection').style.visibility = 'hidden';
                break;
            case 'interval':
                document.querySelector('#scheduleRecurrenceSection').style.visibility = 'visible';
                document.querySelector('#scheduleEndSection').style.visibility = 'visible';
                document.querySelector('#scheduleBeginSection').style.visibility = 'visible';
                break;
            case 'oneshot':
                document.querySelector('#scheduleRecurrenceSection').style.visibility = 'visible';
                document.querySelector('#scheduleEndSection').style.visibility = 'hidden';
                document.querySelector('#scheduleBeginSection').style.visibility = 'visible';
                break;
        }
    });
    editorViewModel.disableDefaultType = ko.computed(function(){
        var type = editorViewModel.taskType();
        return (type == 'sleep') || editorViewModel.hasDefaultTask();
    });
    editorViewModel.disableOneshotType = ko.computed(function(){
        var type = editorViewModel.taskType();
        return (type == 'sleep') || (type == 'stream') || (type == 'web');
    });

    ko.applyBindings(editorViewModel);

    window.filesModel = new RestFactory({
        url: '/api/files/list_all',
        methods: {}
    });
    window.schedulesModel = new RestFactory({
        url: '/api/schedules/list',
        methods: {
            'read': {
                url: '/api/schedules/read',
                reload: false
            },
            'write': {
                url: '/api/schedules/save',
                reload: false
            }
        }
    });
    window.tasksModel = new RestFactory({
        url: '/api/schedules/read',
        methods: {}
    });
    window.schedulesModel.id = schedule_id;
	window.excludedList = new BasicListView({
		elem: $$('restList'),
		transform: function(item){
			var image = '';
			if(item.special == 'up') {
				return {
					image: '/static/icons/folder-up.svg',
					text: 'Up',
					defaultAction: 'up',
					actions: []
				}
			}
			if(item.isFolder){
				image = '/static/icons/folder.svg';
		    } else if(documentRegex.test(item.name)){
		        image = '/static/document-generic-64.png';
		    } else if(spreadsheetRegex.test(item.name)){
                image = '/static/document-spreadsheet-64.png';
            } else if(presentationRegex.test(item.name)){
                image = '/static/document-presentation-64.png';
		    } else {
    			image = '/thumb/' + encodeURIComponent(item.id) + '.jpg';
    		}
			return {
				image: image,
				text: '<b>' + item.name + '</b>' + (item.isFolder ? '' : '<div>Size: ' + fuzzyLength(item.size) + '</div>'),
				defaultAction: item.isFolder ? 'open' : 'add',
				actions: item.isFolder ? ['open', 'add_folder'] : ['add']
			}
		},
		actions: {
			open: {
				icon: '/static/icons/openfolder.svg',
				label: 'Открыть',
				handler: function(item){
					state.currentFolder = item.id;
					updateRestList(state.activeTaskType);
				}
			},
			up: {
				icon: '/static/icons/openfolder.svg',
				label: 'Вверх',
				handler: function(item){
					state.currentFolder = null;
					updateRestList(state.activeTaskType);
				}
			},
			add: {
				icon: '/static/icons/add.svg',
				label: 'Добавить',
				handler: function(item, index){
					includedList.add(excludedList.get(index));
				}
			},
			add_folder: {
				icon: '/static/icons/addfolder.svg',
				label: 'Добавить папку',
				handler: function(item, index){
					includedList.add(excludedList.get(index));
				}
			}
		}
	});
	window.includedList = new BasicListView({
		elem: $$('playList'),
		transform: function(item){
			var image = '';
			if(item.isFolder){
				image = '/static/icons/folder.svg';
		    } else if(documentRegex.test(item.name)){
		        image = '/static/document-generic-64.png';
		    } else if(spreadsheetRegex.test(item.name)){
                image = '/static/document-spreadsheet-64.png';
            } else if(presentationRegex.test(item.name)){
                image = '/static/document-presentation-64.png';
		    } else {
    			image = '/thumb/' + encodeURIComponent(item.id) + '.jpg';
    		}
			return {
				image: image,
				text: '<b>' + item.name + '</b>',
				defaultAction: 'remove',
				actions: ['up', 'down', 'remove']
			}
		},
		actions: {
			open: {
				icon: null,
				label: 'Открыть',
				handler: function(){}
			},
			remove: {
				icon: '/static/icons/remove.svg',
				label: 'Убрать',
				handler: function(item, index){
					includedList.cut(index);
				}
			},
			up: {
				icon: '/static/icons/up.svg',
				label: 'Вверх',
				handler: function(item, index){
					includedList.moveUp(index);
				}
			},
			down: {
				icon: '/static/icons/down.svg',
				label: 'Вниз',
				handler: function(item, index){
					includedList.moveDown(index);
				}
			}
		}
	});
	window.tasksList = new BasicListView({
		elem: $$('taskList'),
		key: 'id',
		transform: function(item) {
			var taskDescription = '<b>' + methodDescription[item.method] + '</b>';
			if(['play', 'slideshow', 'doc'].includes(item.method)){
				taskDescription += '<div>' + item.resource.length + ' ' + NumericL11n(item.resource.length, 'элемент', "элемента", "элементов") + '</div>';
			} else {
				taskDescription += '<div>' + item.resource + '</div>';
			}
			taskDescription += '<div>' + (item.schedule != null ? displaySchedule(item.schedule) : translated('task_default')) + '</div>';
			return {
				image: item.method in taskTypeIcons ? taskTypeIcons[item.method] : taskTypeIcons.default,
				text: taskDescription,
				defaultAction: 'edit',
				actions: ['edit', 'delete']
			}
		},
		actions: {
			edit: {
				icon: '/static/icons/rename.svg',
				label: 'Изменить',
				handler: TaskEditAction
			},
			delete: {
				icon: '/static/icons/delete.svg',
				label: 'Удалить',
				handler: TaskRemoveAction
			}
		}
	});
    window.taskTypesList = new BasicListView({
		elem: $$('taskType'),
		key: 'value',
		transform: function(item){
			return {
				image: taskTypeIcons[item.value],
				text: item.text,
				defaultAction: 'create',
				actions: []
			}
		},
		actions: {
			create: {
				icon: null,
				label: 'Create task',
				handler: function(item){
					TaskAddConfirmClick(item);
				}
			}
		}
	});
    window.taskTypesList.update([
        {text: translated('task_video'), value: "play", icon: "icon-video"},
        {text: translated('task_slideshow'), value: "slideshow", icon: "icon-image"},
        {text: translated('task_document'), value: "doc", icon: "icon-document"},
        {text: translated('task_web'), value: "web", icon: "icon-web"},
        {text: translated('task_stream'), value: "stream", icon: "icon-stream"},
        {text: translated('task_sleep'), value: "sleep", icon: "icon-sleep"}
    ]);
    filesModel.fetch();
    schedulesModel.updateTasks = function(gid){
        return function(){
            this.read({ schedule: gid })
            .then(function(resp){
            	return resp.json();
            })
            .then(function(data){
                schedulesModel.tasks = data.data.schedule;
                schedulesModel.name = data.data.name;
                $$('scheduleName').innerText = data.data.name;
				if(schedulesModel.tasks.filter(function(x){ return x.schedule == null }).length > 0){
					editorViewModel.hasDefaultTask(true);
				}
                tasksList.update(schedulesModel.tasks);
            });
        }
    }(schedule_id);
    schedulesModel.updateTasks();

    window.modals = {
        add: new neModal(
			$$('taskNew')
		),
        edit: new neModal($$('taskEdit'))
    }

	fetcher({url: 'http://' + location.host.split(':')[0] + ':5080/LiveApp/rest/broadcast/getList/0/10'})
	.then(function(x){
		var res = new brightFuture();
		try {
			var data = JSON.parse(x.response);
			res.resolve(data);
		} catch(e) {
			res.reject(null);
		} finally {
			return res;
		}
	})
	.then(function(data){
		for(var i in data){
			$$('taskLocalStreams').add(new Option(data[i].name || data[i].streamId, 'rtmp://'+location.host+':1935/LiveApp/' + data[i].streamId));
		}
		$$('taskLocalStreams').add(new Option(translated('custom_video_server'), 'custom'))
		$$('taskLocalStreams').addEventListener('change', function(e){
			var val = e.target.options[e.target.selectedIndex].value;
			if(val == 'custom'){
				$$('taskStreamURL').removeAttribute('readonly');
				$$('taskStreamURL').value = '';
			} else {
				$$('taskStreamURL').setAttribute('readonly', 'readonly');
				$$('taskStreamURL').value = val;
			}
		})
	})
	.catch(function(){
		$$('taskLocalStreams').add(new Option(translated('custom_video_server'), 'custom'));
		console.warn('Failed to get streams');
	})
}
