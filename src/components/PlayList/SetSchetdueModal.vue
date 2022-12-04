<template>
<div id="scheduleSetForGroup" class="ds-dialog-fog" @click="closeModal">
	<div class="ds-minidialog" @click.stop>
		<div class="dialog-header">{{title}}</div>
		<div id="playerGroupsList" class="listview">
      <div @click="addTask(list)" v-for="list in lists" :key="list.title" class="list-item">
         <div class="list-item-icon" style="cursor: pointer;">
         </div>
        <div class="list-item-caption" style="cursor: pointer;">{{list.name}}</div>
        <div class="list-item-buttons"></div>
      </div>
    </div>
		<div class="dialog-footer">
		  <button class="btn" @click="closeModal">Закрыть</button>
		</div>
    </div>
	</div>
</template>

<script>
import { getGroups, groupAssign } from '@/api/func'

export default {
  name: 'SetSchetdueModal',
  data: () => ({
    lists: []
  }),
  props: {
    title: String,
    item: Object
  },
  mounted() {
    this.getGroups()
  },
  methods: {
    async getGroups() {
      this.lists = await getGroups()
    },
    async addTask(item) {
      await groupAssign(item.id, this.item.id)
      this.saveModal()
    },
    saveModal() {
      this.$emit('savemodal')
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
}
</script>
<style scoped> 
.ds-dialog-fog {
    z-index: 99;
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
.ds-minidialog {
    max-width: 480px;
    width: 100%;
    max-height: 90%;
    overflow: hidden;
    background: #EFEFEF;
    border: 1px solid #080808;
    box-sizing: border-box;
    box-shadow: 0 0 8px rgb(0 0 0 / 30%);
    z-index: 101;
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
    width: 100%;
    display: inline-block;
}
.dialog-footer {
    margin: 0 5px;
    padding: 10px;
    text-align: right;
    border-top: 1px solid #CCC;
}
.list-item {
    display: flex;
    align-items: center;
    padding: 5px 10px 5px 5px;
    box-sizing: border-box;
    border-bottom: 1px solid #DDD;
}
.list-item-icon {
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
.list-item .list-item-icon {
  background-image: url(@/assets/imgs/playlist/group.svg);
  background-size: 96px 50px;
  height: 50px;
}
</style>
