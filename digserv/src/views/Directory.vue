<template>
	<div class="main_content" >
    <CreateFile v-if="openCreateFile" :folder="this.$route.params.id" @savefile="saveFile" :title="'Загрузка материалов'" @closemodal="openCreateFile = false"/>
    <CreateModal v-if="openCreateDir" :title="'Введите имя для новой папки'" @savemodal="createDir" @closemodal="openCreateDir = false"/>
    <FileToDir v-if="openMoveDir" @movefolder="moveToFolder" @closemodal="openMoveDir = false"/>
    <OpenImage v-if="openImg" :title="'Просмотр'" :item="clickedItem" @savemodal="saveName" @closemodal="openImg = false"/>
    <Header :btn="'Загрузить'" :btntwo="'Создать папку'" @openlist="openCreateFile = true" @opensecond="openCreateDir = true"/>
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
            <input @click.stop="selectImg(list)" type="checkbox" v-model="list.active" :style="{'visibility': !list.isFolder ? 'visible' : 'hidden'}">
          </div>
          <div @click="openImage(list)" class="list-item-icon" style="cursor: pointer;">
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
            <button title="Удалить" @click="delFile(list)"><img src="@/assets/imgs/playlist/delete.svg"/></button>
          </div>
        </div>
      </div>
      <div class="btns" v-if="btnsShow">
        <button @click="delFiles()" class="btn">Удалить</button>
        <button @click="openMoveDir = true" class="btn">Переместить</button>
      </div>
		</div>
	</div>
</template>

<script>
import Header from "@/components/Header.vue"
import CreateFile from '@/components/CreateFile.vue'
import CreateModal from '@/components/CreateModal.vue'
import {delFile, moveToFolder} from "@/api/stuff/func"
import {getFiles} from "@/api/func"
import FileToDir from '@/components/Stuff/FileToDir.vue'
import OpenImage from '@/components/Stuff/OpenImage.vue'

export default {
  name: 'Directory',
  data: () => ({
    lists: [],
    btnsShow: false,
    selectedImg: [],
    editName: false,
    nameChange: "",
    changedImg: {},
    clickedItem: {},
    openCreateFile: false,
    openCreateDir: false,
    openMoveDir: false,
    openImg: false,
  }),
  components: {
    Header,
    CreateFile,
    CreateModal,
    FileToDir,
    OpenImage
  },
  mounted() {
    this.getLists()
  },
  methods: {
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
      this.$router.go(-1)
    },
    async moveToFolder(folder) {
      let id = []
      console.log('folder', folder)
      console.log('selectedImg', this.selectedImg)
      if(this.selectedImg.length > 0) {
        this.selectedImg.map(val => {
          id.push(val.id)
        })
      }
      await moveToFolder(folder ? folder.id : null, id)
      this.getLists()
      this.btnsShow = false
      this.openMoveDir = false  
    },
    async createDir(title) {
      await fetch("/api/files/makedir", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "name": title,
          "parent": null,
        })
      }).then(() => {
        this.openCreateDir = false  
        this.getLists()
      })
    },
    async saveFile(file) {
      await fetch("/api/files/upload", {
        method: 'POST',
        body: file
      }).then(() => {
        this.openCreateFile = false  
        this.getLists()
      })
    },
    async saveName(list) {
      await fetch("/api/files/rename", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "id": list.id,
          "name": this.nameChange,
        })
      }).then(() => {
        list.edit = false
        this.editName = false
        this.lists.map(val => {
          val.edit = false
          val.active = false
        })
        this.selectedImg = []
        this.btnsShow = false
        this.getLists()
      })
    },
    async editImg(list) {
      if(list) {
        this.changedImg = list
        this.nameChange = list.name
        list.edit = true
      }
      this.editName = true
      this.selectedImg.map(val => {
        this.changedImg = val
        this.nameChange = val.name
        val.edit = true
      })
        this.btnsShow = false
      let input = document.querySelectorAll("#changeInput")
      this.$nextTick(() => {
        for (let index = 0; index < input.length; index++) {
          input[index].focus()
        }
      })
    },
    selectImg(list) {
      if(!this.editName) {
        console.log(2)
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
    async delFile(id) {
      await delFile(id)
      this.getLists()
    },
    async delFiles() {
      this.selectedImg.map(async list => {
        await delFile(list.id)
      })
      this.getLists()
    },
    async getLists() {
      this.lists = await getFiles(this.$route.params.id)
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
  .btn:first-child {
    margin-right: 5px;
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
</style>
