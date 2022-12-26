<template>
	<div class="main_content" >
    <WarningModal :isActive="openWarning" :text="text_warning"/>
    <CreateFile v-if="openCreateFile" :folder="this.$route.params.id" @savefile="saveFile" :title="'Загрузка материалов'" @closemodal="openCreateFile = false"/>
    <CreateModal v-if="openCreateDir" :title="'Введите имя для новой папки'" @savemodal="createDir" @closemodal="openCreateDir = false"/>
    <CreateModal v-if="openEdit" :title="'Введите новое имя'" :namebtn="'Сохранить'" :item="clickedItem" @savemodal="saveName" @closemodal="openEdit = false"/>
    <FileToDir v-if="openMoveDir" @movefolder="moveToFolder" @closemodal="openMoveDir = false"/>
    <OpenImage v-if="openImg" :title="'Просмотр'" :item="clickedItem" @savemodal="saveName" @closemodal="openImg = false"/>
    <DeleteModal v-if="openRemoveModal" @savemodal="delFile" @closemodal="openRemoveModal = false" :title="'Удаление'" :text="removeModalText" :item="clickedItem"/>
    <Header :btn="'Загрузить'" :btntwo="'Создать папку'" @openlist="openCreateFile = true" @opensecond="openCreateDir = true"/>
    <div v-if="statusFiles.length > 0">
      <div v-for="status in statusFiles" :key="status">
        <div class="statusbar" style="display: block;">
	      	<span id="conversionProgress">Обработано файлов - 
            <div style="display: flex">{{status[0]}}<progress style="margin-left: auto" max="100" :value="status[1]">{{status[1]}}</progress></div></span>
	      </div>
      </div>
    </div>
    <div class="content">
      <div class="img_container">
        <div class="list-item"
          @click="backFolder()"
          @drop="onDrop($event, null)"
          @dragover.prevent
          @dragenter.prevent
        >
          <!-- Folder back -->
          <div class="list-item-checkbox">
            <input type="checkbox" :style="{'visibility': 'hidden'}">
          </div>
          <div class="list-item-icon" style="cursor: pointer;">
            <img src="@/assets/imgs/stuff/folder-up.svg"/>
          </div>
          <div class="list-item-caption" style="cursor: pointer;">
            <b>Назад</b>
          </div>
        </div>
        <!-- Items -->
        <div class="list-item" 
          @click="selectImg(list)"
          @dragstart.stop="onDragStart($event, list)" 
          draggable="true" 
          v-for="(list, i) in lists" 
          :key="i"
        >
          <div class="list-item-checkbox">
            <input @click="selectImg(list)" type="checkbox" v-model="list.active" :style="{'visibility': !list.isFolder ? 'visible' : 'hidden'}">
          </div>
          <div @click.stop="openImage(list)" class="list-item-icon" style="cursor: pointer;">
            <img style="width: 50px;" v-if="list.id.split('.')[list.id.split('.').length - 1] === 'pdf'" src="@/assets/imgs/stuff/document.png"/>
            <img 
                v-else-if="list.id.split('.')[list.id.split('.').length - 1] === 'png'" 
                :src="`/media/${list.id}`" @error="changeSrc(list)"/>
            <img v-else :src="`/thumb/${list.id}.jpg`" @error="changeSrc(list)"/>
          </div>
          <div class="list-item-caption" style="cursor: pointer;">
            <b>{{list.name}}</b>
            <div v-if="list.size">Размер: {{list.size}}</div>
          </div>
          <div class="list-item-buttons">
            <button @click.stop="openImage(list)" v-if="!list.isFolder" title="Просмотр"><img src="@/assets/imgs/stuff/preview.svg"></button>
            <button @click.stop="editTitle(list)" title="Переименовать"><img src="@/assets/imgs/playlist/rename.svg"></button>
            <button @click.stop="downloadFile(list)" class="download" title="Скачать"><img src="@/assets/imgs/stuff/download.svg"/></button>
            <button @click.stop="openDelImg(list)" title="Удалить"><img src="@/assets/imgs/playlist/delete.svg"/></button>
          </div>
        </div>
      </div>
      <div class="btns" v-if="btnsShow">
        <button @click="downloadFile()" class="btn">Скачать</button>
        <button @click="openMoveDir = true" class="btn">Переместить</button>
        <button @click="delFiles()" class="btn">Удалить</button>
      </div>
		</div>
	</div>
