{% extends "base.tpl" %}
{% block content %}
{% if auth == 'ok' %}
	<div class='toolbar'>
		<button class='btn' onclick='HeadlinesBroadcastClick()'>{{_('headlines_broadcast')}}</button>
	</div>
	<div class='workplace'>
		<div id='playersList'></div>
	</div>
	<div id='headlineEdit' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('headlines_edit_heading')}}</div>
		<input class='dialog-prompt' type='text' id='playerHeadline' onkeyup='if(event.keyCode == 13){ HeadlinesEditConfirmClick(); }'>
		<div class='dialog-footer'>
            <button class='btn' onclick='HeadlinesEditConfirmClick()'>{{_('common_confirm')}}</button>
            <button class='btn' onclick='HeadlinesEditCancelClick()'>{{_('common_close')}}</button>
        </div>
	</div>
	</div>
	<div id='headlineBroadcast' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('headlines_broadcast_heading')}}</div>
		<input class='dialog-prompt' type='text' id='broadcastHeadline' onkeyup='if(event.keyCode == 13){ HeadlinesBroadcastConfirmClick(); }'>
		<div class='dialog-footer'>
            <button class='btn' onclick='HeadlinesBroadcastConfirmClick()'>{{_('common_confirm')}}</button>
            <button class='btn' onclick='HeadlinesBroadcastCancelClick()'>{{_('common_close')}}</button>
        </div>
	</div>
	</div>
	<div class='helpblock'>
	   {{_('headlines_help')}}
	   <button class='btn' onclick='dismissHelp(this.parentNode)'>{{_('common_dismiss')}}</button>
	</div>
{% elif auth == 'partial' %}
    {% include "forbidden.tpl" %}
{% else %}
	{% include "denied.tpl" %}
{% endif %}
{% endblock %}
{% block scripting %}
<script src='/static/js/headlines.js'></script>
{% endblock %}
