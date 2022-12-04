<template>
	<div class="main_content">
    <!-- Modal windows -->
    <WarningModal v-if="openWarning" :text="text_warning"/>
    <CreateTask v-if="openCreateTask" :title="'Добавить новую задачу'" @addtask="createTask" @closemodal="openCreateTask = false"/>
    <EditSlideShow v-if="['slideshow', 'play', 'doc'].includes(clickedItem?.method)" :item="clickedItem" :index="openIndex" @savemodal="saveModal"  :title="'Редактирование задачи'" @closemodal="clickedItem = null"/>
    <EditWeb v-if="['web', 'stream', 'sleep'].includes(clickedItem?.method)" :item="clickedItem" :index="openIndex" :title="'Редактирование задачи'" @savemodal="saveModal" @closeweb="clickedItem = null"/>
    <Header :btn="'Добавить'" :btntwo="'Сохранить плейлист'" :issave="activeSave" :title="'Редактирование плейлиста '+ title" @opensecond="saveSchedule" @openlist="openCreateTask = true"/>
		<div class="content">
			<div class="list-item" @click="openElement(list, i)" v-for="(list, i) in lists" :key="i">
				<div class="calendar-block">
          <div class="icons">
            <span v-if="list.method === 'slideshow'">
              <img src="@/assets/imgs/playlist/slideshow.svg"/>
            </span>
            <span v-else-if="list.method === 'play'">
              <img src="@/assets/imgs/playlist/type-video.svg"/>
            </span>
            <span v-else-if="list.method === 'doc'">
              <img src="@/assets/imgs/playlist/document.svg"/>
            </span>
            <span v-else-if="list.method === 'web'">
              <img src="@/assets/imgs/playlist/type-web.svg"/>
            </span>
            <span v-else-if="list.method === 'stream'">
              <img src="@/assets/imgs/playlist/type-stream.svg"/>
            </span>
            <span v-else-if="list.method === 'sleep'">
              <img src="@/assets/imgs/playlist/type-monitor.svg"/>
            </span>
          </div>
        </div>
				<div class="title_row">
          <div class="title-list">
            <span class="title">{{list.method === 'slideshow' 
              ? 'Слайдшоу' 
              : list.method === 'play' ? 'Видео' 
              : list.method === 'web' ? 'Web-страница' 
              : list.method === 'stream' ? 'Трансляция' 
              : list.method === 'sleep' ? 'Спящий режим' 
              : list.method === 'doc' ? 'Документ ' : 'Другое'
            }}</span>
            <span class="info_list" v-if="Array.isArray(list.resource)">{{list.resource.length}} элемент</span>
            <span class="info_list" v-else>{{list.resource}}</span>
            <span class="info_list" v-if="list.schedule === null">Основная задача</span>
            <span class="info_list" v-else-if="list.schedule[1]">
            {{'С ' + list.schedule[0]?.hour + ':' + list.schedule[0]?.minute +
              ' До ' + list.schedule[1]?.hour + ':' + list.schedule[1]?.minute}}
            </span>
            <span class="info_list" v-else-if="!list.schedule[1]">
              {{'В ' + list.schedule[0].hour + ':' + list.schedule[0].minute}}
            </span>
          </div>
        </div>
        <div class="list-item-buttons">
          <button @click.stop="openElement(list, i)" type="button" title="Изменить"><img src="/static/icons/rename.svg"></button>
          <button @click.stop="delTask(list)" type="button" title="Удалить"><img src="/static/icons/delete.svg"></button>
        </div>
			</div>
		</div>
	</div>
</template>

<script>
import CreateModal from '@/components/CreateModal.vue'
import Header from '@/components/Header.vue'
import EditSlideShow from '@/components/PlayList/EditSlideShow.vue'
import EditWeb from '@/components/PlayList/EditWeb.vue'
import CreateTask from '@/components/PlayList/CreateTask.vue'
import WarningModal from '@/components/PlayList/WarningModal.vue'