</template>

<script>
import Header from "@/components/Header.vue"
import CreateFile from '@/components/CreateFile.vue'
import CreateModal from '@/components/CreateModal.vue'
import {delFile, getFiles, fileRename, fileUpload, makeDir, moveToFolder} from "@/api/stuff/func"
import {downloadFile, formatBytes, getStatusFiles} from "@/api/func"
import FileToDir from '@/components/Stuff/FileToDir.vue'
import OpenImage from '@/components/Stuff/OpenImage.vue'
import DeleteModal from '@/components/PlayList/DeleteModal.vue'
import WarningModal from '@/components/WarningModal.vue'

export default {
  name: 'Directory',
  data: () => ({
    lists: [],
    btnsShow: false,
    selectedImg: [],
    statusFiles: [],
    intervalStatus: null,
    editName: false,
    nameChange: "",
    changedImg: {},
    clickedItem: {},
    openCreateFile: false,
    openCreateDir: false,
    openMoveDir: false,
    openImg: false,
    openEdit: false,
    removeModalText: "",
    clickedItem: null,
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
    async downloadFile(item = null) {
      if(this.selectedImg.length !== 0) {
        this.selectedImg.map(async val => {
          val.active = false
          console.log('val', val)
          await downloadFile(val)
        })
        this.selectedImg = []
        this.btnsShow = false
        return
      }
      await downloadFile(item)
    },
    editTitle(list) {
      this.clickedItem = list
      this.openEdit = true
    },
    openImage(image) {
      if(image.isFolder) {
        this.backFolder()
        return
      }
      this.openImg = true
      this.clickedItem = image
      console.log(image)
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
    backFolder() {
      this.$router.push({name: 'Stuff'})
    },
    async moveToFolder(folder) {
      let id = []
      if(this.selectedImg.length > 0) {
        this.selectedImg.map(val => {
          id.push(val.id)
        })
      }
      let res = await moveToFolder(folder ? folder.id : null, id)
      if(res.status !== 'ok') {
        this.text_warning = "Не удалось переместить файлы в папку"
        this.openWarning = true
        setTimeout(() => {
          this.openWarning = false
        }, 2000)
      }
      this.getLists()
      this.btnsShow = false
      this.openMoveDir = false  
    },
    async createDir(title) {
      let res = await makeDir(title, this.$route.params.id)
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
    async saveFile(file) {
      this.isLoading = true
      let res = await fileUpload(file)
      if(res.status !== 'ok') {
        this.openWarning = true
        this.text_warning = "Не удалось загрузить файл"
        setTimeout(() => {
          this.openWarning = false
        }, 2000);
        return
      }
        this.openCreateFile = false  
        this.isLoading = false
        this.getStatusFiles()
        this.getLists()
    },
    async saveName(name, item) {
      let res = await fileRename(item.id, name)
      if(res.status !== 'ok') {
        this.openWarning = true
        this.text_warning = "Ошибка сервера: Не удалось переименовать файл"
        setTimeout(() => {
          this.openWarning = false
        }, 2000);
        return
      }
        this.openEdit = false
        this.lists.map(val => {
          val.edit = false
          val.active = false
        })
        this.selectedImg = []
        this.btnsShow = false
        this.getLists()
        this.openWarning = true
        this.text_warning = "Файл переименован"
        setTimeout(() => {
          this.openWarning = false
        }, 2000);
    },
    selectImg(list) {
      if(!this.editName) {
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
        }
        list.active = true
        this.btnsShow = true
      }
    },
    openDelImg(item) {
      this.removeModalText = "Вы действительно хотите удалить"
      this.clickedItem = item
      this.openRemoveModal = true
    },
    async delFile(item) {
      await delFile(item.id)
      this.getLists()
    },
    async delFiles() {
      console.log('selectedImg', this.selectedImg)
      this.selectedImg.map(async list => {
        await delFile(list.id)
      })
      this.btnsShow = false
      setTimeout(() => {
        this.getLists()
      }, 200)
    },
    async getLists() {
      let res = await getFiles(this.$route.params.id)
      this.lists = res.result
      this.lists.filter(val => {
        if(!val.isFolder) {
          val.size = formatBytes(val.size) 
          return true
        }
      })
    },
  },
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
</style>
