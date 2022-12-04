<!doctype html>
<html>
	<head>
		<meta charset='utf-8' />
		<title>Digital signage server</title>
		<link rel='stylesheet' type='text/css' href='/static/main.css'>
		<link rel='shortcut icon' type='image/png' href='/static/favicon.png'>
		<link rel='icon' type='image/png' href='/static/favicon.png'>
		<link href="/static/fonts/fonts.css" rel="stylesheet">
		<link href='/static/modals.css' rel='stylesheet' />
		<link href='/static/simplelist.css' rel='stylesheet' />
		<script src='/static/js/cookie.js'></script>
		<script src='/static/js/locale.js'></script>
		<!-- new addons -->
		<script src='/static/js/nelistvw.js'></script>
		<script src='/static/js/simplelist.js'></script>
		<script src='/static/js/fu.js'></script>
		<script src='/static/js/shared.js'></script>
		<script src='/static/js/knockout-3.5.0.js'></script>
		{% if name %}
		<!-- specific page scripts -->{%- block scripting -%}{%- endblock -%}<!-- end -->
		{% endif %}
		<link rel='stylesheet' href='/static/layout.css' type='text/css' />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
	</head>
	<body>
		<div class='layout'>
			{# <div class='layout-top'>
				<div id='header_right'>
					{% if name %}
						{{ _('base_logged_in') }} {{name}} <a href='/logout'>{{ _('base_logout') }}</a>
					{% else %}
						<a href='#' onclick='showLoginDialog()'>{{ _('base_login') }}</a>
					{% endif %}
				</div>
			</div> #}
			<div class='layout-main'>
				<div id='layout-sidebar' class='layout-sidebar'>
					<div class="nav_heaer">
						<div class="nav_header">
							<span>MMBC</span>
							<span>Digital Signage Server</span>
						</div>
						{# <div id='sidebarSwitch' onclick='toggleSidebar()'>&#9776;</div> #}
					</div>
					<div class="nav_content">
						<a href='/players/' {% if page == "players" %}class='active'{% endif %}>Активные Play-листы</a>
						<a href='/groups/' {% if page == "groups" %}class='active'{% endif %}>Устройства</a>
						<a href='/schedule/' {% if page == "schedule" %}class='active'{% endif %}>Play-Листы</a>
						<a href='/content/' {% if page == "content" %}class='active'{% endif %}>{{ _('base_content') }}</a>
						<canvas id='diskStatus' width='256' height='16'></canvas>
						{# <a href='/headlines/' {% if page == "headlines" %}class='active'{% endif %}>{{ _('base_headlines') }}</a> #}
					</div>
				</div>
				<div id='layout-content' class='layout-content'>
					<div class='layout-content-wrapper' ondblclick="hideBtns()">
					{% block content %}{% endblock %}
					</div>
				</div>
			</div>
		</div>
		{% include "logindialog.tpl" %}
	</body>
	<script>
		function hideBtns() {
			let btns = document.querySelector(".change_btns")
			let layout = document.querySelector(".layout-content-wrapper")
			let listview = document.querySelector(".listview-item")
			listview.classList.remove("listview-hilite")
			btns.style.display = "none";
		}
	</script>
	<style>
	.layout-sidebar {
		width: 420px;
		padding: 0px;
		background-color: #30363c;
		color: white;
	}
	.nav_header {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #2d3b47;
		font-size: 27px;
		padding-top: 5px;
		padding-bottom: 30px;
	}
	.nav_content {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 22px;
		text-align: center;
	}
	.nav_content a {
		color: white;
		text-decoration: none;
		padding: 14px 0;
		width: 100%;
	}
	.nav_content a:hover, .nav_content .active{
		background-color: #282d31;
	}
	.nav_head {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	</style>
</html>
