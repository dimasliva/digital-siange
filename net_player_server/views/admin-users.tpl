{% extends "admin-base.tpl" %}
{% block content %}
{% if name %}
	<div class='toolbar'>
		<div class='toolbarheader'>Пользователи</div>
		<span id='statusLine'></span>
	</div>
	<div class='workplace'>
		<div id='usersListView'></div>
	</div>
	<div id='usersDialog' class='microdialog'>
		Логин
		<input id='usersDialogName' type='text'>
		Пароль
		<input id='usersDialogPass' type='password'>
		<button onclick='usersDialogSubmit()'>Сохранить</button>
		<button onclick='usersDialogReset()'>Отмена</button>
	</div>
{% else %}
	{% include "denied.tpl" %}
{% endif %}
{% endblock %}
{% block scripting %}
	var usersListView = mkListView(document.getElementById('usersListView'));
	renderUsers();
{% endblock %}
