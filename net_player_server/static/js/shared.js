// library functions ...... /

function RestFactory(options){
	this.data = [];
	this.url = options.url;
	this.find = function(key, value){
		for(var i = 0, n = this.data.length; i < n; i++){
			if(this.data[i][key] == value)
				return this.data[i];
		}
		return null;
	}
	this.fetch = function(url){
		return function(){
			return fetcher({url: url})
			.then(function(x){ return x.json(); })
			.then(function(self){
				return function(data){
					if(data.status == 'ok'){
						self.data = data.result;
						return data.result;
					}
					return null;
				}
			}(this));
		}
	}(options.url);
	for(var k in options.methods){
		this[k] = function(method){

			if((method.reload === undefined) || (method.reload == true)){
				return function(data){
					return fetcher({url: method.url, body: data, json: true, method: 'post'})
					.then(function(self){
						return function(){
							return self.fetch();
						}
					}(this));
				}
			} else {
				return function(data){
					return fetcher({url: method.url, body: data, json: true, method: 'post'});
				}
			}
		}(options.methods[k]);
	}
}

// GLUU ........ /
function Gluu(config){
	this.$data = {}
	this.$watchers = {}
	this.$update = function(key){
		if(key in this.$watchers){
			for(var i in this.$watchers){
				this.$watchers[i](this.$data[key]);
			}
		}
	}
	this.$watch = function(key, func){
		if(!(key in this.$watchers)){
			this.$watchers[key] = []
		}
		this.$watchers[key].push(func);
	}
	this.$bindContent = function(el, key){
		el.innerText = this.$data[key];
		this.$watch(key, function(el){
			return function(x){
				el.innerText = x;
			}
		}(el));
	}
	this.$bindValue = function(el, key){
		el.value = this.$data[key];
		el.addEventListener('change', function(self, key){
			return function(e){
				self[key] = e.target.value;
			}
		}(this, key));
		this.$watch(key, function(el){
			return function(x){
                console.log('changed to ' + x);
				el.value = x;
			}
		}(el));
	}
	this.$bindSelect = function(el, key){
        el.value = this.$data[key];
		el.addEventListener('change', function(self, key){
			return function(e){
				self[key] = e.target.options[e.target.selectedIndex].value;
			}
		}(this, key));
		this.$watch(key, function(el){
			return function(x){
				el.value = x;
			}
		}(el));
    }
	this.$bindSwitchers = function(el, key){
		var name = el.getAttribute('name');
		var switches = document.getElementsByName(name);
		for(var i = 0, n = switches.length; i < n; i++){
			switches[i].checked = (switches[i].value == this.$data[key]);
			switches[i].addEventListener('click', function(self, key){
				return function(e){
					if(e.target.checked){
						self[key] = e.target.value;
					}
				}
			}(this, key));
		}
		this.$watch(key, function(el){
			return function(x){
				var name = el.getAttribute('name');
				var switches = document.getElementsByName(name);
				for(var i = 0, n = switches.length; i < n; i++){
					switches[i].checked = (switches[i].value == x);
				}
			}
		}(el));
	}
	this.$autobind = function(el){
		var elements = el.querySelectorAll('[data-binded]');
		for(var i = 0, n = elements.length; i < n; i++){
			var key = elements[i].getAttribute('data-binded');
            if(!(key in this.$data)){
                console.warn(['Key ', key, ' have to be initialized in constructor'].join(''));
            }
			if(elements[i] instanceof HTMLInputElement){
				if(['radio', 'checkbox'].indexOf(elements[i].type) != -1){
					this.$bindSwitchers(elements[i], key);
				} else {
					this.$bindValue(elements[i], key);
				}
            } else if(elements[i] instanceof HTMLSelectElement) {
                this.$bindSelect(elements[i], key);
			} else if('value' in elements[i]){
                this.$bindValue(elements[i], key);
            } else {
				this.$bindContent(elements[i], key)
			}
		}
	}
	/** constructor **/
	for(var k in config.data){
		this.$data[k] = config.data[k];
		Object.defineProperty(
			this,
			k,
			{
				configurable: true,
				get: function(key){
					return function(){
						return this.$data[key];
					}
				}(k),
				set: function(key){
					return function(val){
						this.$data[key] = val;
						if(key in this.$watchers){
							for(var i in this.$watchers[key]){
								this.$watchers[key][i](val);
							}
						}
					}
				}(k)
			}
		);
	}
}

function arrayDiff(a, b){
	var retval = [];
	if(b){
		for(var i in a){
			if(b.indexOf(a[i]) == -1)
				retval.push(a[i]);
		}
	} else {
		retval = a.slice();
	}
	return retval;
}

