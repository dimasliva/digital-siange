<template>
  <div class="modal_window" @click="closeModal">
    <div class="modal_container">
      <div class="modal" @click.stop>
        <div class="head">
          <span>{{title}}</span>
        </div>
        <div class="content">
          <div @click="addTask(list)" v-for="list in lists" :key="list.title" class="list-item">
            <div class="list-item-icon" style="cursor: pointer;">
              <img :class="list.method" :src="require(`@/assets/imgs/playlist/${list.icon}`)"/>
            </div>
            <div class="list-item-caption" style="cursor: pointer;">{{list.title}}</div>
            <div class="list-item-buttons"></div>
          </div>
        </div>
        <div class="footer">
          <button @click="closeModal" class="btn">Закрыть</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'CreateTask',
  data: () => ({
    openList: false,
    lists: [
      {icon: "type-video.svg", title: "Видеоролики", method: "video",},
      {icon: "slideshow.svg", title: "Слайдшоу", method: "slide",},
      {icon: "document.svg", title: "Документ", method: "doc",},
      {icon: "type-web.svg", title: "Веб-страница", method: "web",},
      {icon: "type-stream.svg", title: "Видеопоток", method: "stream",},
      {icon: "type-monitor.svg", title: "Спящий режим", method: "monitor",},
    ]
  }),
  props: {
    title: String
  },
  mounted() {
  },
  methods: {
    addTask(list){
      let data 
      if(list.method === 'video') {
        data = {
          method: "play",
          resource: [],
          schedule: null,
        }
      } else if(list.method === 'slide') {
        data = {
          delay: 5,
          method: "slideshow",
          resource: [],
          schedule: null,
        }
      } else if(list.method === 'doc') {
        data = {
          delay: 5,
          method: "doc",
          resource: [],
          schedule: null,
        }
      } else if(list.method === 'web') {
        data = {
          method: "web",
          resource: "",
          schedule: null,
        }
      } else if(list.method === 'stream') {
        data = {
          method: "stream",
          resource: "",
          schedule: null,
        }
      } else if(list.method === 'sleep') {
        data = {
          method: "sleep",
          resource: "",
          schedule: null,
        }
      }
      this.$emit('addtask', data)
    },
    saveModal() {
      this.$emit('savemodal')
      this.name = ""
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
}
</script>
<style scoped> 
  @media (max-width: 414px) {
    .modal_container .modal .footer {
      padding-right: 20px;
    }
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
    width: 100%;
  }
  .modal_container .modal {
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
  .modal .head {
    background: #555;
    color: #FFF;
    margin: 0;
    padding: 10px;
    font-size: 1.3em;
    font-weight: bold;
  }
  .icon .doc, .icon .web, .icon .stream, .icon .monitor {
    width: 45px;
    height: 45px;
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
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background-color: #fff;
    padding: 5px 10px;
  }
  .modal .content input {
    margin: 0;
    border: 1px solid #CCC;
    padding: 10px;
    font-size: 1.2em;
    display: block;
    width: 100%;
    box-sizing: border-box;
    outline: none;
  }
  .icon img {
    width: 96px;
    height: 56px;
  }

  .list-item {
    display: flex;
    align-items: center;
    padding: 5px 10px 5px 5px;
    box-sizing: border-box;
    border-bottom: 1px solid #DDD;
    width: 100%;
  }
  .list-item-icon {
    width: 96px;
    align-self: stretch;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: auto 48px;
  }
  .list-item-icon img {
    width: 100%;
    height: 56px;
  }
  .list-item-caption {
    flex-grow: 1;
    padding: 10px;
    min-height: 56px;
    color: #000;
    font-size: 14px;
  }
</style>
