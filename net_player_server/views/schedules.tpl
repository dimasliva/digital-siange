{% extends "base.tpl" %}
{% block content %}
{% if auth == 'ok' %}
	<div class='toolbar play_list'>
		<div class='toolbarheader'>{{_('schedule_heading')}}</div>
		<button class='btn btn-green' onclick='ScheduleAddClick()'>Создать Play-Лист</button>
		{# <button class='btn btn-green' onclick='ScheduleAddClick()'>{{_('schedule_add')}}</button> #}
		{# <button class='btn' onclick='ScheduleRemoveClick()'>{{_('schedule_remove')}}</button>
		<button class='btn' onclick='ScheduleEditClick()'>{{_('schedule_edit')}}</button>
		<button class='btn' onclick='ScheduleRenameClick()'>{{_('schedule_rename')}}</button>
		<button class='btn' onclick='ScheduleCopyClick()'>{{_('schedule_copy')}}</button> #}
		{# <span id='statusLine'></span> #}
	</div>
	<div class='workplace'>
		<div id='groupList'></div>
	</div>

	<div id='confNew' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('schedule_add_heading')}}</div>
		<input class='dialog-prompt' type='text' id='confNewName' onkeyup='if(event.keyCode == 13){ modals.add.submit(); }'>
		<div class='dialog-footer'>
    		<button class='btn' onclick='modals.add.submit()'>{{_('common_add')}}</button>
	       	<button class='btn' onclick='modals.add.close()'>{{_('common_close')}}</button>
	    </div>
	</div>
	</div>

	<div id='scheduleRename' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('schedule_rename_heading')}}</div>
		<input class='dialog-prompt' type='text' id='scheduleRenameName' onkeyup='if(event.keyCode == 13){ modals.rename.submit(); }'>
		<div class='dialog-footer'>
    		<button class='btn' onclick='modals.rename.submit()'>{{_('common_confirm')}}</button>
	       	<button class='btn' onclick='modals.rename.close()'>{{_('common_close')}}</button>
        </div>
	</div>
	</div>

	<div id='scheduleDelete' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('schedule_delete_heading')}}</div>
		<div class='dialog-body'>{{_('schedule_delete_prompt')}} <span id='deletingSchedule'></span></div>
		<div class='dialog-footer'>
    		<button class='btn' onclick='modals.remove.submit()'>{{_('common_del')}}</button>
	       	<button class='btn' onclick='modals.remove.close()'>{{_('common_close')}}</button>
        </div>
	</div>
	</div>

	<div class='helpblock'>
	   {{_('schedule_help')}}
	   <button class='btn' onclick='dismissHelp(this.parentNode)'>{{_('common_dismiss')}}</button>
	</div>
{% elif auth == 'partial' %}
    {% include "forbidden.tpl" %}
{% else %}
	{% include "denied.tpl" %}
{% endif %}
{% endblock %}
{% block scripting %}
<script src='/static/js/schedules.js'></script>
{% endblock %}
<style>

</style>
