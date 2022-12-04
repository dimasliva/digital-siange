<template>
  <div class="modal_window" @click="closeModal">
    <div class="modal_container">
      <div class="modal" @click.stop>
        <div class="head">
          <span>{{title}}</span>
        </div>
        <div class="content">
          <div class="desc" style="font-size: 75%; padding: 5px 10px;">
					Допустимые файлы для загрузки:
					<ul>
						<li>Изображения в форматах: png, jpeg
						</li><li>Видео в форматах: mp4, mkv, mpeg, wmv, flv, webm, avi, mov
						</li><li>Документы в форматах: pdf, doc, docx, rtf, odt, ppt, pptx, odp, xls, xlsx, ods
					  </li>
          </ul>
          Возможен выбор для загрузки нескольких файлов одновременно
				</div>
          <form 
            :class="{'dragged': isDragging}"
            id="uploadForm"
          >
          	<label for="upfile" id="selectfile" class="btn" style="width: 100%">Выберите файлы</label>
          	<input type="file" ref="file" @change="onFileUpload" id="upfile" name="upfile" class="uploaderHidden" multiple accept="image/*">
          	<div id="uploadList"
              @dragover="dragover"
              @dragleave="dragleave"
              @drop.stop="drop"
              class="listview"
            >
              <div v-if="uploaded_name.length === 0" class="listview-item" style="opacity: 0.3;">Нет элементов</div>
              <div v-else v-for="list in uploaded_name" :key="list" class="listview-item">
                <span>{{list}}</span>
              </div>
            </div>
          </form>
        </div>
        <div class="footer">
          <button @click="saveFile" class="btn">Загрузить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'CreateFile',
  data: () => ({
    openList: false,
    isDragging: false,
    name: "",
    files: [],
    uploaded_name: [],
    uploaded_file: [],
    formData: new FormData(),
  }),
  props: {
    title: String,
    folder: String,
  },
  mounted() {
  },
  methods: {
    onChange() {
      this.files = [...this.$refs.file.files];
    },
    dragover(e) {
      console.log('dragover')
      e.preventDefault();
      this.isDragging = true;
    },
    dragleave() {
      console.log('dragleave')
      this.isDragging = false;
    },
    drop(e) {
      console.log('drop', e.dataTransfer.files)
      e.preventDefault();
      this.$refs.file.files = e.dataTransfer.files;
      for (let index = 0; index < e.dataTransfer.files.length; index++) {
        this.uploaded_name.unshift(e.dataTransfer.files[index].name)
        this.formData.append("upfile", e.dataTransfer.files[index]);
        this.formData.append("folder", this.folder);
      }
      this.onChange();
      this.isDragging = false;
    },
    onFileUpload() {
      let files = document.getElementById("upfile").files;
      for (let index = 0; index < files.length; index++) {
        this.uploaded_name.unshift(files[index].name)
        this.formData.append("upfile", files[index]);
        this.formData.append("folder", this.folder);
      }
    },
    saveFile() {
      this.$emit('savefile', this.formData)
      this.uploaded_name = []
      this.formData = new FormData()
    },
    closeModal() {
      this.uploaded_name = []
      this.formData = new FormData()
      this.$emit('closemodal')
    },
  },
}
</script>
<style scoped>  
  #uploadForm .uploaderHidden {
    display: none;
  }
  #uploadForm {
    width: 100%;
  }
  .dragged {
    border: 1px solid #7e7e7e;
    border-radius: 4px 4px 0px 0px;
  }
  .listview-item {
    font-size: 10pt;
    cursor: default;
    background-repeat: no-repeat;
    background-position: 8px center;
    padding: 10px 12px 10px 36px;
    color: #080808;
    display: flex;
    flex-direction: column;
  }
  .desc {
    margin-left: 10px;
    color: #080808;
    font-size: 11px;
    margin: 0;
  }
  .desc ul {
    margin: 10px 0px;
    margin-left: 40px;
  }
  .listview {
    max-height: 50vh;
    background-color: #FFF;
    padding: 4px;
    border: 1px solid #DEDEDE;
    display: block;
    overflow-y: auto;
  }
  .btn {
    font: 400 10pt "Open Sans", "Segoe UI", "Liberation Sans", sans-serif;
    background: #888;
    color: #fff;
    border: 0;
    border-radius: 3px 3px 0px 0px;
    padding: 5px 10px;
    vertical-align: bottom;
    min-width: 120px;
    cursor: pointer;
    display: inline-block;
    text-decoration: none;
  }
  .modal_container {
    z-index: 3;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: scroll;
  }
  .modal .head {
    background: #555;
    color: #FFF;
    margin: 0;
    padding: 10px;
    font-size: 1.3em;
    font-weight: bold;
  }
  .modal .footer {
    width: 100%;
    padding: 10px;
    text-align: right;
    border-top: 1px solid #CCC;
    background-color: #efefef;
  }
  .modal .content {
    width: 100%;
    padding: 5px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .modal .content input {
    margin: 0;
    border: 1px solid #CCC;
    padding: 10px;
    font-size: 1.2em;
    display: block;
    width: 100%;
    box-sizing: border-box;
    outline: none;
  }

  .modal_bg{
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: black;
    opacity: .7;
    z-index: 1;
  }
  .footer .btn {
    font: 400 10pt "Open Sans", "Segoe UI", "Liberation Sans", sans-serif;
    background: #888;
    color: #fff;
    border: 0;
    border-radius: 3px;
    padding: 5px 10px;
    margin: 0px 2px;
    vertical-align: bottom;
    min-width: 120px;
    cursor: pointer;
    display: inline-block;
    text-decoration: none;
}
</style>
