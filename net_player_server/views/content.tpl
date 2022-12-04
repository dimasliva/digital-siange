{% extends "base.tpl" %}
{% block content %}
{% if auth == 'ok' %}
	<div class='toolbar play_list'>
		<div class='toolbarheader content'>{{_('content_heading')}}</div>
		<button class='btn btn-green upload_btn' onclick='FilesUploadClick()'>{{_('content_upload')}}</button>
		{# <button class='btn' onclick='FilesPreviewClick()'>{{_('content_preview')}}</button> #}
		<span id='conversionProgress' style='float: right'></span>
	</div>
	<div class='workplace'>
		<div id='filesList' onclick="openBtns()" ondblclick='FilesPreviewClick()'></div>
	</div>
	<div id='createFolderDialog' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('content_create_folder_heading')}}</div>
		<input class='dialog-prompt' type='text' id='createFolderName' onkeyup='if(event.keyCode == 13){ modals.createFolder.submit(); }'>
		<div class='dialog-footer'>
    		<button class='btn' onclick='modals.createFolder.submit()'>{{_('common_confirm')}}</button>
	       	<button class='btn' onclick='modals.createFolder.close()'>{{_('common_close')}}</button>
        </div>
	</div>
	</div>
	<div id='renameDialog' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('content_rename_heading')}}</div>
		<input class='dialog-prompt' type='text' id='renameNewName' onkeyup='if(event.keyCode == 13){ modals.rename.submit(); }'>
		<div class='dialog-footer'>
    		<button class='btn' onclick='modals.rename.submit()'>{{_('common_confirm')}}</button>
	       	<button class='btn' onclick='modals.rename.close()'>{{_('common_close')}}</button>
        </div>
	</div>
	</div>
	
	<div id='deleteDialog' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>{{_('content_delete_heading')}}</div>
		<div class='dialog-body'>{{_('content_delete_prompt')}} <span id='deleteFilename'></span></div>
		<div class='dialog-footer'>
    		<button class='btn' onclick='modals.remove.submit()'>{{_('common_del')}}</button>
	       	<button class='btn' onclick='modals.remove.close()'>{{_('common_close')}}</button>
        </div>
	</div>
	</div>

	<div id='uploadDialog' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-minidialog'>
		<div class='dialog-header'>
			<div class='closebtn' onclick='modals.upload.close()'>&times;</div>
			{{_('content_upload_heading')}}
		</div>
		<div class='dialog-body'>
			<form id='uploadForm'>
				<div style='font-size: 75%; padding: 5px 10px;'>
					Допустимые файлы для загрузки:
					<ul>
						<li>Изображения в форматах: png, jpeg
						<li>Видео в форматах: mp4, mkv, mpeg, wmv, flv, webm, avi, mov
						<li>Документы в форматах: pdf, doc, docx, rtf, odt, ppt, pptx, odp, xls, xlsx, ods
					</ul>
				</div>
				<label for='upfile' class='btn' style='width: 100%'>{{_('content_upload_select')}}</label>
				<input type='file' id='upfile' name='upfile' class='uploaderHidden' multiple />
				<div id='uploadList' class='listview'></div>
			</form>
		</div>
		<div class='dialog-footer'>
    	<button class='btn' onclick='FilesUploadConfirmClick()' style='float: right'>{{_('content_upload_upload')}}</button>
      <canvas id='uploadProgress' width='300' height='24'></canvas>
    </div>
	</div>
	</div>
	<div id='previewDialog' class='ds-dialog-fog ds-dialog-hidden'>
	<div class='ds-dialog'>
		<div class='dialog-header'>
			<div class='closebtn' onclick='modals.preview.close()'>&times;</div>
			{{_('content_preview_heading')}}
		</div>
		<div style='text-align: center; background-color: #000;'>
			<video id='previewVideo' style='max-width: 100%' controls></video>
			<img id='previewImage' style='max-width: 100%' ></video>
		</div>
		<div class='dialog-footer' style='padding: 5px; text-align: center;'>
			<a class='btn' id='previewDownload'>{{ _('content_download') }}</a>
		</div>
	</div>
	<style>
	.btn {
		font-size: 16px;
		padding: 8px 10px;
	}
	.btn-gray {
		background-color: #929292;
	}
	.btn-warning {
		background-color: #eec362;
	}
	.btn-danger {
		background-color: #db3030;
	}
	.change_btns {
		display: none;
    position: absolute;
    bottom: 30px;
    left: 30px;
	}
	</style>
{% elif auth == 'partial' %}
    {% include "forbidden.tpl" %}
{% else %}
	{% include "denied.tpl" %}
{% endif %}
{% endblock %}
{% block scripting %}
	<!-- <link href='/static/content-list-override.css' rel='stylesheet' /> -->
	<script src='/static/js/content.js'></script>
{% endblock %}
