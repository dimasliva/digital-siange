<template>
<div id="masterStep1" class="ds-dialog-fog" @click="closeModal">
    <WarningModal :isActive="openWarning" :text="warning_text"/>
		<div class="ds-dialog ds-dialog-master" @click.stop>
			<div class="dialog-header">{{currentStep === 0 ? 'Шаг 1 – выберите плееры' 
        : currentStep === 1 ? 'Шаг 2 – выберите плейлист для плееров' 
        : 'Шаг 3 – Укажите дополнительные опции'}}
        <img @click="closeModal" src="@/assets/imgs/playlist/delete.svg"/>
      </div>
			<div class="dialog-body" style="display: flex; flex-direction: row">
				<div class="master-steps">
					<div :class="{'current-step': currentStep === 0}">Выбор плееров</div>
					<div :class="{'current-step': currentStep === 1}">Выбор плейлиста</div>
          <div :class="{'current-step': currentStep === 2}">Дополнительно</div>
				</div>
				<div v-if="currentStep !== 2" class="master-body">
          <div v-if="currentStep === 0" id="masterPlayersList" style="overflow-y: auto; flex-grow: 1;">
            <div @click="toSelected(list)" v-for="list in sortedLists" :key="list.id" class="list-item">
              <div class="list-item-checkbox">
                <input type="checkbox" :checked="selectedList.includes(list)" style="visibility: visible;">
              </div>
              <div class="list-item-icon" style="cursor: pointer;">
              </div>
              <div class="list-item-caption" style="cursor: pointer;">{{list.name}}</div>
              <div class="list-item-buttons"></div>
            </div>
          </div>
          <!-- Step 2 -->
          <div v-if="currentStep === 1" id="masterSchedulesList" style="overflow: auto; flex-grow: 1;">
            <div v-for="playlist in playlists" :class="{'active': cickedPlaylist === playlist}" class="list-item" @click="selectPlaylist(playlist)" :key="playlist">
              <div class="list-item-icon" style="cursor: pointer;">
              </div>
              <div class="list-item-caption" style="cursor: pointer;">{{playlist.name}}</div>
              <div class="list-item-buttons"></div>
            </div>
          </div>
				</div>
        <!-- Step 3 -->
        <div v-if="currentStep === 2" class="master-body">
          <div style="padding: 10px 5px 5px">
            <div>
              <label><input v-model="additional.ticker" type="checkbox"> Установить бегущую строку</label>
            </div>
            <div v-if="additional.ticker" style="margin-top: 5px;">
              <label>Текст бегущей строки</label>
              <input class="ticker" v-model="ticker" type="text">
            </div>
          </div>
          <div style="padding: 10px 5px 5px">
            <div>
              <label><input v-model="additional.sleep" type="checkbox"> Добавить спящий режим</label>
            </div>
            <div style="margin-top: 5px;" v-if="additional.sleep">
              <table>
                <tbody><tr>
                  <td>Время спящего режима c </td>
                  <td><input v-model="sleep_start" type="time"></td>
                  <td> по </td>
                  <td><input v-model="sleep_end" type="time"></td>
                </tr>
              </tbody></table>
              <div style="background: #FD8; border: 1px solid #CA4; padding: 10px;">Задача перехода в спящий режим будет добавлена в выбраный плейлист</div>
            </div>
          </div>
				</div>
			</div>
			<div class="dialog-footer">
				<button class="btn" type="button" v-if="currentStep === 0" @click="closeModal">Отмена</button>
				<button class="btn" type="button" v-if="currentStep > 0" @click="currentStep -= 1">Назад</button>
				<button @click="nextStep" v-if="currentStep < 2" class="btn btn-primary" type="button">Далее</button>
				<button @click="saveMaster" v-if="currentStep === 2" class="btn btn-primary" type="button">Готово</button>
			</div>
		</div>
	</div>
</template>

<script>
import WarningModal from '../WarningModal.vue'

