{% extends "base.tpl" %}
{% block content %}
{% if auth == 'ok' %}
<div class='toolbar'>
	<div class='toolbarheader'>{{_('player_heading')}} <span id='playerName'></span></div>
</div>
<div class='basic-container'>
    <div class='row'>
        <div class='col'>{{_('player_id')}}</div>
    	<div class='col' id='playerSerial'>{{playerid}}</div>
    </div>
    <div class='row'>
        <div class='col'>{{_('player_schedule')}}</div>
        <div class='col' id='playerGroup'></div>
    </div>
    <div class='row'>
        <div class='col'>{{_('player_last')}}</div>
        <div class='col' id='playerLast'></div>
    </div>
    <div class='row'>
        <div class='col'>{{_('player_address')}}</div>
        <div class='col' id='playerAddress'></div>
    </div>
    <div class='row'>
        <div class='col'>{{_('player_activity')}}</div>
        <div class='col' id='telemetryProc'></div>
    </div>
    <div class='row'>
        <div class='col'>{{_('player_system')}}</div>
        <div class='col'><canvas id='telemetryGraphs' width='300' height='90'></canvas></div>
    </div>
    <div class='row'>
        <div class='col'>{{_('player_timezone')}}</div>
        <div class='col'>
            <select id='playerTimezone'>
                <option value='0' disabled>Выберите часовой пояс</option>
            </select>
            <button onclick='PlayerSetTimezone()'>{{_('player_timezone_set')}}</button>
        </div>
    </div>
    <div class='row'>
        <div class='col'>{{_('player_remote_commands')}}</div>
        <div class='col'>
            <div>
                <input type='text' placeholder='{{_('remote_command_placeholder')}}' size='50' id='remoteCommandInput'>
                <button type='button' onclick='RemoteCommandSend()'>{{_('remote_command_send')}}</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>{{_('remote_command_history_time')}}</th>
                        <th>{{_('remote_command_history_command')}}</th>
                        <th>{{_('remote_command_history_status')}}</th>
                        <th>{{_('remote_command_history_actions')}}</th>
                    </tr>
                </thead>
                <tbody id='remoteCommandLog'></tbody>
            </table>
            <div>
                <button type='button' onclick='RemoteCommandClearHistory()'>{{_('remote_command_delete_completed')}}</button>
            </div>
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
<script src='/static/js/monitor.js'></script>
<style>
table {
    width: 100%;
}
table th {
    text-align: left;
}
td {
    padding: 5px;
}
</style>
{% endblock %}
