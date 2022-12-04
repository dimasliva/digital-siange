{% extends "setup-base.tpl" %}
{% block content %}
{% if auth == 'ok' %}
    <div class='toolbar'>
        <button class='btn' onclick='AccessGroupAddClick()'>{{_('accessgroup_add')}}</button>
        <button class='btn' onclick='AccessGroupEditClick()'>{{_('accessgroup_edit')}}</button>
        <button class='btn' onclick='AccessGroupDelClick()'>{{_('accessgroup_del')}}</button>
    </div>
    <div class='workplace'>
        <div id='accessGroupList' ondblclick='AccessGroupEditClick()'></div>
    </div>
    <div id='accessGroupAddModal' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
        <div class='dialog-header'>{{_('accessgroup_add_heading')}}</div>
        <div class='dialog-body'>
            <div>{{_('accessgroup_name')}}</div>
            <div><input type='text' id='accessGroupAddName'></div>
        </div>
        <div class='dialog-footer'>
            <button class='btn' onclick='AccessGroupAddConfirmClick()'>{{_('common_confirm')}}</button>
            <button class='btn' onclick='AccessGroupAddCloseClick()'>{{_('common_close')}}</button>
        </div>
    </div>
    </div>
    <div id='accessGroupEditModal' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
        <div class='dialog-header'>{{_('accessgroup_edit_heading')}}</div>
        <div class='dialog-body'>
            <div id='accessGroupEditPermissions' style='margin: 10px 0'></div>
        </div>
        <div class='dialog-footer'>
            <button class='btn' onclick='AccessGroupEditConfirmClick()'>{{_('common_confirm')}}</button>
            <button class='btn' onclick='AccessGroupEditCloseClick()'>{{_('common_close')}}</button>
        </div>
    </div>
    </div>
    <div id='accessGroupDelModal' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
        <div class='dialog-header'>{{_('accessgroup_del_heading')}}</div>
        <div class='dialog-body'>{{_('accessgroup_del_request')}}</div>
        <div class='dialog-footer'>
            <button class='btn' onclick='AccessGroupDelConfirmClick()'>{{_('common_del')}}</button>
            <button class='btn' onclick='AccessGroupDelCloseClick()'>{{_('common_close')}}</button>
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
<script src='/static/js/accessgroups.js'></script>
{% endblock %}