export default {
  components: { WarningModal },
  name: 'SelecteModal',
  data: () => ({
		lists: [],
		playlists: [],
		selectedList: [],
		cickedPlaylist: null,
    currentStep: 0,
    openWarning: false,
    warning_text: "",
    ticker: "",
    additional: {
      ticker: false,
      sleep: false,
    },
    time: [],
    sleep_start: "00:00",
    sleep_end: "01:00",
  }),
  props: {
    devices: Array
  },
  mounted() {
    this.lists = this.devices
    this.getPlaylists()
  },
  methods: {
    selectPlaylist(list) {
      this.cickedPlaylist = list
    },
    getGroups() {
      let groups = []
      this.selectedList.map(val => {
        groups.push(val.id)
      }) 
      this.selectedList = groups
    },
    getTime() {
      let start = this.sleep_start.split(':')
      let end = this.sleep_end.split(':')
      this.time = [{hour: start[0], minute: start[1]}, {hour: end[0], minute: end[1]}]
      console.log('time', this.time)
    },
    saveMaster() {
      this.getGroups()
        this.saveAssign()
      this.$emit('savemodal')

      if(this.additional.ticker) {
        this.saveMulticast()
      }
      if(this.additional.sleep) {
        this.getTime()
        this.saveSleep()
      }
      this.$emit('closemodal')
    },
    async saveMulticast() {
      await fetch("/api/subs/multicast", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "content": this.ticker,
          "players": this.selectedList,
        })
      }).then(() => {
        this.ticker = ""
      })
    },
    async saveAssign() {
      await fetch("/api/players/assign_multiple", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "players": this.selectedList,
          "schedule": this.cickedPlaylist.id,
        })
      })
    },
    async saveSleep() {
      await fetch("/api/schedules/add_sleep", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "schedule": this.cickedPlaylist.id,
          "time": this.time,
        })
      })
    },
    toSelected(list) {
      let i = this.selectedList.indexOf(list)
      if(i !== -1) {
        this.selectedList.splice(i, 1)
        return
      }
      this.selectedList.push(list)
    },
    nextStep() {
      if(this.currentStep === 0) {
        if(this.selectedList.length === 0) {
          this.warning_text = "Необходимо выбрать хотя бы одно устройство"
          this.openWarning = true 
          setTimeout(()=>{
            this.openWarning = false
          }, 2000)
          return
        }
        this.currentStep += 1
        this.getPlaylists()
        return
      }
      if(this.currentStep === 1) {
        if(this.cickedPlaylist !== null) {
          this.currentStep += 1
          return
        }
          this.warning_text = "Необходимо выбрать плейлист"
          this.openWarning = true 
          setTimeout(()=>{
            this.openWarning = false
          }, 2000)
      }
    },
    async getPlaylists() {
      await fetch("/api/schedules/list").then(async res => {
        let lists = await res.json()
        this.playlists = lists.result
      })
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
  computed: {
		sortedLists() {
			return this.lists.filter(x => {
				return x.id !== '2f383c5a758307c2'
			})
		}
  }
}
</script>
<style scoped>
th, td {
  padding: 10px;
  vertical-align: middle;
}
.dialog-body input[type=time], .dialog-body input .dialog-body select, .ticker {
  display: block;
  padding: 6px;
  margin: 6px 0;
  width: 100%;
  box-sizing: border-box;
  background: #FFF;
  border: 1px solid #909090;
}
#masterSchedulesList .list-item .list-item-icon {
  background-image: url(@/assets/imgs/playlist/playlist.svg);
  background-size: 96px 46px;
  height: 46px;
}
#masterSchedulesList .list-item.active {
  background-color: #ACE;
}
.list-item-icon {
  background-image: url(@/assets/imgs/playing/monitor.svg);
  height: 56px;
  width: 96px;
  background-repeat: no-repeat;
  background-size: 96px 56px;
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
  overflow-y: hidden;
}
.ds-dialog {
  max-width: 960px;
  width: 100%;
  height: 90%;
  max-height: 90%;
  overflow: hidden;
  background: #EFEFEF;
  border: 1px solid #080808;
  box-sizing: border-box;
  box-shadow: 0 0 8px rgb(0 0 0 / 30%);
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
  display: flex;
  justify-content: space-between;
}
.dialog-header img {
  filter: invert(1);
  cursor: pointer;
}
.ds-dialog > .dialog-body {
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  display: flex;
  flex-direction: row;
}
.dialog-footer {
  margin: 0 5px;
  padding: 10px;
  text-align: right;
  border-top: 1px solid #CCC;
}
.master-steps {
  width: 200px;
}
.master-body {
  flex-grow: 1;
  margin-left: 10px;
  border-left: 1px solid #AAA;
  padding: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-size: 14px;
}
.master-steps > .current-step {
  font-weight: bold;
  color: #000;
  padding: 10px;
}
.master-steps > div {
  padding: 10px;
  color: #999;
}
.list-item {
  display: flex;
  align-items: center;
  padding: 5px 10px 5px 5px;
  box-sizing: border-box;
  border-bottom: 1px solid #DDD;
}
.list-item-caption {
  flex-grow: 1;
  padding: 10px;
  min-height: 56px;
  font-size: 14px;
}
.btn.btn-primary {
  background: #6c8;
  margin-left: 5px;
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
</style>
