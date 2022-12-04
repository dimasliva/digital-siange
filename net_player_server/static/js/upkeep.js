function gbyid(id){ return document.getElementById(id); }
function crel(tag, props, nested){
    var ret = document.createElement(tag);
    if(typeof props == 'object'){
        for(var k in props){
            ret.setAttribute(k, props[k]);
        }
    }
    if(typeof nested == 'object'){
        for(var i in nested){
            if(typeof nested[i] == 'string'){
                var n = document.createTextNode(nested[i]);
                ret.appendChild(n);
            } else {
                ret.appendChild(nested[i]);
            }
        }
    }
    return ret;
}

function uploadDialog_open(){
    window.uploadModal.show();
    $$('uploadDialogFilename').innerText = '';
    $$('uploadForm').reset();
}

function uploadDialog_close(){
    window.uploadModal.hide();
}

function uploadDialog_upload(){
    var files = $$('upfile').files;
    if(files.length < 1){
        MessagePopup('You should select files to include in package');
        return false;
    }
    var fd = new FormData();
    for(var i in files){ fd.append('upfile', files[i]); }
    fetcher({url: '/dist/upload', body: fd, method: 'post'})
    .then(function(r){
        return r.json();
    })
    .then(function(d){
        console.log('ok');
        /* if(d.linter.length > 0){
            gbyid('uploadform__report').innerHTML = '<b>There was some errors during check</b><br/>' + d.linter.join('<br/>');
        } */
	if(d.success == false){
	    MessagePopup('Failed to upload file. Reason: ' + d.error);
	}
        uploadDialog_close();
        showStatus();
    })
    .catch(function(x){
        console.warn('fail', x);
    })
}

function showStatus(){
    fetcher({url: '/dist/last'})
    .then(function(r){ return r.json(); })
    .then(function(data){
        // var data = JSON.parse(r);
    	if(data.success){
    		gbyid('repostatus').innerHTML = '<b>Latest build</b><br/>Revision: ' + data.build + '<br/>Hash: ' + data.checksum + '</br>Link: <a href="' + data.link + '">' + data.file + '</a>';
    	}
    })
    .catch(function(){
        console.warn('fail');
    })
}

function updateFilesList(ev){
    $$('uploadDialogFilename').innerText = ev.target.files[0].name;
}

function loadup(){
    try {
        $$('upfile').addEventListener('change', updateFilesList);
        window.uploadModal = new neModal($$('uploadDialog'));
        showStatus();
    } catch(e) {
        console.warn(e);
    } 
}
