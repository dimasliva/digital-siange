{% extends "base.tpl" %}
{% block content %}
{% if auth == 'ok' %}
<div class='toolbar'>
	<div class='toolbarheader'>График работы устройства <span id='playerName'></span></div>
</div>
<div class='basic-container'>
    <table>
    	<tr>
    		<td>Идентификатор</td>
    		<td><span id='playerSerial'>{{playerid}}</span></td>
    	</tr>
    	<tr>
    		<td>Расписание</td>
    		<td><span id='playerGroup'></span></td>
    	</tr>
    	<tr>
    		<td>Последнее обращение</td>
    		<td><span id='playerLast'></span></td>
    	</tr>
    	<tr>
    		<td>Активные процессы</td>
    		<td><span id='telemetryProc'></span></td>
    	</tr>
    </table>
    <canvas id='reportGraph' width='640' height='480'></canvas>
</div>
{% elif auth == 'partial' %}
    {% include "forbidden.tpl" %}
{% else %}
	{% include "denied.tpl" %}
{% endif %}
{% endblock %}
{% block scripting %}
/**
    var graphEdge = 0;
    var graphMax = 640;
	setInterval('extendedMonitoring("{{playerid}}")', 5000);
	document.addEventListener("DOMContentLoaded", function(){
		extendedMonitoring("{{playerid}}");
		Players = new PlayerManager();
		Players.load(function(){
			var playerInfo = Players.get("{{playerid}}");
			document.getElementById('playerName').innerHTML = playerInfo['name'];
			document.getElementById('playerGroup').innerHTML = playerInfo['group'];
			document.getElementById('playerLast').innerHTML = DateFormatter(playerInfo['lastacc']) + ' (' + DateDifference(playerInfo['lastacc']) + ')';
		});
	});
**/
	startUp.extended("{{playerid}}");
{% endblock %}
