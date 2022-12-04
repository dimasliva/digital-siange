<!-- login dialog start -->
<div id='dialog_login' class='ds-dialog-fog ds-dialog-hidden'>
<div class='ds-minidialog'>
	<form method='post' action="/login" onsubmit='window.loginform.hide()'>
		<div class='dialog-header'>
            <!-- <div class='closebtn' onclick='window.loginform.hide()'>&times;</div> -->
            {{_('base_login')}}
        </div>
        <div class='dialog-body'>
    		<label>{{_('login_login')}}</label>
    		<input type='text' name='user'>
    		<label>{{_('login_password')}}</label>
    		<input type='password' name='pass'>
    	</div>
		<div class='dialog-footer'>
    		<button class='btn' type='submit'>{{_('base_login')}}</button>
    	</div>
	</form>
</div>
</div>
<!-- login dialog end -->
