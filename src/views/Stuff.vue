<template>
	<div class="main_content" @click="unSelect">
    <CreateFile v-if="openCreateFile" :folder="null" @savefile="saveFile" :title="'Загрузка материалов'" @closemodal="openCreateFile = false"/>
    <CreateModal v-if="openCreateDir" :title="'Введите имя для новой папки'" @savemodal="createDir" @closemodal="openCreateDir = false"/>
    <CreateModal v-if="openEdit" :title="'Введите новое имя'" :item="clickedItem" @savemodal="saveName" @closemodal="openEdit = false"/>
    <CreateModal v-if="openDirEdit" :title="'Введите новое имя'" :item="clickedItem" @savemodal="saveDirName" @closemodal="openDirEdit = false"/>
    <OpenImage v-if="openImg" :title="'Просмотр'" :item="clickedItem" @savemodal="saveName" @closemodal="openImg = false"/>
    <FileToDir v-if="openMoveDir" :items="lists" @movefolder="moveToFolder" @closemodal="openMoveDir = false"/>
    <Header :btn="'Загрузить'" :btntwo="'Создать папку'" @openlist="openCreateFile = true" @opensecond="openCreateDir = true"/>
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
            <button @click="delImg(folder)" title="Удалить"><img src="@/assets/imgs/playlist/delete.svg"/></button>
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
            <img style="width: 50px;" v-if="list.id.split('.')[list.id.split('.').length - 1] === 'pdf'" src="@/assets/imgs/stuff/document.png"/>
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
            <button @click="delImg(list)" title="Удалить"><img src="@/assets/imgs/playlist/delete.svg"/></button>
          </div>
        </div>
      </div>
      <div class="btns" v-if="btnsShow">
        <button @click="delImg()" class="btn">Удалить</button>
        <button @click="fileToDir()" class="btn">Переместить</button>
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

export default {
  name: 'Stuff',
  data: () => ({
    lists: [],
    items: [],
    btnsShow: false,
    selectedImg: [],
    nameChange: "",
    clickedItem: {},
    openCreateFile: false,
    openCreateDir: false,
    openEdit: false,
    openDirEdit: false,
    openImg: false,
    openMoveDir: false,
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
    changeSrc(list) {
      console.log('error', list.id)
    },
    onDrop(e, folderId) {
      const itemId = e.dataTransfer.getData('itemId')
      this.selectedImg.unshift({id: itemId})
      this.moveToFolder({id: folderId})
      this.btnsShow = false
      console.log('onDrop', e)
      console.log('onDrop', folderId)
    },
    onDragStart(e, item) {
      e.dataTransfer.dropEffect = 'move'
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('itemId', item.id.toString())
      console.log('onDragStart', item)
    },
    async moveToFolder(folder) {
      let id = []
      this.selectedImg.map(val => {
        id.push(val.id)
      })
      await fetch("/api/files/move_multiple", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "folder": folder.id,
          "files": id,
        })
      }).then(() => {
        this.openMoveDir = false  
        this.getLists()
      })
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
      this.openImg = true
      this.clickedItem = image
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
    async saveName(title, list) {
      await fetch("/api/files/rename", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "id": list.id,
          "name": title,
        })
      }).then(() => {
        this.openEdit = false
        this.getLists()
      })
    },
    async saveDirName(title, list) {
      await fetch("/api/files/renamedir", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "id": list.id,
          "name": title,
        })
      }).then(() => {
        this.openDirEdit = false
        this.getLists()
      })
    },
    async delImg(item) {
      if(this.selectedImg.length > 0) {
        this.selectedImg.map(async list => {
          let i = this.lists.indexOf(list)
          if(i > -1) {
            this.lists.splice(i, 1)
            console.log("i", i)
          }
          await fetch("/api/files/del", {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              "filename": list.id,
            })
          }).then(() => {
            this.getLists()
            return
          })
        })
      } else if(item && !item.isFolder) {
        await fetch("/api/files/del", {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "filename": item.id,
          })
        }).then(() => {
          this.getLists()
          return
        })
      } else if(item.isFolder) {
        await fetch("/api/files/removedir", {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "id": item.id,
          })
        }).then(() => {
          this.getLists()
          return
        })
      }
    },
    async getLists() {
      await fetch("/api/files/list").then(async res => {
        let lists = await res.json()
        this.lists = lists.result
        this.btnsShow = false
        this.items = this.lists.filter(val => {
        if(!val.isFolder) {
          val.size = formatBytes(val.size) 
          return true
        }
        })
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
