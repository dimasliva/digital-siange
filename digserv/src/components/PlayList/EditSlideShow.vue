<template>
  <div class="modal_window" @click="closeModal">
    <AreYouSureModal v-if="openWarning" :slide="added_slide" @savemodal="addSlide" @closemodal="openWarning = false"/>
    <div class="modal_container">
      <div class="modal" @click.stop>
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
                  <option :value="false">По расписанию</option>
                </select>
                <select v-else v-model="period">
                  <option :value="true">В течении периода</option>
                  <option :value="false">По расписанию</option>
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

            <div v-if="method !== 'play'" class="slide_delay">
              <b>Интервал показа страниц/слайдов</b>
              <input v-model="time_delay"/>
            </div>

          <div class="taskFilesBox">
            <div class="selected_slide">
              <div @click="removeSlide(list)" class="list-item" v-for="(list, i) in slides" :key="i">
                <div class="d-flex">
                <div class="prewiew_img">
                  <img v-if="list.folder" src="@/assets/imgs/folder.svg"/>
                  <img 
                    v-else-if="list.id.split('.')[list.id.split('.').length - 1] === 'png'" 
                    :src="`/media/${list.id}`"
                  />
                  <img v-else-if="list.id.split('.')[list.id.split('.').length - 1] === 'pdf'" src="@/assets/imgs/stuff/document.png"/>
                  <img v-else :src="'/thumb/'+list.id+'.jpg'"/>
                </div>
                  <div class="slide_info">
                    <b>{{list.name}}</b>
                  </div>
                </div>
                <div class="list-item-buttons">
                  <button @click.stop="moveImg(i, 'top')" type="button" title="Вверх"><img src="@/assets/imgs/playlist/up.svg"></button>
                  <button @click.stop="moveImg(i, 'down')" type="button" title="Вниз"><img src="@/assets/imgs/playlist/down.svg"></button>
                  <button @click.stop="removeSlide(list)" type="button" title="Убрать"><img src="@/assets/imgs/playlist/remove.svg"></button>
                </div>
              </div>
            </div>

          <div class="all_slides">
            <div @click="addSlide(list)" class="list-item" v-for="list in files" :key="list">
              <div class="d-flex">
                <div class="prewiew_img">
                  <img v-if="list.id === 'folder_up'" src="@/assets/imgs/stuff/folder-up.svg"/>
                  <img v-else-if="list.isFolder" src="@/assets/imgs/folder.svg"/>
                  <img 
                    v-else-if="list.id.split('.')[list.id.split('.').length - 1] === 'png'" 
                    :src="`/media/${list.id}`"
                  />

                  <img v-else-if="list.id.split('.')[list.id.split('.').length - 1] === 'pdf'" src="@/assets/imgs/stuff/document.png"/>
                  <img v-else :src="'/thumb/'+list.id+'.jpg'"/>
                </div>
                <div class="slide_info">
                  <b>{{list.name}}</b>
                  <span v-if="!list.isFolder">Size: {{list.size}}</span>
                </div>
              </div>

              <div v-if="list.isFolder" class="list-item-buttons">
                <button v-if="list.id !== 'folder_up'" @click.stop="openFolder(list)" type="button" title="Открыть"><img src="@/assets/imgs/playlist/openfolder.svg"></button>
                <!-- add folder -->
                <button v-if="list.id !== 'folder_up'" @click.stop="addSlide(list, 'add')" type="button" title="Добавить папку"><img src="@/assets/imgs/playlist/addfolder.svg"></button>
              </div>
              <div v-else class="list-item-buttons">
                <button @click.stop="addSlide(list)" type="button" title="Добавить"><img src="@/assets/imgs/playlist/add.svg"></button>
              </div>

            </div>
          </div>
          </div>
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
import {formatBytes} from "@/api/playlist/func"
import AreYouSureModal from './AreYouSureModal.vue'

