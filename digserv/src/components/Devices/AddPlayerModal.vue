<template>
<div @click="closeModal" id="playerGroup" class="ds-dialog-fog">
	<div @click.stop class="ds-minidialog">
		<div class="dialog-header">Добавление плеера в группу</div>
		<div id="groupList" class="listview">
      <div @click.stop="addPlayer(list.id)" class="list-item" v-for="list in avaliblePlayers" :key="list">
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
import { getSubs, includePlayer } from '@/api/func'

export default {
  name: 'AddPlayerModal',
  data: () => ({
		lists: [],
    players: [],
    playersId: [],
  }),
  props: {
    item: Object,
  },
  mounted() {
    this.item.players.map(val => {
      this.playersId.push(val.id)
    })
    this.getSubs()
  },
  methods: {
    async getSubs() {
      this.lists = await getSubs()
      this.players.map(val => {
        this.playersId.push(val.id)
      })
    },
    async addPlayer(playerId) {
      await includePlayer(this.item.id, playerId)
      this.$emit('savemodal')
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
  computed: {
    avaliblePlayers() {
      return this.lists.filter(val => {
        let i = this.playersId.indexOf(val.id)
        if(i === -1) {
          return true
        }
      })
    }
  }
}
</script>
<style scoped>  
.list-item .list-item-icon {
  background-image: url(@/assets/imgs/playing/monitor.svg);
  background-size: 96px 46px;
  height: 46px;
}
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
  z-index: 2;
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
  overflow-y: auto;
}
.dialog-footer {
  margin: 0 5px;
  padding: 10px;
  text-align: right;
  border-top: 1px solid #CCC;
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
  cursor: pointer;
}
</style>
