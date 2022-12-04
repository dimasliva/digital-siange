{% extends "base.tpl" %}
{% block content %}
{% if auth == 'ok' %}
	<div class='toolbar play_list'>
		<div class='toolbarheader content'>{{_('players_heading')}}</div>
		{# <button class='btn btn-green' onclick='PlayerScheduleClick()'>{{_('players_select_schedule')}}</button> #}
		{# <button class='btn' onclick='PlayerRenameClick()'>{{_('players_rename')}}</button> #}
		{# <button class='btn' onclick='PlayerSummaryClick()'>{{_('players_status')}}</button> #}
		{# <button class='btn' onclick='PlayerScreenshotClick()'>{{_('player_screenshot')}}</button> #}
		<!-- <button class='btn' onclick='PlayerSortClick()'>{{_('players_sort')}}</button> -->
		{# <span id='statusLine'></span> #}
	</div>
	<div class='workplace'>
		<div id='playerList'></div>
	</div>

    <div id='playerSummary' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
        <!-- monitor.tpl rip-off -->
        <div class='dialog-header'>
            <div class='toolbarheader'>{{_('player_heading')}} <span id='playerSummaryName'></span></div>
        </div>
        <div class='dialog-body'>
            <div class='microdialog_section'>
                {{_('player_id')}}
            </div>
            <div class='microdialog_row' id='playerSummaryId'></div>
            
            <div class='microdialog_section'>{{_('player_schedule')}}</div>
            <div class='microdialog_row' style='display: flex; align-items: center;'>
                <span id='playerSummarySchedule'></span>
                <button class='btn' style='margin-left: auto' onclick='modals.schedule.open(state.activeItem)'>{{_('player_set_schedule')}}</button>
            </div>
            
            <div class='microdialog_section'>{{_('player_last')}}</div>
            <div class='microdialog_row' id='playerSummaryLastmod'></div>
            
            <div class='microdialog_section'>{{_('player_address')}}</div>
            <div class='microdialog_row' id='playerSummaryAddress'></div>
            
            <div class='microdialog_section'>{{_('player_activity')}}</div>
            <div class='microdialog_row' id='playerSummaryActivity'></div>

            <div class='microdialog_section'>{{_('player_headline')}}</div>
            <div class='microdialog_row' style='display: flex; align-items: center;'>
                <input type='text' id='playerSummaryHeadline' style='margin-right: 1em;' />
                <button class='btn' onclick='setPlayerHeadline()'>{{_('player_set_headline')}}</button>
            </div>
            
            <div class='microdialog_section'>{{_('player_volume')}}</div>
            <div class='microdialog_row'><input type='range' data-bind='value: volume' min='0' max='20'></div>
        </div>
        <div class='dialog-footer'>
            <div style='float:left'>
                <button class='btn' onclick='PlayerStatusClick()'>{{_('player_more')}}</button>
            </div>
            <div>
                <button class='btn' onclick='modals.summary.submit()'>{{_('common_confirm')}}</button>
                <button class='btn' onclick='modals.summary.close()'>{{_('common_close')}}</button>
            </div>
        </div>
    </div>
	</div>

	<div id='playerRename' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
        <div class='dialog-header'>{{_('players_rename_heading')}}</div>
        <input class='dialog-prompt' type='text' id='playerNewName' onkeyup='if(event.keyCode == 13){ modals.rename.submit(); }'>
        <div class='dialog-footer'>
            <button class='btn' onclick='modals.rename.submit()'>{{_('common_confirm')}}</button>
            <button class='btn' onclick='modals.rename.close()'>{{_('common_close')}}</button>
        </div>
    </div>
    </div>

    <div id='playerBroadcast' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
        <div class='dialog-header'>{{_('headlines_broadcast_heading')}}</div>
        <input class='dialog-prompt' type='text' id='broadcastHeadline' onkeyup='if(event.keyCode == 13){ modals.broadcastHeadline.submit(); }'>
        <div class='dialog-footer'>
            <button class='btn' onclick='modals.broadcastHeadline.submit()'>{{_('common_confirm')}}</button>
            <button class='btn' onclick='modals.broadcastHeadline.close()'>{{_('common_close')}}</button>
        </div>
    </div>
    </div>

	<div id='playerGroup' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('players_select_schedule_heading')}}</div>
		<div id='groupList' class='listview' ondblclick='modals.schedule.submit()'></div>
		<div class='dialog-footer'>
		  <button class='btn' onclick='modals.schedule.submit()'>{{_('common_confirm')}}</button>
		  <button class='btn' onclick='modals.schedule.close()'>{{_('common_close')}}</button>
		</div>
    </div>
	</div>

	
	<div id='playerScreenshotPreview' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
        <div class='dialog-header'>
            {{_('player_screenshot_heading')}}
        </div>
        <div>
            <img id='playerScreenshotImage' style='width:100%' />
        </div>
        <div class='dialog-footer'>
            <div>
                <button class='btn' onclick='modals.screenshot.close()'>{{_('common_close')}}</button>
            </div>
        </div>
    </div>
    </div>
	<div class='helpblock'>
	   {{_('players_help')}}
	   <button class='btn' onclick='dismissHelp(this.parentNode)'>{{_('common_dismiss')}}</button>
	</div>
{% elif auth == 'partial' %}
    {% include "forbidden.tpl" %}
{% else %}
	{% include "denied.tpl" %}
{% endif %}
{% endblock %}
{% block scripting %}
<script src='/static/js/players.js'></script>
{% endblock %}
