<template>
<div id="moveFilesDialog" @click="closeModal" class="ds-dialog-fog">
	<div class="ds-minidialog" @click.stop>
		<div class="dialog-header">Переместить файлы в папку</div>
		<div class="listview" id="targetFoldersList">
      <div @click="moveFolder(null)" v-if="$route.params.id" class="list-item">
        <div class="list-item-icon"></div>
        <div class="list-item-caption">Неотсортированное</div>
        <div class="list-item-buttons">
          <button type="button" @click="moveFolder(null)" title="Move">
            <img src="@/assets/imgs/stuff/move.svg">
          </button>
        </div>
      </div>
      <div @click="moveFolder(list)" class="list-item" v-for="list in folders" :key="list">
        <div class="list-item-icon">
        </div>
        <div class="list-item-caption">{{list.name}}</div>
        <div class="list-item-buttons">
          <button type="button" title="Move"><img src="@/assets/imgs/stuff/move.svg"></button>
        </div>
      </div>
    </div>
		<div class="dialog-footer">
	     	<button class="btn" @click="closeModal">Закрыть</button>
      </div>
	  </div>
	</div>
</template>

<script>
import { getFiles } from '@/api/stuff/func'

export default {
  name: 'FileToDir',
  data: () => ({
    folders: [],
  }),
  props: {
    items: Array,
  },
  computed: {
  },
  mounted() {
    this.getLists()
  },
  methods: {
    async getLists() {
      const resp = await getFiles(null)
      
      this.folders = resp.result.filter(val => {
        if(val.isFolder) {
          return true
        }
      })
      this.lists = resp
    },
    moveFolder(folder) {
      console.log('selectedFolder', folder)
      this.$emit('movefolder', folder)
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
}
</script>
<style scoped>  
.ds-dialog-fog {
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
    overflow-y: hidden;
}
.ds-minidialog {
    max-width: 480px;
    width: 100%;
    max-height: 90%;
    overflow: hidden;
    background: #EFEFEF;
    border: 1px solid #080808;
    box-sizing: border-box;
    box-shadow: 0 0 8px rgb(0 0 0 / 30%);
    z-index: 3;
    display: flex;
    flex-direction: column;
}
.dialog-header {
    background: #555;
    color: #FFF;
    margin: 0;
    padding: 10px;
    font-size: 1.3em;
    font-weight: bold;
}
.ds-minidialog .listview {
    max-height: 50vh;
    background-color: #FFF;
    padding: 4px;
    border: 1px solid #DEDEDE;
    display: block;
}
.list-item {
    display: flex;
    align-items: center;
    padding: 5px 10px 5px 5px;
    box-sizing: border-box;
    border-bottom: 1px solid #DDD;
    cursor: pointer;
}
.list-item-icon {
    background-image: url(@/assets/imgs/folder.svg);
    width: 96px;
    align-self: stretch;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: auto 48px;
}
.list-item-caption {
    flex-grow: 1;
    padding: 10px;
    min-height: 56px;
}
.list-item-buttons > button {
    margin-left: 5px;
    padding: 5px 15px;
    background: #EEE;
    color: #111;
    padding: 6px;
    border: 0;
    border-radius: 4px;
    font-family: inherit;
}
.dialog-footer {
    margin: 0 5px;
    padding: 10px;
    text-align: right;
    border-top: 1px solid #CCC;
}
</style>
