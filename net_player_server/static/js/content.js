// content page ........ /

var state = {
	activeItem: null,
	currentFolder: null
};

// upload
function FilesUploadClick(){
	uploadsList.update([]);
	uploadbar.clearRect(0, 0, uploadbar.canvas.width, uploadbar.canvas.height);
	modals.upload.show();
}
// upload confirm
function FilesUploadConfirmClick(){
	var file = $$('upfile').files[0];
	if(file){
		var xhr = new XMLHttpRequest();
		xhr.upload.onprogress = updateProgressBar;
		xhr.onload = xhr.onerror = function(){
			if(this.status == 200){
				var data = JSON.parse(this.response);
				if(data['status'] == 'fail'){
					MessagePopup(translated('upload_failed'));
				} else {
					if(window.conversionTimer == null){
						window.conversionTimer = setInterval(updateConversion, 2000);
					}
					MessagePopup(translated('upload_done'));
					updateFilesList();
				}
				FilesUploadCloseClick();
			} else {
				MessagePopup(translated('upload_failed'));
			}
		};
		xhr.open('POST', '/api/files/upload', true);
		var fd = new FormData($$('uploadForm'));
		if(state.currentFolder !== null){
			fd.append('folder', state.currentFolder);
		}
		xhr.send(fd);
	} else {
		MessagePopup(translated('upload_required'));
	}
}

// progress bar
function updateProgressBar(event){
	var w = uploadbar.canvas.width;
	uploadbar.strokeStyle = '#06c';
	uploadbar.strokeRect(0.5, 0.5, w - 1, 23);
	uploadbar.fillStyle = '#7bf';
	uploadbar.fillRect(0, 0, w, 24);
	uploadbar.fillStyle = '#39f';
	uploadbar.fillRect(0, 0, Math.floor((event.loaded / event.total) * w), 24);
	if(event.loaded == event.total){
		uploadbar.fillStyle = '#fff';
		uploadbar.textAlign = 'center';
		uploadbar.font = '12pt PT Sans';
		uploadbar.fillText(translated('file_processing'), w/2, 18);
	}
}

function updateFilesList(){
	fetcher({url: state.currentFolder == null ? '/api/files/list' : '/api/files/list?folder=' + state.currentFolder})
	.then(function(x){
		var data = JSON.parse(x.response);
		var selection = filesList.value;
		if(state.currentFolder == null){
			filesList.update(data.result.slice());
		} else {
			var backItem = [{
				name: 'Назад',
				special: true,
				defaultAction: 'goUp',
				actions: [],
				image: 'icons/folder-up.svg'
			}];
			filesList.update(backItem.concat(data.result.slice()));
		}
		//if(selection != null)
		//	filesList.value = selection.id;
	})
	.catch(function(e){
		console.warn('Failed to do response', e);
		MessagePopup(translated('failed_to_list_files'));
	});
}

function updateFoldersList(){
	var folders = [{
		isFolder: true,
		id: null,
		name: 'Неотсортированное'
	}];
	fetcher({url: '/api/files/list'})
	.then(function(x){
		var data = JSON.parse(x.response);
		targetFoldersList.update(folders.concat(data.result.filter(function(item){ return item.isFolder; })))
	})
	.catch(function(e){
		console.warn('Failed to do response', e);
		MessagePopup(translated('failed_to_list_folders'));
	});
}

function updateConversion(){
	fetcher({url: '/api/files/status'})
	.then(function(x){
		var data = JSON.parse(x.response);
		if(data['data'].length > 0){
			document.querySelector('.statusbar').style.display = 'block';
			var contents = translated('converting');
			data['data'].forEach(function(job){
				contents += '<div style="display: flex">' + job[0] + '<progress style="margin-left: auto" max="100" value="' + Math.floor(job[1]) + '">' + job[1].toFixed(2) + '</progress></div>';
			})
			$$('conversionProgress').innerHTML = contents;
		} else {
			document.querySelector('.statusbar').style.display = 'none';
			clearInterval(window.conversionTimer);
			window.conversionTimer = null;
			$$('conversionProgress').innerText = '';
			updateFilesList();
		}
	})
	.catch(function(e){
		console.warn('Failed to do response');
	});
}

