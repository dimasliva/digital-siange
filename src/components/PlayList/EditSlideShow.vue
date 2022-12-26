<template>
  <div class="modal_window" @click="closeModal">
    <WarningModal :isActive="openError" :text="warningText"/>
    <AreYouSureModal v-if="openWarning" :warningtext="sure_text" :slide="added_slide" @savemodal="addSlide" @closemodal="openWarning = false"/>
    <AreYouSureModal v-if="openWarningEmpty" :warningtext="sure_text" :routename="'next'" @savemodal="saveModal" @closemodal="openWarningEmpty = false"/>
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

            <div v-if="method !== 'play'" class="slide_delay">
              <b>Интервал показа страниц/слайдов</b>
              <input type="number" v-model="time_delay"/>
            </div>

          <div class="container_slides">
            <div class="taskFilesBox">
              <div class="selected_slide"
                  @drop="onDrop($event, slides.length, 'inserted_all')"                   
                  @dragover.prevent
                  @dragenter.prevent
              >
                <div 
                  @click="removeSlide(list)" 
                  class="list-item" 
                  v-for="(list, i) in listSlides" 
                  :key="list"
                  draggable="true"
                  @dragstart="startDrag($event, list, 'inserted')"
                  @drop="onDrop($event, i, 'inserted')"
                  @dragover.prevent
                  @dragenter.prevent
                >
                  <div class="d-flex">
                    <div class="prewiew_img">
                      <img v-if="list?.folder" src="@/assets/imgs/folder.svg"/>
                      <img 
                        v-else-if="list.id && list.id.split('.')[list.id.split('.').length - 1] === 'png'" 
                        :src="`/media/${list.id}`"
                      />
                      <img v-else-if="list.id && list.id.split('.')[list.id.split('.').length - 1] === 'pdf'" src="@/assets/imgs/stuff/document.png"/>
                      <img v-else :src="'/thumb/'+list.id+'.jpg'"/>
                    </div>
                    <div class="slide_info" >
                      <b>{{list.name ? list.name : list.id}}</b>
                    </div>
                  </div>
                  <div class="list-item-buttons">
                    <button @click.stop="moveImg(i, 'top')" type="button" title="Вверх"><img src="@/assets/imgs/playlist/up.svg"></button>
                    <button @click.stop="moveImg(i, 'down')" type="button" title="Вниз"><img src="@/assets/imgs/playlist/down.svg"></button>
                    <button @click.stop="removeSlide(list)" type="button" title="Убрать"><img src="@/assets/imgs/playlist/remove.svg"></button>
                  </div>
                </div>
              </div>

            <div @drop="onDrop($event, files.length, 'all')"                   
                @dragover.prevent
                @dragenter.prevent class="all_slides"
            >
              <div 
                @click="addSlide(list)" 
                class="list-item" 
                v-for="list in files" 
                :key="list"
                @dragstart="startDrag($event, list, 'all')"
                draggable="true"
                @drop="onDrop($event, i, 'all')"
                @dragover.prevent
                @dragenter.prevent
              >
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
                  <button v-if="list.id !== 'folder_up'" @click.stop="addFolder(list)" type="button" title="Добавить папку"><img src="@/assets/imgs/playlist/addfolder.svg"></button>
                </div>
                <div v-else class="list-item-buttons">
                  <button @click.stop="addSlide(list)" type="button" title="Добавить"><img src="@/assets/imgs/playlist/add.svg"></button>
                </div>

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
import WarningModal from '../WarningModal.vue'

