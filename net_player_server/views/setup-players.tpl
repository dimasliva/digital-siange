{% extends "setup-base.tpl" %}
{% block content %}
{% if auth == 'ok' %}
	<div class='toolbar'>
		<button class='btn' onclick='PlayersAssignUser()'>{{_('players_select_user')}}</button>
		<button class='btn' onclick='PlayersForget()'>{{_('players_forget')}}</button>
	</div>
	<div class='workplace'>
		<div id='playersList' ondblclick='PlayersAssignUser()'></div>
	</div>
	<div id='playersUser' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('players_select_user_heading')}}</div>
		<div id='userList' class='listview' ondblclick='PlayersAssignUserConfirmClick()'></div>
		<div class='dialog-footer'>
    		<button class='btn' onclick='PlayersAssignUserConfirmClick()'>{{_('common_confirm')}}</button>
	       	<button class='btn' onclick='PlayersAssignUserCloseClick()'>{{_('common_close')}}</button>
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
<script src='/static/js/setup-players.js'></script>
{% endblock %}