export default {
  name: 'ListEdit',
  components: {
    CreateModal,
    Header,
    EditSlideShow,
    EditWeb,
    CreateTask,
    WarningModal,
  },
  data: () => ({
    lists: [],
    title: "",
    openCreateTask: false,
    openEditSlideshow: false,
    openEditWeb: false,
    openWarning: false,
    activeSave: false,
    clickedItem: {},
    time_start: {},
    openIndex: 0,
    doc_delay: 0,
    text_warning: "",
  }),
  mounted() {
    this.getLists()
  },
  methods: {
    delTask(list) {
      let index = this.lists.indexOf(list)
      this.lists.splice(index, 1)
      this.saveSchedule()
    },
    createTask(data) {
      console.log("data", data)
      this.lists.map(val => {
        if(val.schedule === null) {
          data.schedule = [{hour: '00', minute: '00'}]
        }
      })
      this.lists.push(data)
      this.openCreateTask = false
      this.clickedItem = data
      this.openIndex = this.lists[this.lists.length - 1]
      this.activeSave = true
    },
    openElement(list, index) {
      this.openIndex = index
      this.clickedItem = list
      console.log('list', list)
    },
    saveModal(data, i) {
      this.lists[i] = {...this.lists[i], ...data}
      this.clickedItem = null
      this.openIndex = null
      this.openCreateTask = false
      this.activeSave = true
      console.log('activeSave', this.activeSave)
    },
    async getLists() {
      await fetch("/api/schedules/read", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "schedule": this.$route.params.id,
        })
      }).then(async res => {
        let lists = await res.json()
        this.title = lists.data.name
        this.lists = lists.data.schedule
        console.log('lists', this.lists)
      })
    },
    async saveSchedule() {
      let count_main
      count_main = this.lists.filter(val => {
        if(val.schedule === null) {
          return true
        }
      })
      console.log('count_main', count_main.length)
      if(count_main.length === 1 ) {
        await fetch("/api/schedules/save", {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "id": this.$route.params.id,
            "description": this.lists
          })
        }).then(() => {
          this.activeSave = false
          this.getLists()
          this.text_warning = "Расписание сохранено" 
          this.openWarning = true
          setTimeout(() => {
            this.openWarning = false
          }, 2000)
        })
        return
      }
      this.text_warning = "Основная задача должна быть одна" 
      this.openWarning = true
      setTimeout(() => {
        this.openWarning = false
      }, 2000)
      console.log('openWarning', this.openWarning)
      console.log('count_main', count_main)
    },
  },
}
</script>
<style scoped>
  .modal_container {
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
	.main_content {
		width: 100%;
    height: 100%;
	}
	.main_content .content {
		display: flex;
    flex-direction: column;
		align-items: center;
		padding: 5px 0 0 10px;
    width: 100%;
	}
	table th {
		font-weight: 400;
		font-size: 18px;
		padding: 0 10px 10px 10px;
		text-align: center;
	}
	table td {
		text-align: center;
		padding: 0 10px;
	}
	table td {
		margin: 8px 0;
	}
	.btns {
		display: flex;
		align-items: center;
    justify-content: end;
	}
  .icons {
    cursor: pointer;
  }
  .title-list {
    display: flex;
    flex-direction: column;
    padding: 10px;
    min-height: 56px;
    text-align: left;
    font-size: 14px;
  }
  .title-list .title {
    font-weight: bold;
  }
  .calendar-block {
    width: 70px;
  }
  .list-item-buttons {
    display: flex;
  }

  #changeName {
    text-align: left;
    width: 100%;
    padding: 10px;
    padding-left: 0px;
    font-size: 16px;
    border: 0;
    outline: none;
  }
  .title_row {
    width: 100%;
  }
  .title-list .info_list {
    font-size: 14px;
    font-weight: 400;
  }
  .list-item {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 5px 10px 5px 5px;
    box-sizing: border-box;
    border-bottom: 1px solid #DDD;
    cursor: pointer;
  }
</style>
