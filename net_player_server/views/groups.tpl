{% extends "base.tpl" %}
{% block content %}
{% if auth == 'ok' %}
	<div class='toolbar play_list'>
		<div class='toolbarheader'>{{_('groups_heading')}}</div>
		<button class='btn btn-green' onclick='GroupAddClick()'>{{_('groups_new')}}</button>
		{# <button class='btn' onclick='GroupAssignClick()'>{{_('groups_assign')}}</button>
		<button class='btn' onclick='GroupEditClick()'>{{_('groups_edit')}}</button>
		<button class='btn' onclick='GroupRemoveClick()'>{{_('groups_remove')}}</button> #}
		<span id='statusLine'></span>
	</div>
	<div class='helpblock'>
	  	{{_('groups_help')}}
		<button class='btn' onclick='dismissHelp(this.parentNode)'>{{_('common_dismiss')}}</button>
	</div>
	<div class='workplace'>
		<div id='groupsList' class='listview' ondblclick='GroupAssignClick()'></div>
	</div>
	<!-- выбор устройств в группе -->
	<div id='groupEdit' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-dialog'>
		<div class='dialog-header'>{{_('groups_edit_heading')}}</div>
		<div class='dialog-container'>
    		<table style='width: 100%'>
    		<tr>
    			<td style='width: 50%'>
    				<div id='groupIncludedList' class='listview' ondblclick='GroupEditExcludeClick()'></div>
    			</td>
    			<td>
    				<div id='groupExcludedList' class='listview' ondblclick='GroupEditIncludeClick()'></div>
    			</td>
    		</tr>
    		</table>
        </div>
		<div class='dialog-footer'>
			<button class='btn' onclick='modals.edit.close()'>{{_('common_close')}}</button>
		</div>
	</div>
	</div>
	<!-- выбор расписания -->
	<div id='groupSchedule' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('groups_schedule_heading')}}</div>
		<div id='scheduleList' class='listview'></div>
		<div class='dialog-footer'>
	       	<button class='btn' onclick='modals.schedule.close()'>{{_('common_close')}}</button>
	    </div>
	</div>
	</div>
	<!-- создание новой группы -->
	<div id='groupNew' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('groups_new_heading')}}</div>
		<input class='dialog-prompt' type='text' id='groupNewName' onkeyup='if(event.keyCode == 13){ modals.add.submit(); }'>
		<div class='dialog-footer'>
            <button class='btn' onclick='modals.add.submit()'>{{_('common_add')}}</button>
            <button class='btn' onclick='modals.add.close()'>{{_('common_close')}}</button>
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
    <script src='/static/js/groups.js'></script>
{% endblock %}
