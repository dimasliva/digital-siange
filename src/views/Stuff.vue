<template>
	<div class="main_content">
    <WarningModal :isActive="openWarning" :text="text_warning"/>
    <CreateFile v-if="openCreateFile" :loading="isLoading" :folder="null" @savefile="saveFile" :title="'Загрузка материалов'" @closemodal="openCreateFile = false"/>
    <CreateModal v-if="openCreateDir" :title="'Введите имя для новой папки'" @savemodal="createDir" @closemodal="openCreateDir = false"/>
    <CreateModal v-if="openEdit" :title="'Введите новое имя'" :namebtn="'Сохранить'" :item="clickedItem" @savemodal="saveName" @closemodal="openEdit = false"/>
    <CreateModal v-if="openDirEdit" :title="'Введите новое имя'" :namebtn="'Сохранить'" :item="clickedItem" @savemodal="saveDirName" @closemodal="openDirEdit = false"/>
    <OpenImage v-if="openImg" :title="'Просмотр'" :item="clickedItem" @savemodal="saveName" @closemodal="openImg = false"/>
    <FileToDir v-if="openMoveDir" :items="lists" @movefolder="moveToFolder" @closemodal="openMoveDir = false"/>
    <DeleteModal v-if="openRemoveModal" @savemodal="delImg" @closemodal="openRemoveModal = false" :title="'Удаление'" :text="removeModalText" :item="clickedItem"/>
    <Header :btn="'Загрузить'" :btntwo="'Создать папку'" @openlist="openCreateFile = true" @opensecond="openCreateDir = true"/>
    <div v-if="statusFiles.length > 0">
      <div v-for="status in statusFiles" :key="status">
        <div class="statusbar" style="display: block;">
	      	<span id="conversionProgress">Обработано файлов - 
            <div style="display: flex">{{status[0]}}<progress style="margin-left: auto" max="100" :value="status[1]">{{status[1]}}</progress></div></span>
	      </div>
      </div>
    </div>
    <div id="area" class="content">
      <div class="img_container">
        <!-- Folders -->
        <div class="list-item" 
            @click="openFolder(folder.id)"
            @drop="onDrop($event, folder.id)"
            @dragover.prevent
            @dragenter.prevent
            v-for="folder in folders" :key="folder.id">
          <div class="list-item-checkbox"></div>
          <div class="list-item-icon" style="cursor: pointer;">
            <img src="@/assets/imgs/folder.svg"/>
          </div>
          <div class="list-item-caption" style="cursor: pointer;">
            <b>{{folder.name}}</b>
          </div>
          <div class="list-item-buttons">
            <button @click.stop="editTitle(folder)" title="Переименовать"><img src="@/assets/imgs/playlist/rename.svg"></button>
            <button @click.stop="openDelImg(folder)" title="Удалить"><img src="@/assets/imgs/playlist/delete.svg"/></button>
          </div>
        </div>
        <!-- Items -->
        <div 
          v-for="list in items" 
          :key="list"
          @dragstart="onDragStart($event, list)" 
          draggable="true" 
          class="list-item"
        >
          <div class="list-item-checkbox">
            <input @click.stop="selectImg(list)" type="checkbox" v-model="list.active" :style="{'visibility': !list.isFolder ? 'visible' : 'hidden'}">
          </div>
          <div @click="openImage(list)" class="list-item-icon" style="cursor: pointer;">
            <img style="width: 50px;" 
              v-if="list.id.split('.')[list.id.split('.').length - 1] === 'xlsx'" 
              src="@/assets/imgs/stuff/document-xlsx.png"
            />
            <img style="width: 50px;" 
              v-else-if="list.id.split('.')[list.id.split('.').length - 1] === 'pptx'" 
              src="@/assets/imgs/stuff/document-pptx.png"
            />
            <img style="width: 50px;" 
              v-else-if="list.id.split('.')[list.id.split('.').length - 1] === 'pdf'" 
              src="@/assets/imgs/stuff/document.png"
            />
            <img 
                v-else-if="list.id.split('.')[list.id.split('.').length - 1] === 'png'" 
                :src="`/media/${list.id}`" @error="changeSrc(list)"/>
            <img v-else :src="`/thumb/${list.id}.jpg`" @error="changeSrc(list)"/>
          </div>
          <div @click="selectImg(list)" class="list-item-caption" style="cursor: pointer;">
            <b>{{list.name}}</b>
            <div v-if="list.size">Размер: {{list.size}}</div>
          </div>
          <div class="list-item-buttons">
            <button @click.stop="openImage(list)" title="Просмотр"><img src="@/assets/imgs/stuff/preview.svg"></button>
            <button @click.stop="editTitle(list)" title="Переименовать"><img src="@/assets/imgs/playlist/rename.svg"></button>
            <button @click.stop="downloadFile(list)" class="download" title="Скачать"><img src="@/assets/imgs/stuff/download.svg"/></button>
            <button @click.stop="openDelImg(list)" title="Удалить"><img src="@/assets/imgs/playlist/delete.svg"/></button>
          </div>
        </div>
      </div>
      <div class="btns" v-if="btnsShow">
        <button @click="downloadFile()" class="btn">Скачать</button>
        <button @click="fileToDir()" class="btn">Переместить</button>
        <button @click="delImg()" class="btn">Удалить</button>
      </div>
		</div>
	</div>