export default {
  components: { AreYouSureModal },
  name: 'EditSlideShow',
  data: () => ({
    openWarning: false,
    time_start: "00:00",
    time_end: "00:00",
    time_delay: 0,
    period: false,
    slides: [],
    all_slides: [],
    method: "",
    added_slide: {},
  }),
  props: {
    title: String,
    index: Number,
    item: Object,
  },
  mounted() {
    if(this.item.schedule) {
      for (let index = 0; index < this.item.schedule.length; index++) {
        if(index === 0) {
          this.time_start = this.item.schedule[0].hour + ":" + this.item.schedule[0].minute
        } else {
          this.time_end = this.item.schedule[1].hour + ":" + this.item.schedule[1].minute
          this.period = true
        }
      }
    } else {
      this.period = null
    }
    console.log('item',this.item)
    this.method = this.item.method
    this.slides = this.item.resource
    this.time_delay = this.item.delay
    this.getFiles()
  },
  methods: {
    async addSlide(list, type, sure = false) {
      this.added_slide = list
      console.log('addSlide', this.added_slide)
      if(sure === true) {
        this.slides.unshift({folder: list.isFolder, id: list.id, name: list.name})
        this.openWarning = false
        return
      }
      console.log('list', list)
      if(list.isFolder) {
        if(list.id === 'folder_up') {
          this.getFiles()
          return
        }
        if(type === 'add') {
          let in_folder = await this.showFolder(list)
          let formats = []
          in_folder.map(val => {
            let format = val.id.split('.')[val.id.split('.').length - 1]
            formats.push(format)
          })
          if(this.method === 'play' && formats.includes('jpg', 'pdf', 'png')) {
            this.openWarning = true
            return
          }
          if(this.method === 'slideshow' && formats.includes('mp4', 'pdf')) {
            this.openWarning = true
            return
          }
          if(this.method === 'document' && formats.includes('jpg', 'mp4', 'png')) {
            this.openWarning = true
            return
          }
          return
        }
        this.openFolder(list)
        return
      }
      this.slides.unshift({folder: list.isFolder, id: list.id, name: list.name})
    },
    moveImg(index, type) {
      let toIndex = 0
      const element = this.slides.splice(index, 1)[0]
      if(type === 'top') {
        toIndex = index - 1
      } else if(type === 'down') {
        toIndex = index + 1
      }
      this.slides.splice(toIndex, 0, element)
    },
    removeSlide(list) {
      let index = this.slides.findIndex(el => el.id === list.id)
      console.log(index)
      this.slides.splice(index, 1)
    },

    async getFiles() {
      await fetch("/api/files/list_all").then(async res => {
        let lists = await res.json()
        this.all_slides = lists.result
        this.all_slides = this.all_slides.filter(val => {
          
          if(val.isFolder === true) {
            return true
          }
          let last_i = val.id.split('.').length - 1
          console.log(last_i)
          console.log(this.method)
          val.size = formatBytes(val.size) 
          if(this.method === 'play' && val.id.split('.')[last_i] === 'mp4') {
            return true
          }
          if(this.method === 'slideshow' && val.id.split('.')[last_i] === 'jpg') {
            return true
          }
          if(this.method === 'doc' && val.id.split('.')[last_i] === 'pdf') {
            return true
          }
          return false
        })
        console.log('all_slides', this.all_slides)
      })
    },
    async showFolder(folder) {
      let resp = await fetch(`/api/files/list?folder=${folder.id}`)
      let result = await resp.json()
      let res = result.result
      return res
    },
    async openFolder(folder) {
      await fetch(`/api/files/list?folder=${folder.id}`).then(async res => {
        let lists = await res.json()
        this.all_slides = lists.result

        this.all_slides = this.all_slides.filter(val => {
          
          if(val.isFolder === true) {
            return true
          }
          let last_i = val.id.split('.').length - 1
          if(val.id.split('.')[last_i] === 'mp4') {
            return false
          }
          val.size = formatBytes(val.size) 
          return true
        })
        this.all_slides.unshift({
          id: "folder_up",
          isFolder: true,
          name: "Up",
        })
        console.log('all_slides', this.all_slides)
      })
    },
    saveModal() {
      let data
      let start = this.time_start.split(':')
      let start_time = {hour: start[0], minute: start[1]}


      console.log('start_time', start_time)
      if(this.period === null) {
        if(this.method === 'play') {
          data = {
            schedule: null,
            resource: this.slides,
          }           
        } else {
          data = {
            schedule: null,
            delay: this.time_delay,
            resource: this.slides,
          } 
        }       
        this.$emit('savemodal', data, this.index)
        return
      }
      if(this.period) {
        let end = this.time_end.split(':')
        let end_time = {hour: end[0], minute: end[1]}

        data = {
          schedule: [start_time, end_time],
          delay: this.time_delay,
          resource: this.slides,
        }
      } else {
        data = {
          schedule: [start_time],
          delay: this.time_delay,
          resource: this.slides,
        }
      }
      this.$emit('savemodal', data, this.index)
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
  computed: {
    files() {
      return this.all_slides
    }
  }
}
</script>
<style scoped>
  @media (max-width: 1190px) {
    .modal_window .modal_container {
      width: 99%;
    }
    .modal_container .modal {
      width: 100%;
    }
  }
  @media (max-width: 414px) {
    .taskFilesBox {
      flex-direction: column;
    }
    .modal_container .modal {
      width: 100%;
      height: 100%;
    }
    .modal_container .modal .footer {
      padding-right: 15px;
    }
    .taskFilesBox .all_slides {
      margin-top: 10px;
    }
    .taskFilesBox .selected_slide {
      min-height: 128px;
    }
    .select_time input, .select_time select {
      min-width: 165px;
    }
    .edit_task .time_container {
      flex-direction: column;
      align-items: center;
    }
    .time_container .select_time {
      padding: 5px 0;
      width: 90%;
    }
  }
  .edit_task {
    width: 100%;
  }
  .list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 10px 5px 5px;
    box-sizing: border-box;
    border-bottom: 1px solid #DDD;
    cursor: pointer;
  }
  .slide_delay {
    padding: 5px 20px;
    color: #080808;
    font-size: 14px;
  }
  .slide_delay b {
    margin-right: 10px;
  }
  .list-item .slide_info {
    display: flex;
    flex-direction: column;
    color: #080808;
    font-size: 14px;
    justify-content: flex-start;
    margin: auto 0;
  }
  .prewiew_img {
    display: flex;
    justify-content: center;
    width: 130px;
  }
  .prewiew_img img {
    height: 56px;
    align-self: stretch;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: auto 48px;
    margin-right: 10px;
  }
  .selected_slide, .all_slides {
    flex-grow: 1;
    flex-basis: 50%;
    margin: 0 5px;
    overflow-y: auto;
    background: #FFF;
    border: 1px solid #AAA
  }
  .d-flex {
    display: flex;
  }
  .space-between {
    justify-content: space-between;
  }
  .taskFilesBox {
    display: flex;
    align-items: stretch;
    flex-grow: 1;
    flex-shrink: 1;
    overflow: hidden;
  }
  .time_container {
    display: flex;
    align-content: flex-start;
    justify-content: flex-start;
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
    overflow-y: scroll;
  }
  .modal_container .modal {
    width: 1190px;
    background-color: #efefef;
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
    min-width: 165px;
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
