<!doctype html>
<html>
	<head>
		<meta charset='utf-8' />
		<title>Setup - Digital signage server</title>
		<link rel='stylesheet' type='text/css' href='/static/main.css'>
		<link href="/static/fonts/fonts.css" rel="stylesheet">
		<link rel='stylesheet' href='/static/modals.css' />
		<script src='/static/js/cookie.js'></script>
		<script src='/static/js/locale.js'></script>
		<!-- new addons -->
		<script src='/static/js/nelistvw.js'></script>
		<script src='/static/js/fu.js'></script>
		<script src='/static/js/shared.js'></script>
		<script src='/static/js/knockout-3.5.0.js'></script>
		{% if name %}
		<!-- specific page scripts -->{%- block scripting -%}{%- endblock -%}<!-- end -->
		{% endif %}
		<link rel='stylesheet' href='/static/layout-legacy.css' type='text/css' />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
	</head>
	<body>
		<div class='layout'>
			<div class='layout-top'>
				<div id='header_right'>
					{% if name %}
						{{ _('base_logged_in') }} {{name}} <a href='/logout'>{{ _('base_logout') }}</a>
					{% else %}
						<a href='#' onclick='showLoginDialog()'>{{ _('base_login') }}</a>
					{% endif %}
				</div>
				<div id='sidebarSwitch' onclick='toggleSidebar()'>&#9776;</div>
				<b>DIGITAL SIGNAGE SERVER</b>
			</div>
			<div class='layout-main'>
				<div id='layout-sidebar' class='layout-sidebar'>
				    <a href='/'>{{ _('setup_to_main') }}</a>
					<a href='/setup/users/'>{{ _('setup_users')}}</a>
					<a href='/setup/groups/'>{{ _('setup_groups') }}</a>
					<a href='/setup/players/'>{{ _('setup_players') }}</a>
				</div>
				<div id='layout-content' class='layout-content'>
					<div class='layout-content-wrapper'>
					{% block content %}{% endblock %}
					</div>
				</div>
			</div>
			<div class='layout-bottom'>
				<div id='footer_right'>
					<canvas id='diskStatus' width='256' height='16'></canvas>
				</div>
			</div>
		</div>
		{% include "logindialog.tpl" %}
	</body>
</html>
	