function GroupDeleteAction(){
	var files = filesList.selectedItems;
	fetcher({ url: '/api/files/delete_multiple', method: 'POST', body: { files: files }, json: true })
	.then(function(){
		MessagePopup('Файлы удалены');
		updateFilesList();
		filesList.clearSelect();
	});
}

function GroupMoveAction(){
	modals.move.show();
}

//
// loadup ........ /
//
function loadup(){
    var documentRegex = new RegExp('\.(pdf|doc|docx|odt)', 'i');
    var spreadsheetRegex = new RegExp('\.(xls|xlsx|ods)', 'i');
    var presentationRegex = new RegExp('\.(ppt|pptx|pps|ppsx|odp)', 'i');
	try {
	window.filesList = new BasicListView({
		elem: $$('filesList'),
		multiselect: true,
		key: 'id',
		actions: {
			open_dir: {
				label: 'Открыть',
				handler: function(item){
					state.currentFolder = item.id;
					filesList.clearSelect();
					updateFilesList();
				}
			},
			goUp: {
				label: 'Вверх',
				handler: function(item){
					state.currentFolder = null;
					filesList.clearSelect();
					updateFilesList();
				}
			},
			preview: {
				icon: '/static/icons/preview.svg',
				label: 'Просмотр',
				handler: function(item){
					modals.preview.open(item);
				}
			},
			rename_file: {
				icon: '/static/icons/rename.svg',
				label: 'Переименовать',
				handler: function(item){
					modals.rename.open(item);
				}
			},
			delete_file: {
				icon: '/static/icons/delete.svg',
				label: 'Удалить',
				handler: function(item){
					modals.remove.open(item);
				}
			},
			rename_dir: {
				icon: '/static/icons/rename.svg',
				label: 'Переименовать',
				handler: function(item){
					modals.rename.open(item);
				}
			},
			delete_dir: {
				icon: '/static/icons/delete.svg',
				label: 'Удалить',
				handler: function(item){
					modals.remove.open(item);
				}
			}
		},
		transform: function(item){
			var image = '';
			if(item.special){
				return {
					image: '/static/' + item.image,
					text: item.name,
					defaultAction: item.defaultAction,
					actions: item.actions,
					selectable: false
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
				text: '<b>' + item.name + '</b>' + (item.isFolder ? '' : '<div>Размер: ' + fuzzyLength(item.size) + '</div>'),
				defaultAction: item.isFolder ? 'open_dir' : 'preview',
				actions: item.isFolder ? ['rename_dir', 'delete_dir'] : ['preview', 'rename_file', 'delete_file'],
				selectable: !item.isFolder
			}
		}
	});
	window.filesList.on('select', function(){
		if(filesList.selectedItems.length > 0){
			showContainer('groupActionsToolbar');
		} else {
			hideContainer('groupActionsToolbar');
		}
	})
	} catch(e) {
		console.error(e);
	}
	window.targetFoldersList = new BasicListView({
		elem: $$('targetFoldersList'),
		key: 'id',
		transform: function(item){
			return {
				image: '/static/icons/folder.svg',
				text: item.name,
				defaultAction: null,
				actions: ['move']
			}
		},
		actions: {
			move: {
				icon: '/static/icons/move.svg',
				label: 'Move',
				handler: function(item, index){
					fetcher({
						url: '/api/files/move_multiple',
						method: 'POST',
						body: {
							files: filesList.selectedItems,
							folder: item.id
						},
						json: true
					}).then(function(){
						modals.move.hide();
						MessagePopup('Файлы перемещены');
						filesList.clearSelect();
						updateFilesList();
					})
				}
			}
		}
	});
	window.uploadsList = new neListVw({
		elem: $$('uploadList'),
		multi: false,
		key: 'filename',
		display: {
			'filename': String
		},
		style: {
			'normal': 'listview-item',
			'selected': 'listview-item'
		}
	});
	window.uploadbar = $$('uploadProgress').getContext('2d');
	$$('upfile').onchange = function(e){
		var fileinput = e.target;
		var list = [];
		for(var i = 0, n = fileinput.files.length; i < n; i++){
			list.push({filename: fileinput.files[i].name});
		}
		uploadsList.update(list);
	};
	window.conversionTimer = setInterval(updateConversion, 2000);
	window.modals = {
		upload: new neModal(
			$$('uploadDialog'),
			FilesUploadClick,
			FilesUploadConfirmClick
		),
		preview: new neModal(
			$$('previewDialog'),
			function(item){
				if(item.isFolder){
					console.log('open folder');
					return;
				} else if(item.id.indexOf('.mp4') != -1){
					hideContainer('previewImage');
					showContainer('previewVideo');
					$$('previewVideo').src = 'http://' + location.host + '/media/' + item.id;
				} else if(item.id.indexOf('.pdf') != -1){
					showContainer('previewImage');
					hideContainer('previewVideo');
					$$('previewImage').src = '/static/preview-unavail-16x9.png';
				} else {
					showContainer('previewImage');
					hideContainer('previewVideo');
					$$('previewImage').src = 'http://' + location.host + '/media/' + item.id;
				}
				$$('previewDownload').setAttribute('href', 'http://' + location.host + '/media/' + item.id);
				$$('previewDownload').setAttribute('download', item.name);
				modals.preview.show();
			},
			function(){},
			function(item){
				$$('previewVideo').pause();
			}
		),
		createFolder: new neModal(
			$$('createFolderDialog'),
			function(){
				$$('createFolderName').value = '';
				$$('createFolderName').focus();
			},
			function(){
				var folderName = $$('createFolderName').value;
				if(folderName.trim() == ''){
					MessagePopup(translated('folder_name_required'));
					return false;
				}
				fetcher({
					url: '/api/files/makedir',
					method: 'post',
					body: {'name': folderName, 'parent': null},
					json: true
				}).then(function(r){
					return r.json();
				}).then(function(data){
					if(data.status == 'ok'){
						MessagePopup(translated('create_folder_done'));
						updateFilesList();
						updateFoldersList();
					} else {
						MessagePopup(translated('create_folder_failed'));
					}
				});
			}
		),
		remove: new neModal(
			$$('deleteDialog'),
			function(item){
				$$('deleteFilename').textContent = item.name;
			},
			function(item){
				if(item.isFolder){
					var apiMethod = '/api/files/removedir';
					var data = { 'id': item.id };
				} else {
					var data = { 'filename': item.id };
					var apiMethod = '/api/files/del';
				}
				fetcher({url: apiMethod, method: 'POST', body: data, json: true})
				.then(function(x){ return x.json(); })
				.then(function(data){
					if(data.status == 'ok'){
						MessagePopup(translated('file_remove_done'));
						updateFilesList();
						updateFoldersList();
					} else {
						MessagePopup(translated('file_remove_failed'));
					}
				})
				.catch(function(){
					console.warn('Failed to do request');
				});
			}
		),
		rename: new neModal(
			$$('renameDialog'),
			function(item){
				$$('renameNewName').value = item.name;
				$$('renameNewName').focus();
			},
			function(item){
				var newName = $$('renameNewName').value;
				if(newName.trim() == ''){
					MessagePopup(translated('new_name_required'));
					return false;
				}
				var apiMethod = item.isFolder ? '/api/files/renamedir' : '/api/files/rename';
				var data = { id: item.id, name: newName };
				fetcher({url: apiMethod, method: 'POST', body: data, json: true})
				.then(function(x){ return x.json(); })
				.then(function(data){
					if(data.status == 'ok'){
						MessagePopup(translated('rename_done'));
						updateFilesList();
					} else {
						MessagePopup(translated('rename_failed'));
					}
				})
				.catch(function(){
					console.warn('Failed to do request');
				});
			}
		),
		move: new neModal(
			$$('moveFilesDialog')
		)
	}
	updateConversion();
	updateFilesList();
	updateFoldersList();
	//setInterval(updateFilesList, 20000);
}
function openBtns() {
	let listview = document.querySelector(".listview-item")
	let btns = document.querySelector(".change_btns")
	if(listview.classList.contains("listview-hilite")) {
		btns.style.display = "block"
		console.log('listview', listview)
	}
}