function collectionDiff(all, selected, compareFunction){
	var retval = [];
	if(selected){
		for(var i = 0, n = all.length; i < n; i++){
			var contains = false;
			for(var j = 0, m = selected.length; j < m; j++){
				if(compareFunction(all[i], selected[j])){
					contains = true;
					break;
				}
			}
			if(!contains) retval.push(all[i]);
		}
	} else {
		retval = all.slice();
	}
	return retval;
}

function DateFormatter(text){
	return (new Date(parseInt(text)*1000)).toLocaleString();
}

function MacFormatter(x){
	str = '';
	for(var i = 0; i < 6; i++){
		var n = x / Math.pow(2, i * 8) & 0xff;
		str = (n < 16 ? '0' : '') + n.toString(16) + (str.length == 0 ? '' : ':' + str);
	}
	return str.toUpperCase();
}

function NumericL11n(num, one, two, five){
	if(num > 4 && num < 20){
		return five;
	} else {
		switch(num % 10){
		case 1:
			return one;
			break;
		case 2:
		case 3:
		case 4:
			return two;
			break;
		default:
			return five;
		}
	}
}

function DateDifference(text){
	var result = '';
	var now = new Date();
	var then = new Date(parseInt(text)*1e3);
	var days = Math.floor((now - then)/86400000);
	var hours = Math.floor((now - then)/3600000)%24;
	var minutes = Math.floor((now - then)/60000)%60;
	if(hours < 0){
		result = translated('time_now');
	} else if(days != 0){
		result = days + ' ' + NumericL11n(days, translated('time_day')[0], translated('time_day')[1], translated('time_day')[2]) + ' ' + hours + ' ' + NumericL11n(hours, translated('time_hour')[0], translated('time_hour')[1], translated('time_hour')[2]) + ' ' + minutes + ' ' + NumericL11n(minutes, translated('time_minute')[0], translated('time_minute')[1], translated('time_minute')[2]) + ' ' + translated('time_ago');
	} else if(hours != 0){
		result = hours + ' ' + NumericL11n(hours, translated('time_hour')[0], translated('time_hour')[1], translated('time_hour')[2]) + ' ' + minutes + ' ' + NumericL11n(minutes, translated('time_minute')[0], translated('time_minute')[1], translated('time_minute')[2]) + ' ' + translated('time_ago');
	} else if(minutes != 0){
		result = minutes + ' ' + NumericL11n(minutes, translated('time_minute')[0], translated('time_minute')[1], translated('time_minute')[2]) + ' ' + translated('time_ago');
	} else {
		result = translated('time_now');
	}
	return result;
}

function fuzzyLength(n){
    if(isNaN(n) || (n == null) || (n == 0)) return '0';
	var suffixes = ['', 'Ki','Mi','Gi','Ti'];
	var p = Math.floor(Math.log(n) / Math.log(2) / 10);
	return (n / Math.pow(2, p*10)).toFixed(2) + ' ' + suffixes[p] + 'B';
}

function TaskWrapper(){
    this.type = null;
    this.argumentsType = 'null';
    this.arguments = null;
    this.scheduleType = 'default';
    this.schedule = null;
	this.slideshowDelay = 5;
    this.fromTuple = function(task){
        this.type = task[0];
        switch(task[0]){
            case 'play':
            case 'slideshow':
                this.argumentsType = 'list';
                break;
            case 'stream':
            case 'web':
                this.argumentsType = 'string';
                break;
            default:
                this.argumentsType = 'null';
        }
        this.arguments = task[1];
        if(task.length < 3){
            this.scheduleType = 'default';
            this.schedule = null
        } else if(task[2].length > 1) {
            this.scheduleType = 'interval';
            this.schedule = task[2];
        } else {
            this.scheduleType = 'oneshot';
            this.schedule = task[2];
        }
    }
    this.fromStruct = function(task){
        this.type = task.method;
        switch(task.method){
            case 'play':
            case 'slideshow':
                this.argumentsType = 'list';
                break;
            case 'stream':
            case 'web':
                this.argumentsType = 'string';
                break;
            default:
                this.argumentsType = 'null';
        }
        this.arguments = task.resource;
        if(task.schedule == null){
            this.scheduleType = 'default';
            this.schedule = null
        } else if(task.schedule.length > 1) {
            this.scheduleType = 'interval';
            this.schedule = task.schedule;
        } else {
            this.scheduleType = 'oneshot';
            this.schedule = task.schedule;
        }
		if(task.delay !== undefined){
			this.slideshowDelay = task.delay;
		}
    }
}

// DOM manipulation ........ /

function $$(id){
    if(!(id in $$.cache)){
        $$.cache[id] = document.getElementById(id);
    }
    return $$.cache[id];
}
$$.cache = {};

