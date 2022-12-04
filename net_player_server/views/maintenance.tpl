{% extends "base.tpl" %}
{% block content %}
{% if auth == 'ok' %}
    <div class='toolbar'>
        <button class='btn' onclick='uploadDialog_open()'>{{_('content_upload')}}</button>
    </div>
    <!--
    <form id='uploadform'>
        <div>
            <button class='btn' type='button' onclick='submitUpload()'>Upload</button>
            <input type='file' id='uploadform__files' name='upfile' multiple />
            <span id='uploadform__list'></span>
        </div>
        <div id='uploadform__report'>
        </div>
    </form>
    -->
    <div id='repostatus' style='padding: 10px'></div>

    <div id='uploadDialog' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
        <div class='dialog-header'>
            <div class='closebtn' onclick='uploadDialog_close()'>&times;</div>
            {{_('content_upload_heading')}}
        </div>
        <div style='padding: 10px'>
            <form id='uploadForm'>
                <label for='upfile' class='btn'>{{_('content_upload_select')}}</label>
                <input type='file' id='upfile' name='upfile' class='uploaderHidden' />
                <span id='uploadDialogFilename' style='display: inline-block; padding: 5px; font-size: 10pt'></span>
            </form>
        </div>
        <div class='dialog-footer'>
            <button class='btn' onclick='uploadDialog_upload()'>{{_('content_upload_upload')}}</button>
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
<script src='/static/js/upkeep.js'></script>
{% endblock %}
