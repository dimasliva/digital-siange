<!doctype html>
<html>
	<head>
		<meta charset='utf-8' />
		<title>Administrative interface</title>
		<link rel='shortcut icon' type='image/png' href='/static/favicon.png'>
        <link rel='icon' type='image/png' href='/static/favicon.png'>
		<link rel='stylesheet' type='text/css' href='/static/main.css'>
		<link href="https://fonts.googleapis.com/css?family=PT+Sans:400,700" rel="stylesheet">
		<script src='/static/listvw.js'></script>
		<script src='/static/js/knockout-3.5.0.js'></script>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
	</head>
	<body>
		<div id='sidebar'>
			<a href='/users/'>Пользователи</a>
		</div>
		<div id='wrapper'>
			<div id='bd'>
				{% block content %}{% endblock %}
			</div>
		</div>
		<div id='header'>
			<div id='header_right'>
				{% if name %}
					Выполнен вход как {{name}} <a href='/logout'>Выйти</a>
				{% else %}
					<a href='#' onclick='showLoginDialog()'>Войти</a>
				{% endif %}
			</div>
			<div id='sidebarSwitch' onclick='toggleSidebar()'>&#9776;</div>
			<b>DIGITAL SIGNAGE SERVER</b>
		</div>
		<div id='footer'>
			
		</div>
		{% include "logindialog.tpl" %}
	</body>
	<script src='/static/admin.js'></script>
	<script src='/static/gui.js'></script>
	<script>
		{% block scripting %}{% endblock %}
	</script>
</html>
	
