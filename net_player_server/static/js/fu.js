function Future(){
    this.PENDING = 0;
    this.DONE = 1;
    this.FAILED = -1;
    this.status = this.PENDING;
    this.result = null;
    this.callback = null;
    this.fallthrough = null;
    this.resolve = function(result){
        if(this.status != this.PENDING)
            return false;
        this.status = this.DONE;
        this.result = result;
        if(this.callback != null)
            this.callback(result);
        return true;
    }
    this.reject = function(result){
        if(this.status != this.PENDING)
            return false;
        this.status = this.FAILED;
        this.result = result;
        if(this.fallthrough != null)
            this.fallthrough(result);
        return true;
    }
    this.then = function(callback){
        var laterFuture = new Future();
        switch(this.status){
        case this.DONE:
            try {
                response = callback(this.result);
                if(response instanceof Future){
                    return response;
                } else {
                    laterFuture.resolve(response);
                }
            } catch(e) {
                laterFuture.reject(e);
            }
            break;
        case this.FAILED:
            laterFuture.reject(this.result);
            break;
        case this.PENDING:
            var laterCallback = function(result){
                try {
                    laterResponse = callback(result);
                    if(laterResponse instanceof Future){
                        var latestCallback = function(x){
                            laterFuture.resolve(x);
                        }
                        var latestFallthrough = function(x){
                            laterFuture.reject(x);
                        }
                        laterResponse.then(latestCallback).catch(latestFallthrough);
                    } else {
                        laterFuture.resolve(laterResponse);
                    }
                } catch(e) {
                    laterFuture.reject(e)
                }
            }
            var laterFallthrough = function(result){
                laterFuture.reject(result);
            }
            this.callback = laterCallback;
            this.fallthrough = laterFallthrough;
            break;
        }
        return laterFuture;
    }
    this.catch = function(callback){
        var laterFuture = new Future();
        switch(this.status){
        case this.FAILED:
            callback(this.result);
            break;
        case this.DONE:
            laterFuture.resolve(this.result)
            break;
        case this.PENDING:
            var laterFallthrough = function(result){
                callback(result);
            }
            var laterCallback = function(result){
                laterFuture.resolve(result);
            }
            this.callback = laterCallback;
            this.fallthrough = laterFallthrough;
        }
        return laterFuture;
    }
}

function Response(xhr){
    this.status = xhr.status;
    this.response = xhr.responseText;
    var headers = xhr.getAllResponseHeaders();
    this.headers = headers
    .trim()
    .split(/[\r\n]+/)
    .reduce(
        function(dict, it){
            var parts = it.split(': ', 2);
            var name = parts.shift().toLowerCase();
            dict[name] = parts.join(': ');
            return dict;
        },
        {}
    );
    this.json = function(){
        var fu = new Future;
        try {
            if(this.headers['content-type'].indexOf('json') == -1)
            	throw Error('Wrong content type');
            fu.resolve(JSON.parse(this.response));
        } catch(e) {
            fu.reject(e);
        }
        return fu;
    }
}

function fetcher(options){
    var future = new Future();
    var isIE = navigator.appName.indexOf('Explorer') != -1;
    var xhr = new XMLHttpRequest();
    var _method = (options.method || 'GET').toUpperCase();
    var _headers = options.headers || {};
    var _body = ((_method == 'POST') && (options.body || null)) || null;
    var _json = options.json || false;
    var _url = (options.url || '') + (isIE ? '?nonce=' + Math.random().toString().split('.')[1] : '');
    xhr.open(_method, _url, true);
    xhr.onreadystatechange = function(fu){
        return function(){
            if(this.readyState == XMLHttpRequest.DONE){
                fu.resolve(new Response(this));
            }
        }
    }(future);
    xhr.onerror = function(fu){
        return function(err){
            fu.reject(err);
        }
    }(future);
    for(var k in _headers){
        xhr.setRequestHeader(k, _headers[k]);
    }
    if(_json && (_body != null)){
        _body = JSON.stringify(_body);
        xhr.setRequestHeader('Content-Type', 'application/json');
    }
    xhr.send(_body);
    return future;
}