function neModal(el, onOpen, onSubmit, onClose){
    this.el = el;
    this.visible = false;
    this.show = function(){
        this.el.classList.remove('ds-dialog-hidden');
    };
    this.hide = function(){
        this.el.classList.add('ds-dialog-hidden');
    };
	// new methods
	this.context = {};
	this.open = function(context){
		this.context = context;
		this.show();
		if(typeof onOpen == 'function') onOpen(this.context);
	};
	this.submit = function(){
		var closeModal = true;
		if(typeof onSubmit == 'function'){
			closeModal = onSubmit(this.context);
		}
		if(closeModal !== false)
			this.hide();
	};
	this.close = function(){
		if(typeof onClose == 'function') onClose(this.context);
		this.hide();
	};
	this.el.onclick = function(e){
		if(e.target == e.currentTarget){
			this.close();
		}
	}.bind(this);
}

function showContainer(selector, modal){
    if((typeof modal != 'undefined') && modal){
        document.getElementsByClassName('modalfog')[0].style.display = 'block';
    }
	document.getElementById(selector).classList.remove('is-hidden');
}

function hideContainer(selector, modal){
    if((typeof modal != 'undefined') && modal){
        document.getElementsByClassName('modalfog')[0].style.display = 'none';
    }
	document.getElementById(selector).classList.add('is-hidden');
}

function centerModal(id){
    var el = document.getElementById(id);
    var w = window.innerWidth;
    var h = window.innerHeight;
    el.style.top = (h - el.offsetHeight)/3 + 'px';
    el.style.left = (w - el.offsetWidth)/2 + 'px';
}

function MessagePopup(text){
	var el = document.createElement('div');
	el.innerText = text;
	el.style.position = 'fixed';
	el.style.top = '12px';
	el.style.right = '12px';
	el.style.border = '1px solid #333';
	el.style.background = '#444';
	el.style.color = '#FFF';
	el.style.padding = '16px';
	el.style.width = '400px';
    el.style.zIndex = 102;
	el.style.transition = 'opacity 0.5s ease';
	document.body.appendChild(el);
	setTimeout(function(){ return function(){ el.style.opacity = 0; } }(el), 2000);
	setTimeout(function(){ return function(){ document.body.removeChild(el); } }(el), 3000);
}

// TODO: rename and rework
function dismissHelp(o){
	Cookie.set('helpblock', 'hidden', {expires: 100, path: '/'});
	o.style.display = 'none';
}

// base template functions ........ /

function showLoginDialog(){
    loginform.show();
    document.getElementsByName('user')[0].focus();
}

function updateDiskUsage(){
	fetcher({url: '/api/files/usage'})
	.then(function(x){
		var res = JSON.parse(x.response);
        var free = parseInt(res['free']);
        // var total = parseInt(res['total']);
        var media = parseInt(res['media']);
		var total = free + media;
        free = isNaN(free) ? 0 : free;
        total = isNaN(total) ? 0 : total;
        media = isNaN(media) ? 0 : media;
		diskUsageBar.canvas.height = 16;
		diskUsageBar.font = '700 11px PT Sans Caption, sans-serif';
		diskUsageBar.fillStyle = '#FFF';
		diskUsageBar.fillRect(0, 0, 256, 16);
		diskUsageBar.fillStyle = '#49f';
		diskUsageBar.fillRect(0, 0, 256 - Math.ceil(free/total*256), 16);
		diskUsageBar.fillStyle = '#06c';
		diskUsageBar.fillRect(0, 0, Math.ceil(media/total*256), 16);
		diskUsageBar.fillStyle = '#000';
		diskUsageBar.fillText(translated('disk_free') + ': ' + fuzzyLength(free), 144, 12);
		diskUsageBar.fillText(translated('disk_content') + ': ' + fuzzyLength(media), 4, 12);
	});
}

function toggleSidebar(){
	var aside = $$('layout-sidebar');
	aside.classList.toggle('layout-sidebar-collapsed');
	/*
	if(aside.className.match(/toggled/)){
		aside.className = 'layout-sidebar';
		content.className = 'layout-content';
	} else {
		aside.className = 'layout-sidebar layout-sidebar--toggled';
		content.className = 'layout-content--toggled';
	}
	*/
}

// startup ........ /

function main(){
    if(typeof loadup == 'function'){
    	try {
    		loadup();
    	} catch(e) {
    		console.warn('an error occured in loadup', e);
    	}
    } else {
        console.warn('No pagescript');
    }
    if(Cookie.get('helpblock') == 'hidden'){
		var helpblock = document.getElementsByClassName('helpblock');
        if((helpblock instanceof HTMLCollection) && (helpblock[0] instanceof Node))
            helpblock[0].style.display = 'none';
	}
	window.loginform = new neModal($$('dialog_login'));
	window.diskUsageBar = $$('diskStatus').getContext('2d');
	updateDiskUsage();
    setInterval(updateDiskUsage, 120000);
}

document.addEventListener('DOMContentLoaded', main);
