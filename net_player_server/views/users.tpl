{% extends "setup-base.tpl" %}
{% block content %}
{% if auth == 'ok' %}
	<div class='toolbar'>
		<button class='btn' onclick='UserAddClick()'>{{_('users_add')}}</button>
		<button class='btn' onclick='UserSetPasswordClick()'>{{_('users_edit')}}</button>
		<button class='btn' onclick='UserDelClick()'>{{_('users_del')}}</button>
	</div>
	<div class='workplace'>
		<div id='userList' ondblclick='UserSetPasswordClick()'></div>
	</div>
	<div id='userAddModal' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('users_add_heading')}}</div>
		<div class='dialog-body'>
    		<div>{{_('users_login')}}</div>
    		<div><input type='text' id='userAddLogin'></div>
    		<div>{{_('users_password')}}</div>
    		<div><input type='password' id='userAddPassword'></div>
    	</div>
		<div class='dialog-footer'>
			<button class='btn' onclick='UserAddSaveClick()'>{{_('users_add_save')}}</button>
			<button class='btn' onclick='UserAddCloseClick()'>{{_('users_add_close')}}</button>
		</div>
	</div>
	</div>
	<div id='userEditModal' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('users_edit_heading')}}</div>
		<div class='dialog-body'>
    		<div>{{_('users_login')}}</div>
            <div><input type='text' id='userEditLogin' data-bind='value: login'></div>
            <div>{{_('users_password')}}</div>
            <div><input type='password' id='userEditPassword' data-bind='value: password'></div>
            <div>{{_('users_password_repeat')}}</div>
            <div><input type='password' id='userEditRepeat' data-bind='value: passwordRepeat'></div>
            <div>{{_('users_group')}}</div>
            <div><select type='password' id='userEditGroup' data-bind='value: group'></select></div>
    	</div>
		<div class='dialog-footer'>
			<button class='btn' onclick='UserEditSaveClick()'>{{_('users_edit_save')}}</button>
			<button class='btn' onclick='UserEditCloseClick()'>{{_('users_edit_close')}}</button>
		</div>
	</div>
	</div>
	<div id='userDelModal' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('users_del_heading')}}</div>
		<div class='dialog-body'>{{_('users_del_request')}}</div>
		<div class='dialog-footer'>
			<button class='btn' onclick='UserDelConfirmClick()'>{{_('users_del_save')}}</button>
			<button class='btn' onclick='UserDelCloseClick()'>{{_('users_del_close')}}</button>
		</div>
	</div>
	</div>
{% elif auth == 'partial' %}
    {% include "forbidden.tpl" %}
{% else %}
	{% include "denied.tpl" %}
{% endif %}
{% endblock %}
{% block scripting %}
<script src='/static/js/usermgmt.js'></script>
{% endblock %}
