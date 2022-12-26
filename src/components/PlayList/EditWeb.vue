<template>
  <div class="modal_window" @click="closeModal">
    <WarningModal :isActive="openError" :text="warningText"/>
    <div class="modal_container">
      <div class="modal" @click.stop>
        <div class="head">
          <span>{{title}}</span>
          <img @click="closeModal" src="@/assets/imgs/playlist/delete.svg"/>
        </div>
        <div class="content">
          <div class="edit_task">

            <div class="time_container">
              <div class="select_time">
                <span>Выполнять</span>
                <select v-if="doMain" v-model="period">
                  <option :value="null">Как основную задачу</option>
                  <option :value="false">По расписанию</option>
                  <option :value="true">В течении периода</option>
                </select>
                <select v-else v-model="period">
                  <option :value="true">В течении периода</option>
                  <option :value="false">По расписанию</option>
                </select>
              </div>
              <div v-if="period !== null" class="select_time">
                <span>Повторять</span>
                <select v-model="repeat">
                  <option :value="false">Не повторять</option>
                  <option :value="true">Каждый час</option>
                </select>
              </div>
              <div v-if="period !== null" class="select_time">
                <span>Начало в</span>
                <input v-if="!repeat" type="time" v-model="time_start" />
                <input v-else type="number" v-model="time_start" />
              </div>
              <div v-if="period" class="select_time">
                <span>Завершение в</span>
                <input v-if="!repeat" type="time" v-model="time_end" />
                <input v-else type="number" v-model="time_end" />
              </div>
            </div>

            <div v-if="method === 'web'" class="web_block">
              <span>Пример: http://site.ru/your-page.htm</span>
              <input @keyup.enter="saveModal" placeholder="Введите url" v-model="url"/>
            </div>

            <div v-if="method === 'stream'" class="stream_block">
              <select>
                <option>Ручной ввод адресу стрима</option>
              </select>
              <input @keyup.enter="saveModal" placeholder="Введите url" v-model="url"/>
            </div>

            <div v-if="method === 'sleep'" class="sleep_block"></div>

          </div>
        </div>
        <div class="footer">
          <button @click="saveModal" class="btn">Ок</button>
          <button @click="closeModal" class="btn">Закрыть</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WarningModal from '../WarningModal.vue'