</template>
<script>
import Header from "@/components/Header.vue"
import CreateFile from '@/components/CreateFile.vue'
import CreateModal from '@/components/CreateModal.vue'
import FileToDir from '@/components/Stuff/FileToDir.vue'
import OpenImage from '@/components/Stuff/OpenImage.vue'
import {formatBytes} from "@/api/playlist/func"
import { delFile, delFolder, downloadFile, getStatusFiles } from '@/api/func'
import DeleteModal from '@/components/PlayList/DeleteModal.vue'
import WarningModal from '@/components/WarningModal.vue'
import { fileRename, fileUpload, folderRename, makeDir, moveToFolder, getFiles } from '@/api/stuff/func'

export default {
  name: 'Stuff',
  data: () => ({
    lists: [],
    items: [],
    selectedImg: [],
    statusFiles: [],
    nameChange: "",
    clickedItem: {},
    intervalStatus: null,
    btnsShow: false,
    openCreateFile: false,
    openCreateDir: false,
    openEdit: false,
    openDirEdit: false,
    openImg: false,
    openMoveDir: false,
    openRemoveModal: false,
    isLoading: false,
    openWarning: false,
    text_warning: "",
  }),
  components: {
    Header,
    CreateFile,
    CreateModal,
    FileToDir,
    OpenImage,
    DeleteModal,
    WarningModal,
  },
  mounted() {
    this.getLists()
    this.getStatusFiles()
  },
  methods: {
    async downloadFile(item = null) {
      if(this.selectedImg.length !== 0) {
        this.selectedImg.map(async val => {
          val.active = false
          await downloadFile(val)
        })
        this.selectedImg = []
        this.btnsShow = false
        return
      }
      await downloadFile(item)
    },
    changeSrc(list) {
      console.log('error', list.id)
    },
    onDrop(e, folderId) {
      const itemId = e.dataTransfer.getData('itemId')
      this.selectedImg.unshift({id: itemId})
      this.moveToFolder({id: folderId})
      this.btnsShow = false
    },
    onDragStart(e, item) {
      e.dataTransfer.dropEffect = 'move'
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('itemId', item.id.toString())
    },
    async moveToFolder(folder) {
      let id = []
      this.selectedImg.map(val => {
        id.push(val.id)
      })
      console.log('folder', folder)
      let res = await moveToFolder(folder.id, id)
      if(res.status !== 'ok') {
        this.text_warning = "Не удалось переместить файлы в папку"
        this.openWarning = true
        setTimeout(() => {
          this.openWarning = false
        }, 2000)
      }
      console.log('res', res)
        this.openMoveDir = false  
        this.getLists()
    },
    fileToDir() {
      this.openMoveDir = true
    },
    selectImg(list) {
      if(list.active) {
        list.active = false
        const i = this.lists.findIndex(e => e.active === true);
        const index = this.selectedImg.findIndex(val => val === list)
        this.selectedImg.splice(index, 1)
        if(i === -1) {
          this.btnsShow = false
        }
        return
      }
      const i = this.lists.findIndex(e => e === list);
      if(i !== -1) {
        this.selectedImg.push(list)
        list.active = true
        this.btnsShow = true
      }
      list.active = true
      this.btnsShow = true
    },
    openImage(image) {
      if(image.isFolder) {
        this.openFolder(image.id)
        return
      }
      this.clickedItem = image
      console.log('image', image)
      this.openImg = true
      console.log(image)
    },
    editTitle(list) {
      this.clickedItem = list
      if(list.isFolder) {
        this.openDirEdit = true
        return
      } 
      this.openEdit = true
    },
    openFolder(id) {
      this.$router.push(`/dir/${id}`)
    },
    async createDir(title) {
      let res = await makeDir(title, null)
      if(res.status === 'error') {
        let res = await makeDir(title)
        if(res.status === 'fail') {
          this.text_warning = "Произошла ошибка при создании папки: " + title
          this.openWarning = true
          setTimeout(() => {
            this.openWarning = false
          }, 2000);
        }
      }
        this.openCreateDir = false  
        this.getLists()
    },
    async getStatusFiles() {
      this.statusFiles = await getStatusFiles()
      if(this.statusFiles.length > 0) {
        let count_status_files = this.statusFiles.length
        this.intervalStatus = setInterval(async () => {
          this.statusFiles = await getStatusFiles()
          if(count_status_files > this.statusFiles) {
            this.getLists()
            count_status_files = this.statusFiles.length
          }
          if(this.statusFiles.length === 0) {
            this.getLists()
            clearInterval(this.intervalStatus)
          }
        }, 5000);
      }
    },
    async saveFile(file) {
      this.isLoading = true
      console.log('isLoading', this.isLoading)
      let res = await fileUpload(file)
      if(res.status !== 'ok') {
        this.openWarning = true
        this.text_warning = "Не удалось загрузить файл"
        setTimeout(() => {
          this.openWarning = false
        }, 2000);
        return
      }
        this.openWarning = true
        this.text_warning = "Файл успешно загружен!"
        setTimeout(() => {
          this.openWarning = false
        }, 2000);
        this.openCreateFile = false  
        this.isLoading = false
        this.getStatusFiles()
        this.getLists()
    },
    async saveName(title, list) {
      let res = await fileRename(list.id, title)
      if(res.status !== 'ok') {
        this.openWarning = true
        this.text_warning = "Ошибка сервера: Не удалось переименовать файл"
        setTimeout(() => {
          this.openWarning = false
        }, 2000);
        return
      }
        this.openEdit = false
        this.openWarning = true
        this.text_warning = "Файл переименован"
        this.getLists()
        setTimeout(() => {
          this.openWarning = false
        }, 2000);
    },
    async saveDirName(title, list) {
      let res = await folderRename(list.id, title)
      if(res.status !== 'ok') {
        this.openWarning = true
        this.text_warning = "Ошибка сервера: Не удалось переименовать папку"
        setTimeout(() => {
          this.openWarning = false
        }, 2000);
        return
      }
        this.openDirEdit = false
        this.openWarning = true
        this.text_warning = "Папка переименована"
        this.getLists()
        setTimeout(() => {
          this.openWarning = false
        }, 2000);
    },
    openDelImg(item) {
      this.removeModalText = "Вы действительно хотите удалить"
      this.clickedItem = item
      this.openRemoveModal = true
    },
    async delImg(item = null) {
      this.clickedItem = null
      this.openRemoveModal = false
      
      if(this.selectedImg.length > 0) {
        this.selectedImg.map(async list => {
          let i = this.lists.indexOf(list)
          if(i > -1) {
            this.lists.splice(i, 1)
            console.log("i", i)
          }
          let resp = await delFile(list.id)
          if(resp.status === 'ok') {
            this.getLists()
            return
          }
        })
      } else if(item && !item.isFolder) {
        let resp = await delFile(item.id)
        if(resp.status === 'ok') {
          this.getLists()
          return
        }
      } else if(item.isFolder) {
        let resp = await delFolder(item.id)
        if(resp.status === 'ok') {
          this.getLists()
          return
        }
      }
    },
    async getLists() {
      let res = await getFiles()
      if(res.status !== 'ok') {
        this.openWarning = true
        this.text_warning = "Ошибка сервера: Не удалось получить файлы"
        setTimeout(() => {
          this.openWarning = false
        }, 2000);
        return
      }
        this.lists = res.result
        this.btnsShow = false
        this.items = this.lists.filter(val => {
        if(!val.isFolder) {
          val.size = formatBytes(val.size) 
          return true
        }
      })
    },
  },
  computed: {
    folders() {
      return this.lists.filter(val => {
        if(val.isFolder) {
          return true
        }
      })
    },
  }
}
</script>
<style scoped>