export default {
  components: { AreYouSureModal, WarningModal },
  name: 'EditSlideShow',
  data: () => ({
    openWarning: false,
    openWarningEmpty: false,
    sure_text: "",
    time_start: "00:00",
    time_end: "00:00",
    time_delay: 5,
    count_main_tasks: 0,
    period: false,
    doMain: true,
    slides: [],
    all_slides: [],
    method: "",
    added_slide: {},
    openError: false,
    warningText: "",
    error: false,
    repeat: false,
    to_inserted: false,
  }),
  props: {
    title: String,
    index: Number,
    schedules: Array,
    item: Object,
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
    this.method = this.item.method
    this.slides = this.item.resource
    this.time_delay = this.item.delay
    this.getFiles()
  },
  methods: {
    startDrag(evt, item, type) {
      evt.dataTransfer.dropEffect = 'move'
      evt.dataTransfer.effectAllowed = 'move'
      evt.dataTransfer.setData('itemID', item.id)
      evt.dataTransfer.setData('itemType', type)
    },
    onDrop(evt, toIndex, type) {
      const itemID = evt.dataTransfer.getData('itemID')
      const itemType = evt.dataTransfer.getData('itemType')
      const item = this.slides.find((item) => item.id == itemID)
      const index = this.slides.indexOf(item)
     
      console.log('itemType', type)
      console.log('type', type)
      if(itemType === 'inserted' && type === 'all') {
        this.removeSlide(item)
        return true
      }
      if(itemType === 'inserted' && type === 'inserted_all') {
        return false
      }
      if(itemType === 'inserted' && type === 'inserted') {
        this.slides.splice(index, 1)[0]
        this.slides.splice(toIndex, 0, item)
        this.to_inserted = true
        return
      }
      if(type === 'all' && itemType === 'all') {
        return false
      }
      if(itemType === 'all') {
        const files_item = this.all_slides.find((item) => item.id == itemID)
        if(files_item.isFolder) {
          this.addFolder(files_item)
          return
        }
        this.slides.push({folder: files_item.isFolder, id: files_item.id, name: files_item.name})
        console.log('slides', this.slides)
        return
      }
      if(type === 'all') {
        this.slides.splice(index, 1)[0]
        return
      }
    },
    async addFolder(list) {
      this.added_slide = list
      let in_folder = await this.showFolder(list)
      let formats = []
      in_folder.map(val => {
        let format = val.id.split('.')[val.id.split('.').length - 1]
        formats.push(format)
      })
      if(this.method === 'play' && formats.includes('jpg', 'pdf', 'png')) {
        this.sure_text ='Вы добавляете в список проигрывания папку, которая не содержит файлов подходящего типа.'
        this.openWarning = true
        return
      }
      if(this.method === 'slideshow' && formats.includes('mp4', 'pdf')) {
        this.sure_text ='Вы добавляете в список проигрывания папку, которая не содержит файлов подходящего типа.'
        this.openWarning = true
        return
      }
      if(this.method === 'document' && formats.includes('jpg', 'mp4', 'png')) {
        this.sure_text ='Вы добавляете в список проигрывания папку, которая не содержит файлов подходящего типа.'
        this.openWarning = true
        return
      }
      this.slides.unshift({folder: list.isFolder, id: list.id, name: list.name})
    },
    async addSlide(list, sure = false) {
      console.log('addSlide', list)
      this.added_slide = list
      if(sure === true) {
        this.slides.unshift({folder: list.isFolder, id: list.id, name: list.name})
        this.openWarning = false
        return
      }
      if(list.isFolder) {
        if(list.id === 'folder_up') {
          this.getFiles()
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
      console.log('slides', this.slides)
      console.log('list', list)
      console.log('index', index)
      this.slides.splice(index, 1)
    },

    async getFiles() {
      let time_start = this.time_start
      let time_end = this.time_end
      await fetch("/api/files/list_all").then(async res => {
        let lists = await res.json()
        this.all_slides = lists.result
        this.all_slides = this.all_slides.filter(val => {
          
          if(val.isFolder === true) {
            return true
          }
          let format = val.id.split('.')[val.id.split('.').length - 1]
          val.size = formatBytes(val.size) 
          if(this.method === 'play' && format === 'mp4') {
            return true
          }
          if(this.method === 'slideshow' && format === 'jpg') {
            return true
          }
          if(this.method === 'doc' && format === 'pdf') {
            return true
          }
          return false
        })
      })
      this.time_start = time_start
      this.time_end = time_end
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
          let format = val.id.split('.')[val.id.split('.').length - 1]
          val.size = formatBytes(val.size) 
          if(this.method === 'play' && format === 'mp4') {
            return true
          }
          if(this.method === 'slideshow' && format === 'jpg') {
            return true
          }
          if(this.method === 'doc' && format === 'pdf') {
            return true
          }
          return false
        })
        this.all_slides.unshift({
          id: "folder_up",
          isFolder: true,
          name: "Up",
        })
      })
    },
    saveModal(next) {
      let data

      if(this.slides.length === 0 && next !== 'next') {
        this.sure_text = "Вы создаёте пустой плейлист."
        this.openWarningEmpty = true
        return
      }
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
        if(this.repeat) {
          if(this.time_start < this.time_end) {
            data = {
              schedule: [{hour: '*', minute: this.time_start}, {hour: '*', minute: this.time_end}],
              delay: this.time_delay,
              resource: this.slides,
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
            this.openError = true
            setTimeout(() => {
              this.openError = false
            }, 2000)
            this.error = true
          }
        })
        let end_time = {hour: end[0], minute: end[1]}

        data = {
          schedule: [start_time, end_time],
          delay: this.time_delay,
          resource: this.slides,
        }
      } else {
        if(this.repeat) {
            data = {
              schedule: [{hour: '*', minute: this.time_start}],
              delay: this.time_delay,
              resource: this.slides,
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
          delay: this.time_delay,
          resource: this.slides,
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
  computed: {
    files() {
      return this.all_slides.filter(val => {
        let i = this.slides.find(x => x.id === val.id)
        let index = this.slides.indexOf(i)
        if(index === -1) {
          return true
        }
      })
    },
    listSlides() {
      return [...new Set(this.slides)];
    }
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
  @media (max-height: 905px) {
    .selected_slide, .all_slides {
      height: 100%;
    }
  }
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
    .modal_container .modal .footer {
      padding-right: 15px;
    }
/* 1600 761 */
    
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
    .time_container .select_time select {
      width: 50%;
    }
  }
  .edit_task {
    width: 100%;
    height: 84%;
    position: relative;
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
    word-break: break-word;
    max-width: 165px;
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
  .container_slides {
    height: 100%;
    overflow-y: auto;
  }
  .taskFilesBox {
    display: flex;
    align-items: stretch;
    flex-grow: 1;
    flex-shrink: 1;
    overflow: hidden;
    width: 100%;
    height: 100%;
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
    overflow-y: hidden;
  }
  .modal_container .modal {
    max-width: 960px;
    width: 100%;
    max-height: 90%;
    height: 86%;
    background: #EFEFEF;
    border: 1px solid #080808;
    box-sizing: border-box;
    box-shadow: 0 0 8px rgb(0 0 0 / 30%);
    z-index: 3;
    display: flex;
    flex-direction: column;
    display: flex;
    flex-direction: column;
    position: relative;
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
    z-index: 2;
  }
  .modal .content {
    width: 100%;
    height: 90%;
    overflow-y: auto;
    display: flex;
    align-items: flex-start;
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
    transition: .3s all;
  }
  .btn:hover {
    background: rgb(121, 121, 121);
  }
  .list-item-buttons {
    /* display: flex; */
  }
</style>
