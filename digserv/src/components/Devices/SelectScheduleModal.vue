<template>
<div @click="closeModal" id="playerGroup" class="ds-dialog-fog">
	<div @click.stop class="ds-minidialog">
		<div class="dialog-header">Выберите расписание</div>
		<div id="groupList" class="listview">
      <div @click.stop="selectSchedule(list)" class="list-item" v-for="list in lists" :key="list">
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

export default {
  name: 'SelectScheduleModal',
  data: () => ({
    lists: [],
  }),
  props: {
    item: Object,
  },
  mounted() {
    console.log('this.item', this.item)
    this.getLists()
  },
  methods: {
    async getLists() {
      await fetch("/api/schedules/list").then(async res => {
        let lists = await res.json()
        this.lists = lists.result
      })
    },
    async selectSchedule(list) {
      if(Array.isArray(this.item)) {
        this.item.map(async val => {
          await fetch("/api/players/assign", {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              "player": val.id,
              "group": list.id,
            })
          })
        })
        this.$emit('savemodal')
        return
      }
      await fetch("/api/players/assign", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "player": this.item.id,
          "group": list.id,
        })
      }).then(() => {
        this.$emit('savemodal')
      })
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
  computed: {
  }
}
</script>
<style scoped>  
.list-item .list-item-icon {
  background-image: url(@/assets/imgs/playlist/playlist.svg);
  background-size: 96px 46px;
  height: 46px;
}
.ds-dialog-fog {
  z-index: 4;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
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
  z-index: 4;
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