@media (max-width: 414px) {
  .list-item-caption b {
    font-size: 12px;
  }
}
.ds-selected {
  background: red !important;
}
	.main_content {
		width: 100%;
    height: 100%;
    overflow: auto;
	}

	.main_content .content {
    width: 100%;
    /* height: calc(100% - 99px); */
    position: relative;
    padding: 0;
	}
  .img_container {
    width: 100%;
    padding: 6px;
  }
  .list-item-checkbox {
    margin: 0px 4px;
  }
  .list-item-icon {
    width: 96px;
    height: 56px;
    align-self: stretch;
    display: flex;
    justify-content: center;
  }
  .list-item-icon img {
    min-width: 55px;
    width: 90%;
    height: 90%;
  }
  .list-item-caption {
    flex-grow: 1;
    padding: 10px;
    min-height: 56px;
    font-size: 14px;
  }
  .list-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px 10px 10px 5px;
    box-sizing: border-box;
    border-bottom: 1px solid #DDD;
  }
  .imgs img, .folder {
    width: 250px;
    height: 150px;
    margin: 0px 8px;
    object-fit: cover;
    vertical-align: baseline;
  }
	.btn {
    font: 400 10pt "Golos Text", "Open Sans", "Segoe UI", "Liberation Sans", sans-serif;
    background: #888;
    color: #fff;
    border: 0;
    border-radius: 3px;
    padding: 5px 10px;
    vertical-align: bottom;
    min-width: 120px;
    cursor: pointer;
    display: inline-block;
    text-decoration: none;
		cursor: pointer;
    transition: .3s all ease-in-out;
	}
  .btn:nth-child(2) {
    margin:0px 5px;
  }
  .btn:hover {
    background: rgb(121, 121, 121);
  }
  .btns {
    background-color: #AAA;
    position: fixed;
    bottom: 0;
    width: 100%;
    color: #000;
    padding: 8px 8px;
    border-bottom: 1px solid #CCC;
  }
  .list-item-buttons {
    display: flex;
  }
  .download {
    width: 34px;
  }
.statusbar {
    padding: 8px 12px;
    background-color: #BCD;
    display: none;
}
</style>
