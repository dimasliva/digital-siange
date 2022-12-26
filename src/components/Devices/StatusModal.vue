<template>
<div @click="closeModal" id="playerSummary" class="ds-dialog-fog">

	<div @click.stop class="ds-minidialog">
    <!-- monitor.tpl rip-off -->
    <div class="dialog-header">
      <div class="toolbarheader">Статус медиаплеера <span id="playerSummaryName">{{device.name}}</span></div>
    </div>
    <div class="dialog-body">
      <div class="microdialog_section">
        Идентификатор
      </div>
      <div class="microdialog_row" id="playerSummaryId">{{device.id}}</div>
        
      <div class="microdialog_section">Примененное расписание</div>
      <div class="microdialog_row" style="display: flex; align-items: center;">
        <span id="playerSummarySchedule">{{device.group}}</span>
        <button class="btn" style="margin-left: auto" @click="selectSchedule">Выбрать расписание</button>
      </div>
        
      <div class="microdialog_section">Последний запрос</div>
      <div class="microdialog_row" id="playerSummaryLastmod">{{device.lastacc}} ({{lastRequest}})</div>
        
      <div class="microdialog_section">IP-адрес медиаплеера</div>
      <div class="microdialog_row" id="playerSummaryAddress">{{stats.ip_address}}</div>
        
      <div class="microdialog_section">Выполняемая задача</div>
      <div class="microdialog_row" id="playerSummaryActivity">
        {{stats.process_executable}} <span v-if="stats.process_status">– {{stats.process_status}}</span>
      </div>
      <div class="microdialog_section">Бегущая строка</div>
      <div class="microdialog_row" style="display: flex; align-items: center;">
        <input type="text" v-model="ticker" placeholder="Введите бегущую строку" id="playerSummaryHeadline" style="margin-right: 1em;">
        <button class="btn" @click="updateSub">Установить</button>
      </div>
        
      <div class="microdialog_section">Уровень громкости проигрывания</div>
      <div class="microdialog_row">
        <input type="range" v-model="volume" min="0" max="100"/>
      </div>
    </div>
    <div class="dialog-footer">
      <div style="float:left">
        <button class="btn" @click="openDetail">Подробнее</button>
      </div>
      <div>
        <button class="btn" @click="saveVolume">Сохранить</button>
        <button class="btn btn-close" @click="closeModal">Закрыть</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import {updateSub, getPlayerStatus, getSubs, DateFormatter, DateDifference} from "@/api/func"

export default {
  name: 'SelectScheduleModal',
  data: () => ({
    device: {},
    stats: {},
    volume: "",
    ticker: "",
    lastRequest: "",
    openSchedule: false,
    subsId: []
  }),
  props: {
    item: Object,
  },
  mounted() {
    this.getStats()
    this.getSubs()
    this.getVolume()
    console.log('this.item', this.item)
  },
  methods: {
    async getSubs() {
      let subs = await getSubs()
      subs.map(val => {
        if(this.item.id === val.id) {
          this.ticker = val.text
        } 
        this.subsId.push(val.id)
      })
      console.log('subs', subs)
      console.log('subsId', this.subsId)
    },
    openDetail() {
      this.$router.push(`/players/${this.item.id}`)
    },
		async updateSub() {
      const resp = await updateSub(this.ticker, this.item.id)
      console.log('resp', resp)
    },
    selectSchedule() {
      this.$emit('openschedule', this.item)
    },
    async saveVolume() {
      await fetch("/api/subcontrols/set_volume", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "id": this.item.id,
          "volume": Number(this.volume),
        })
			}).then(() => {
        this.$emit('closemodal')
      })
    },
    async getStats() {
      const resp = await getPlayerStatus(this.item.id)
      console.log('resp.device', resp.device)
      this.lastRequest = await DateDifference(resp.device.lastacc)
      resp.device.lastacc = DateFormatter(resp.device.lastacc)
      console.log('getStats', resp)
      this.device = resp.device

      this.stats = resp.stats
      console.log('device', this.device)
    },
    async getVolume() {
      await fetch("/api/subcontrols/get_state", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "id": this.item.id,
        })
			}).then(async (res) => {
        const resp = await res.json()
        console.log('getVolume', resp)
        if(resp.status === 'ok') {
          this.volume = resp.result.volume
          return
        }
      })
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
  computed: {
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
  font-size: 14px;
}
.dialog-header {
  background: #555;
  color: #FFF;
  margin: 0;
  padding: 10px;
  font-size: 1.3em;
  font-weight: bold;
}

.ds-minidialog > .dialog-body {
  overflow: auto;
  padding: 5px;
}
.dialog-footer {
  margin: 0 5px;
  padding: 10px;
  text-align: right;
  border-top: 1px solid #CCC;
}
.microdialog_section {
  padding: 10px 5px;
  font-weight: bold;
}
.microdialog_row {
  padding: 0px 10px 10px;
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
.btn-close {
  margin-left: 5px;
}
.dialog-body input[type=text], .dialog-body input[type=password], .dialog-body select {
  display: block;
  padding: 6px;
  margin: 6px 0;
  width: 100%;
  box-sizing: border-box;
  background: #FFF;
  border: 1px solid #909090;
}
</style>
