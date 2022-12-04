function validation(e){
    var username = document.getElementById('fs__user');
    var password = document.getElementById('fs__pass');
    var repeated = document.getElementById('fs__repeat');
    var response = document.getElementById('fs__response');
    if(username.value.trim() == ''){
        username.style.borderColor = '#F54';
        response.innerText = translated('username_required');
        e.preventDefault();
        return false;
    }
    if(password.value == ''){
        password.style.borderColor = '#F54';
        response.innerText = translated('password_required');
        e.preventDefault();
        return false;
    }
    if(repeated.value == ''){
        repeated.style.borderColor = '#F54';
        response.innerText = translated('password_repeat');
        e.preventDefault();
        return false;
    }
    if(password.value != repeated.value){
        password.style.borderColor = '#F54';
        repeated.style.borderColor = '#F54';
        response.innerText = translated('password_missmatch');
        e.preventDefault();
        return false;
    }
    return true;
}

function main(){
    document.forms[0].addEventListener('submit', validation);
}

document.addEventListener('DOMContentLoaded', main);
