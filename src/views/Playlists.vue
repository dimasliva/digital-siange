<template>
	<div class="main_content">
    <WarningModal :isActive="openWarning" :text="text_warning"/>
    <CreateModal v-if="openList" :title="'Создать новое расписание'" @savemodal="createFile" @closemodal="closeModal"/>
    <CreateModal v-if="openEditName" :item="clickedItem" :namebtn="'Сохранить'" :title="'Переименовать плейлист'" @savemodal="saveName" @closemodal="openEditName = false"/>
    <SelectScheduleModal v-if="openSetSchetdue" :item="clickedItem" :title="'Установить расписание для группы'" @savemodal="getLists" @closemodal="openSetSchetdue = false"/>
    <DeleteModal v-if="openDelSchedule" :title="'Удаление плейлиста'" :text="'Вы действительно хотите удалить плейлист '" :item="clickedItem" @savemodal="delSchedule" @closemodal="openDelSchedule = false"/>
    <Header :btn="'Создать Play-Лист'" @openlist="openList = true"/>
		<div class="content">
			<div class="table" width="100%">
				<div class="item" @click.stop="toEditPage(list.id)" v-for="list in lists" :key="list.id">
					<div class="td calendar-block"></div>
          <div class="title-list">
            <span v-show="!list.edit">{{list.name}}</span>
            <span class="date">Последние изменение: {{list.lastmod}}</span>
          </div>
          <div class="list-item-buttons">
            <button @click.stop="toEditPage(list.id)" title="Настроить"><img src="@/assets/imgs/playlist/settings.svg"></button>
            <button @click.stop="setSchedule(list)" title="Установить на плеерах"><img src="@/assets/imgs/playlist/schedule.svg"></button>
            <button @click.stop="editSchedule(list)" title="Переименовать"><img src="@/assets/imgs/playlist/rename.svg"></button>
            <button @click.stop="copySchedule(list)" title="Скопировать"><img src="@/assets/imgs/playlist/copy.svg"></button>
            <button @click.stop="openDel(list)" title="Удалить"><img src="@/assets/imgs/playlist/delete.svg"></button>
          </div>
				</div>
		  </div>
		</div>
	</div>
</template>

<script>
import CreateModal from '@/components/CreateModal.vue'
import Header from '@/components/Header.vue'
import {copySchedule, delSchedule, DateFormatter} from "@/api/func"
import SelectScheduleModal from '@/components/PlayList/SetSchetdueModal.vue'
import DeleteModal from '@/components/PlayList/DeleteModal.vue'
import { getSchedules } from '@/api/playlist/func'
import WarningModal from '@/components/WarningModal.vue'
export default {
  name: 'Playlists',
  components: {
    CreateModal,
    Header,
    SelectScheduleModal,
    DeleteModal,
    WarningModal
  },
  data: () => ({
    lists: [],
    text_warning: "",
    openList: false,
    editName: false,
    openDelSchedule: false,
    openSetSchetdue: false,
    clickedItem: null,
    openEditName: false,
    openWarning: false,
    nameChange: "",
    changedImg: {},
  }),
  mounted() {
    this.getLists()
  },
  methods: {
    setSchedule(item) {
      this.clickedItem = item
      this.openSetSchetdue = true
    },
    async copySchedule(item) {
      const resp = await copySchedule(item.id, item.name + '- 2');
      if(resp.status === 'ok') {
        this.getLists()
      }
    },
    async getLists() {
      let res = await getSchedules()
      if(res.status !== 'ok') {
        this.text_warning = "Ошибка сервера: Не удалось получить плейлисты"
        this.openWarning = true
        setTimeout(() => {
          this.openWarning = false
        }, 2000)
        return
      }
      this.lists = res.result
      this.openSetSchetdue = false
      this.lists.map(val => {
        val.lastmod = DateFormatter(val.lastmod)
      })
    },
    toEditPage(id) {
      this.$router.push(`/edit/${id}`)
    },
    async saveName(content, item) {
      await fetch("/api/schedules/rename", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "schedule": item.id,
          "name": content,
        })
      }).then(() => {
        this.openEditName = false
        this.getLists()
      })
    },
    editSchedule(list) {
      this.clickedItem = list
      this.openEditName = true
    },
    closeModal() {
      this.openList = false
    },
    async createFile(name) {
      await fetch("/api/schedules/create", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "name": name,
        })
      }).then(() => {
        this.closeModal()
        this.getLists()
      })
    },
    async openDel(list) {
      this.clickedItem = list
      this.openDelSchedule = true
      console.log(this.clickedItem)

    },
    async delSchedule(item) {
      this.openDelSchedule = false
      this.clickedItem = null
      let resp = await delSchedule(item.id)
      console.log('resp', resp)
      this.getLists()
    }
  },
}
</script>
<style scoped>
  .main_content {
    overflow-y: auto;
  }
  .modal_container {
    width: 100%;
    height: 100%;
    background-color: black;
    opacity: .7;
    z-index: 1;
  }
  .list-item-buttons {
    display: flex;
  }
  .item, .item .td .calendar span svg {
    transition: .3s all ease-in-out;
    cursor: pointer;
  }
	.main_content {
		width: 100%;
    height: 100%;
	}
	.main_content .content {
		display: flex;
		align-items: center;
		padding: 5px 5px 0 10px;
    width: 100%;
	}
	.table .td {
		text-align: center;
		padding: 0 10px;
    margin-right: 15px;
	}
  .table {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .table .item {
    display: flex;
    align-items: center;
    padding: 10px 10px 10px 5px;
    box-sizing: border-box;
    border-bottom: 1px solid #DDD;
  }
	.btns {
		display: flex;
		align-items: center;
    justify-content: end;
	}
	.btns .btn {
		padding: 8px;
		color: white;
		border: none;
		font-weight: bold;
		cursor: pointer;
	}
	.btns .btn-danger {
		background-color: #e83030;
		font-size: 18px;
		padding: 7px 12px;
	}
  .calendar-block {
    background-repeat: no-repeat;
    background-image: url("@/assets/imgs/playlist/playlist.svg");
    cursor: pointer;
    height: 48px;
    width: 60px;
  }
  .btn-edit {
    background-color: #54c341;
    padding: 0px 60px;
  }
  .title-list {
    display: flex;
    flex-direction: column;
    justify-content: start;
    width: 100%;
    font-size: 15px;
  }
  .title-list .date {

    font-weight: 400;
  }
  .title-list span {
    font-weight: bold;
  }
  .btn {
		padding: 8px;
    margin: 0px 3px;
		color: white;
		border: none;
		font-weight: bold;
		cursor: pointer;
    transition: .3s all ease-in-out;
	}
  .btn-green {
    margin-top: 10px;
    margin-left: 10px;
    background-color: #3fc23f;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 400;
    width: 160px;
  }
  .btn-green:hover {
    background-color: #36af36;
  }
  .btn-move {
    background-color: #3f85c2;
    height: 35px;
  }
  .btn-move svg {
    transform: rotate(270deg);
  }
  .btn.delete {
    background-color: #e73c3c;
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
  .btn-save {
    background-color: #54c341;
    float: left;
    transition: .3s all ease-in-out;
  }
  .btn-save:hover {
    background-color: #48b136;
  }
  .change_name {
    width: 57px;
  }
</style>
