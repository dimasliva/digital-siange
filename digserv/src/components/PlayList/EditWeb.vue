<template>
  <div class="modal_window">
    <div class="modal_container">
      <div class="modal">
        <div class="head">
          <span>{{title}}</span>
        </div>
        <div class="content">
          <div class="edit_task">

            <div class="time_container">
              <div class="select_time">
                <span>Выполнять</span>
                <select v-if="period === null" v-model="period">
                  <option :value="null">Как основную задачу</option>
                  <option :value="true">В течении периода</option>
                </select>
                <select v-else v-model="period">
                  <option :value="true">В течении периода</option>
                </select>
              </div>
              <div v-if="period !== null" class="select_time">
                <span>Повторять</span>
                <select>
                  <option>Не повторять</option>
                  <option>Каждый час</option>
                </select>
              </div>
              <div v-if="period !== null" class="select_time">
                <span>Начало в</span>
                <input type="time" v-model="time_start" />
              </div>
              <div v-if="period" class="select_time">
                <span>Завершение в</span>
                <input type="time" v-model="time_end" />
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
    <div class="modal_bg" @click="closeModal">

    </div>
  </div>
</template>

<script>

export default {
  name: 'EditWeb',
  data: () => ({
    openList: false,
    time_start: "00:00",
    time_end: "00:00",
    period: false,
    url: "",
    method: "",
  }),
  props: {
    title: String,
    index: Number,
    item: Object,
  },
  mounted() {
    for (let index = 0; index < this.item.schedule.length; index++) {
      if(index === 0) {
        this.time_start = this.item.schedule[0].hour + ":" + this.item.schedule[0].minute
      } else {
        this.time_end = this.item.schedule[1].hour + ":" + this.item.schedule[1].minute
        this.period = true
      }
    }
    this.url = this.item.resource
    this.method = this.item.method
      console.log('method', this.method)
  },
  methods: {
    saveModal() {
      let data
      let start = this.time_start.split(':')
      let start_time = {hour: start[0], minute: start[1]}

      console.log('start_time', start_time)
      if(this.period) {
        let end = this.time_end.split(':')
        let end_time = {hour: end[0], minute: end[1]}

        data = {
          time: [start_time, end_time],
          resource: this.url,
        }
      } else {
        data = {
          time: [start_time],
          resource: this.url,
        }
      }

      this.$emit('savemodal', data, this.index)
    },
    closeModal() {
      this.$emit('closeweb')
    },
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
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -40%);
    width: 960px;
    background: #EFEFEF;
    border: 1px solid #080808;
    box-sizing: border-box;
    z-index: 2;
    color: white;
  }
  .modal .head {
    background: #555;
    color: #FFF;
    margin: 0;
    padding: 10px;
    font-size: 1.3em;
    font-weight: bold;
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
  }
  .select_time input, .select_time select {
    width: 100%;
    box-sizing: border-box;
    padding: 5px;
    height: 40px;
  }

  .modal_bg{
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: black;
    opacity: .7;
    z-index: 1;
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
</style>