export default {
  name: 'EditWeb',
  data: () => ({
    openList: false,
    time_start: "00:00",
    time_end: "00:00",
    period: false,
    url: "",
    method: "",
    count_main_tasks: 0,
    doMain: true,
    openWarning: false,
    warningText: "",
    error: false,
    repeat: false,
    openError: false
  }),
  props: {
    title: String,
    index: Number,
    item: Object,
    schedules: Array,
  },
  components: {
    WarningModal
  },
  mounted() {
    if(this.item.schedule) {
      for (let index = 0; index < this.item.schedule.length; index++) {
        if(index === 0) {
          if(this.item.schedule[0].hour === '*') {
            this.time_start = this.item.schedule[0].minute
            this.repeat = true
          } else {
            this.time_start = this.item.schedule[0].hour + ":" + this.item.schedule[0].minute
          }
        } else {
          if(this.item.schedule[1].hour === '*') {
            this.time_end = this.item.schedule[1].minute
            this.period = true
          } else {
            this.time_end = this.item.schedule[1].hour + ":" + this.item.schedule[1].minute
            this.period = true
          }
        }
      }
    } else {
      this.period = null
    }
    
    this.schedules.map(val => {
      if(!val.schedule) {
        this.count_main_tasks += 1
      }
    })
    if(this.count_main_tasks > 0) {
      this.doMain = false
      if(!this.item.schedule) {
        this.doMain = true
      }
    }
    this.url = this.item.resource
    this.method = this.item.method
  },
  methods: {
    isValidHttpUrl(string) {
      let url;
      try {
        url = new URL(string);
      } catch (_) {
        return false;
      }
      return url.protocol === "http:" || url.protocol === "https:";
    },
    saveModal() {
      let data
      if(this.method !== 'sleep') {
        if(this.url.length === 0) {
          this.warningText = 'Заполните поле "Url"'
          this.openError = true
          setTimeout(() => {
            this.openError = false
          }, 2000)
          return  
        } 
        if(!this.isValidHttpUrl(this.url)) {
          this.warningText = 'Неверно заполнено поле "Url"'
          this.openError = true
          setTimeout(() => {
            this.openError = false
          }, 2000)
          return  
        }
      }
      if(this.period === null) {
        data = {
          schedule: null,
          resource: this.url,
        }
        this.$emit('savemodal', data, this.index)
        return
      }

      if(this.period) {
        if(this.repeat) {
          if(this.time_start < this.time_end) {
            data = {
              schedule: [{hour: '*', minute: this.time_start}, {hour: '*', minute: this.time_end}],
              resource: this.url,
            }
            this.$emit('savemodal', data, this.index)
            return
          }
          this.warningText = 'Поле "Начало в" больше поля "Завершение в"'
          this.openError = true
          setTimeout(() => {
            this.openError = false
          }, 2000)
          return          
        }
        let end = this.time_end.split(':')
        end.map(time => {
          if(time.length < 2) {
            this.warningText = 'Запонлите поле "Завершение в"'
            this.openWarning = true
            setTimeout(() => {
              this.openWarning = false
            }, 2000)
            this.error = true
          }
        })
        let end_time = {hour: end[0], minute: end[1]}

        data = {
          schedule: [start_time, end_time],
          resource: this.url,
        }
      } else {
        if(this.repeat) {
            data = {
              schedule: [{hour: '*', minute: this.time_start}],
              resource: this.url,
            }
            this.$emit('savemodal', data, this.index)
            return
        }
        let start = this.time_start.split(':')
        start.map(time => {
          if(time.length < 2) {
            this.warningText = 'Запонлите поле "Начало в"'
            this.openError = true
            setTimeout(() => {
              this.openError = false
            }, 2000)
            this.error = true
          }
        })
        let start_time = {hour: start[0], minute: start[1]}
        data = {
          schedule: [start_time],
          resource: this.url,
        }
      }
      if(!this.error) {
        this.$emit('savemodal', data, this.index)
      }
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
  watch: {
    repeat() {
      if(this.repeat) {
        if(this.time_start.length !== undefined) {
          this.time_start = 0
        }
        if(this.time_end.length !== undefined) {
          this.time_end = 0
        }
      }
    },
    time_start() {
      if(this.repeat) {
        if(this.time_start > 59) {
          this.time_start = 59
          this.warningText = 'Введите число в диапазоне 0-59'
          this.openError = true
          setTimeout(() => {
            this.openError = false
          }, 2000)
        }
      }
    },
    time_end() {
      if(this.repeat) {
        if(this.time_end > 59) {
          this.time_end = 59
          this.warningText = 'Введите число в диапазоне 0-59'
          this.openError = true
          setTimeout(() => {
            this.openError = false
          }, 2000)
        }
      }
    }
  },
}
</script>
<style scoped>
  .web_block {
    display: flex;
    flex-direction: column;
    width: 100%;
    color: #080808;
    padding: 0px 5px;
    font-size: 14px;
  }
  .web_block input {
    width: 100%;
    padding: 5px;
    font-size: 18px;
    margin-top: 5px;
    outline: none;
  }
  .stream_block {
    display: flex;
    width: 100%;
    color: #080808;
    padding: 0px 5px;
    font-size: 14px;
  }
  .stream_block input, .stream_block select {
    width: 50%;
    padding: 5px;
    font-size: 18px;
    margin-top: 5px;
    outline: none;
  }
  .edit_task {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: start;
  }
  @media (max-width: 960px) {
    .modal_window .modal_container {
      width: 99%;
    }
  }
  .time_container {
    display: flex;
    align-content: flex-start;
    justify-content: flex-start;
    width: 100%;
  }
  .select_time {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    color: #141414;
    padding: 10px;
    width: 26%;
  }
  .select_time select {
    width: 100%;
    box-sizing: border-box;
    padding: 5px;
    height: 40px;
  }
  .select_time span {
    font-size: 10pt;
    font-weight: bold;
    padding: 5px;
  }
  .modal_container {
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
  .modal_container .modal {
    max-width: 960px;
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
  .modal .head {
    background: #555;
    color: #FFF;
    margin: 0;
    padding: 10px;
    font-size: 1.3em;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  }
  .head img {
    filter: invert(1);
    cursor: pointer;
  }
  .modal .footer {
    width: 100%;
    padding: 10px;
    text-align: right;
    border-top: 1px solid #CCC;
    background-color: #efefef;
  }
  .modal .content {
    width: 100%;
    height: 100%;
  }
  .select_time input, .select_time select {
    width: 100%;
    box-sizing: border-box;
    padding: 5px;
    height: 40px;
  }

  .footer .btn {
    font: 400 10pt "Open Sans", "Segoe UI", "Liberation Sans", sans-serif;
    background: #888;
    color: #fff;
    border: 0;
    border-radius: 3px;
    padding: 5px 10px;
    margin: 0px 2px;
    vertical-align: bottom;
    min-width: 120px;
    cursor: pointer;
    display: inline-block;
    text-decoration: none;
  }
  .btn:hover {
    background: #797979;
  }
</style>
