{% extends "base.tpl" %}
{% block content %}
{% if auth == 'ok' %}
	<div class='toolbar'>
		<div class='toolbarheader'>{{_('editor_heading')}} <span id='scheduleName'></span></div>
		<button class='btn' onclick='modals.add.open()'>{{_('editor_add')}}</button>
		<!--
		<button class='btn' onclick='TaskRemoveClick()'>{{_('editor_remove')}}</button>
		<button class='btn' onclick='TaskEditClick()'>{{_('editor_edit')}}</button>
		-->
		<button class='btn' onclick='TaskCommitClick()' class='redbutton'>{{_('editor_save')}}</button>
		<span id='statusLine'></span>
	</div>
	<div class='helpblock'>
	  	{{_('editor_help')}}
		<button class='btn' onclick='dismissHelp(this.parentNode)'>{{_('common_dismiss')}}</button>
	</div>
	<div class='workplace'>
		<div id='taskList' ondblclick='TaskEditClick()'></div>
	</div>
	<div id='taskEdit' class='ds-dialog-fog ds-dialog-hidden'>
		<div class='ds-dialog'>
			<div class='dialog-header'>{{_('editor_edit_heading')}}</div>
			<div class='dialog-body'>
				<div class='taskedit__options'>
					<div class='column'>
						<div class='column-header'>{{ _('editor_edit_mode') }}</div>
						<select name='scheduleType' data-bind='value: taskScheduleType'>
							<option value='default' data-bind='attr: { hidden: disableDefaultType }'>{{_('editor_edit_default')}}</option>
							<option value='interval'>{{_('editor_edit_scheduled')}}</option>
							<option value='oneshot' data-bind='attr: { hidden: disableOneshotType }'>{{_('editor_edit_oneshot')}}</option>
						</select>
					</div>
					<div class='column' id='scheduleRecurrenceSection'>
						<div class='column-header'>{{ _('editor_edit_recur') }}</div>
						<select id='scheduleMode' data-bind='value: taskScheduleMode'>
							<option value='exact'>{{_('editor_edit_recur_none')}}</option>
							<option value='hour'>{{_('editor_edit_recur_hour')}}</option>
						</select>
					</div>
					<div class='column' id='scheduleBeginSection'>
						<div class='column-header'>{{_('editor_edit_starts')}}</div>
						<input type='text' id='scheduleBegin' placeholder='{{_('editor_edit_starts')}}' data-bind='value: taskTimeStart'>
					</div>
					<div class='column' id='scheduleEndSection'>
						<div class='column-header'>{{_('editor_edit_ends')}}</div>
						<input type='text' id='scheduleEnd' placeholder='{{_('editor_edit_ends')}}' data-bind='value: taskTimeEnd'>
					</div>
				</div>
				<div id='slideshowIntervalBox'>
					<div style='display: flex'>
						<div style='padding: 5px 20px'>
							<b>{{_('editor_slideshow_delay')}}</b>
						</div>
						<div>
							<input type='number' data-bind='value: taskSlideshowDelay'>
						</div>
					</div>
				</div>
				<div id='taskFilesBox'>
					<div id='playList'></div>
					<div id='restList'></div>
				</div>
				<div id='taskUrlBox'>
					<div id='taskUrlHint'></div>
					<div class='fx-container'><input type='text' class='dialog-input' id='taskUrl'></div>
				</div>
				<div id='taskStreamBox'>
					<div class='fx-container'>
						<select id='taskLocalStreams' class='dialog-input'></select>
						<input type='text' class='dialog-input' id='taskStreamURL' readonly>
					</div>
				</div>
			</div>
			<div class='dialog-footer'>
				<button class='btn' type='button' onclick='TaskEditConfirmClick()'>{{_('editor_edit_ok')}}</button>
				<button class='btn' type='button' onclick='TaskEditCloseClick()'>{{_('common_close')}}</button>
			</div>
		</div>
	</div>
	<div id='taskNew' class='ds-dialog-fog ds-dialog-hidden'>
		<div class='ds-minidialog'>
			<div class='dialog-header'>
				{{_('editor_add_heading')}}
			</div>
			<div id='taskType' class='listview'>
			</div>
			<div class='dialog-footer'>
				<button class='btn' onclick='modals.add.close()'>{{_('common_close')}}</button>
			</div>
		</div>
	</div>
	<script>

	</script>
{% elif auth == 'partial' %}
    {% include "forbidden.tpl" %}
{% else %}
	{% include "denied.tpl" %}
{% endif %}
{% endblock %}
{% block scripting %}
    <script src='/static/js/schedit.js'></script>
{% endblock %}
