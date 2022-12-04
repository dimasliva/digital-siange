<!doctype html>
<html>
	<head>
		<meta charset='utf-8' />
		<title>Digital signage server</title>
		<link rel='stylesheet' type='text/css' href='/static/main.css'>
		<link href="https://fonts.googleapis.com/css?family=IBM+Plex+Sans:400,700" rel="stylesheet">
		<script src='/static/listvw.js'></script>
		<script src='/static/loaded.js'></script>
		<script src='/static/cookie.js'></script>
		<script src='/static/locale.js'></script>
		<!-- new addons -->
		<script src='/static/nelistvw.js'></script>
		<script src='/static/fu.js'></script>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
	</head>
	<body>
		<div id='sidebar'>
			<a href='/players/' {% if page == "players" %}class='active'{% endif %}>{{locale.base_players}}</a>
			<a href='/groups/' {% if page == "groups" %}class='active'{% endif %}>{{locale.base_groups}}</a>
			<a href='/schedule/' {% if page == "schedule" %}class='active'{% endif %}>{{locale.base_schedule}}</a>
			<a href='/content/' {% if page == "content" %}class='active'{% endif %}>{{locale.base_content}}</a>
		</div>
		<div id='wrapper'>
			<div id='bd'>
				{% block content %}{% endblock %}
			</div>
		</div>
		<div id='header'>
			<div id='header_right'>
				{% if name %}
					{{locale.base_logged_in}} {{name}} <a href='/logout'>{{locale.base_logout}}</a>
				{% else %}
					<a href='#' onclick='showLoginDialog()'>{{locale.base_login}}</a>
				{% endif %}
			</div>
			<div id='sidebarSwitch' onclick='toggleSidebar()'>&#9776;</div>
			<b>DIGITAL SIGNAGE SERVER</b>
		</div>
		<div id='footer'>
			<div id='footer_right'>
				<canvas id='diskStatus' width='256' height='16'></canvas>
			</div>
		</div>
		{% include "logindialog.tpl" %}
	</body>
	<script src='/static/main.js'></script>
	<script src='/static/gui.js'></script>
	<script>
		var diskCanvas = document.getElementById('diskStatus');
		var ctx = diskCanvas.getContext('2d');
		updateDiskUsage();
		{% block scripting %}{% endblock %}
	</script>
</html>
	
