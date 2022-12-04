<template>
	<div class="main_content">
    <CreateModal v-if="openList" :title="'Добавить новую группу'" :item="{name: ''}" @savemodal="createGroup" @closemodal="openList = false"/>
    <SelectScheduleModal v-if="openSchedule" :item="clickedItem" @savemodal="saveSchedule" @closemodal="openSchedule = false"/>
    <CreateModal v-if="openEditName" :title="'Сменить имя'" :item="clickedItem" @savemodal="changeName" @closemodal="openEditName = false"/>
    <ScreenModal v-if="openImage" :title="'Снимок экрана'" :item="clickedItem" @savemodal="saveName" @closemodal="openImage = false"/>
    <StatusModal v-if="openStatus" :item="clickedItem" @openschedule="toSchedule" @savemodal="saveStatus" @closemodal="openStatus = false"/>
    <AddPlayerModal v-if="openAddGroup" :item="clickedItem" @savemodal="getGroups" @closemodal="openAddGroup = false"/>
    <DeleteModal v-if="openDelGroup" :title="'Удаление группы'" @savemodal="delGroup" :text="'Вы действительно хотите удалить группу '" :item="clickedItem" @closemodal="openDelGroup = false"/>
    <Header :btn="'Создать группу'" @openlist="openList = true"/>
		<div class="content">
			<table cellpadding="5" width="100%">
        <tbody>
          <div v-for="list in lists" :class="{'list_group': list.players.length === 0, 'hide_group': list.active}" :key="list.id">
            <div class="group_name" @click="hideGroup(list)">
              <td colspan="6">
                <div class="group">
                  <span>{{list.name}}</span>
                  <div class="list-item-buttons">
                    <button @click.stop="selectSchedule(list.players, 'playlist')" type="button" title="Установить плейлист">
                      <img src="@/assets/imgs/device/schedule.svg">
                    </button>
                    <button @click.stop="addPlaylist(list)" v-if="list.name !== 'Все'" type="button" title="Добавить в группу">
                      <img src="@/assets/imgs/device/add.svg">
                    </button>
                    <button v-if="list.name !== 'Все'" @click.stop="openDelete(list)" type="button" title="Удалить группу">
                      <img src="@/assets/imgs/playlist/delete.svg">
                    </button>
                    <button type="button" title="Свернуть">
                      <img :class="{'active': list.active}" src="@/assets/imgs/device/up.svg">
                    </button>
                  </div>
                </div>
              </td>
            </div>
            <div class="item" v-for="player in list.players" @click="selectSchedule(player, 'status')" :key="player.id">
              <td colspan="5">
                <div class="subgroup devices">
                  <img class="monitor-icon" src="@/assets/imgs/playlist/monitor.svg"/>
                  <div :class="{'active': player.status !== 'offline'}" class="device">
                    <span class="title">{{player.name}}</span>
                    <span class="number">{{player.status === 'live' ? 'Online' : player.status}}</span>
                    <span class="number">{{player.scheduleName}}</span>
                  </div>
                </div>
              </td>
              <td class="btns" colspan="3">
                <div class="list-item-buttons">
                  <button @click="selectSchedule(player, 'status')" title="Статус плеера"><img src="/static/icons/info.svg"></button>
                  <button @click.stop="selectSchedule(player, 'playlist')" title="Установить плейлист"><img src="/static/icons/schedule.svg"></button>
                  <button @click.stop="selectSchedule(player, 'edit')" title="Переименовать"><img src="/static/icons/rename.svg"></button>
                  <button @click.stop="selectSchedule(player, 'image')" title="Снимок экрана"><img src="/static/icons/camera.svg"></button>
                  <button @click.stop="delSchedule(player)" v-if="list.id !== 0" title="Убрать из группы"><img src="/static/icons/remove.svg"></button>
                </div>
              </td>
            </div>
          </div>
        </tbody>
		  </table>
		</div>
	</div>
</template>
<script>
import CreateModal from '@/components/CreateModal.vue'
import Header from '@/components/Header.vue'
import SelectScheduleModal from '@/components/Devices/SelectScheduleModal.vue'
import ScreenModal from '@/components/Playing/ScreenModal.vue'
import StatusModal from '@/components/Devices/StatusModal.vue'
import { delGroup, getGroups, getPlayers, removeCmd } from '@/api/func'
import AddPlayerModal from '@/components/Devices/AddPlayerModal.vue'
import DeleteModal from '@/components/PlayList/DeleteModal.vue'
import { groupExclude } from '@/api/stuff/func'

export default {
  components: { CreateModal, Header, SelectScheduleModal, ScreenModal, StatusModal, AddPlayerModal, DeleteModal },
  name: 'ActiveLists',
  data: () => ({
    lists: [],
    players: [],
    playersId: [],
    openList: false,
    openSchedule: false,
    openEditName: false,
		openImage: false,
		openStatus: false,
		openAddGroup: false,
    openDelGroup: false,
    clickedItem: {},
  }),
  mounted() {
    this.getPlayes()
  },
  methods: {
    async saveSchedule() {
      this.getGroups()
      this.openSchedule = false
    },
    async delSchedule(player) {
      let res = await groupExclude(player.group, player.id)
      if(res.status === 'ok') {
        this.getGroups()
      }
    },
    addPlaylist(group) {
      this.openAddGroup = true
      this.clickedItem = group
    },
    toSchedule(item) {
      this.clickedItem = item
      this.openSchedule = true
    },
    async changeName(name, item) {
      await fetch("/api/players/rename", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          player: item.id,
        })
			}).then(() => {
        this.openEditName = false
				this.clickedItem = null
        this.getPlayes()
      })
    },
    selectSchedule(list, type) {
      this.clickedItem = list
      if(type === 'playlist') {
        this.openSchedule = true
      } else if(type === 'edit') {
        this.openEditName = true
      } else if(type === 'image') {
        this.openImage = true
      } else if(type === 'status') {
        this.openStatus = true
      }
    },
    async getPlayes() {
			this.players = await getPlayers()
      this.players.map(val => {
        this.playersId.push(val.id)
      })
      console.log('players', this.players)
      this.getGroups()
    },
    async getGroups() {
      this.lists = await getGroups()
      if(this.playersId.length > 0) {
        this.lists.map(val => {
          val.players = val.players.map(player => {
            let i = this.playersId.indexOf(player.id)
            if(i !== -1) {
              return this.players[i]
            }
            return player
          })
        })
      }

      console.log("groups", this.lists)
      this.openList = false
      this.openAddGroup = false
    },
    hideGroup(list) {
      list.active = !list.active 
    },
    async delPlayer(id) {
			const resp = await removeCmd(id)
			this.getGroups()
    },
    async createGroup(name) {
      await fetch("/api/groups/create", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "name": name,
        })
      }).then(() => {
        this.getGroups()
      })
    },
    openDelete(item) {
      this.clickedItem = item
      this.openDelGroup = true
    },
    async delGroup(item) {
      let resp = await delGroup(item.id)
			if(resp.status === 'ok') {
        this.openDelGroup = false
        this.clickedItem = null
        this.getGroups()
      }
    }
  },
}
</script>
<style>
  :root {
    --group-height: 47px;    
  }
</style>
<style scoped>
  @media (max-width: 414px) {
    .item td .device, .item td .device .number {
      font-size: 12px ;
    }
  }
	.main_content {
		width: 100%;
	}
	.main_content .content {
		display: flex;
		align-items: center;
    width: 100%;
    padding: 3px;
	}
  table {
    width: 100%;
  }
  .item td {
    padding:0px
  }
  .group, .subgroup {
    width: 100%;
    height: 60px;
    color: white;
    text-align: start;
    font-size: 18px;
    font-weight: bold;
    position: relative;
  }
  .group {
    display: flex;
    justify-content: space-between;
    background-color: #EEE;
    color: black;
    align-items: center;
    box-sizing: border-box;
    border-bottom: 1px solid #DDD;
    height: var(--group-height);
  }
  .subgroup {
    padding-top: 0px;
    padding-left: 50px;
  }
  .group span {
    font-size: 14px;
    margin: 0px 10px;
  }
  .subgroup span {
    color: #000;
    font-weight: bold;
  }
  .group img {
    margin-top: 5px;
  }
  .delete {
    background-color: #e73c3c;
  }
  .btn-green {
    margin-top: 10px;
    margin-left: 10px;
    background-color: #3fc23f;
    border-radius: 6px;
    font-size: 16px;
    width: 140px;
  }
  .btn-move {
    background-color: #4391d2;
  }
  .btn-info {
    background-color: #49b4e2;
  }
	.btn {
		padding: 8px;
		color: white;
		border: none;
		cursor: pointer;
	}
  table .item th {
    padding: 10px;
  }
	td .device {
		display: flex;
    flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		flex-wrap: nowrap;
    margin-left: 20px;
    font-size: 15px;
  }
	.device.active span {
		opacity: 1;
		color: #000914;
	}
	.device span {
		font-weight: bold;
		opacity: 0.5;
	}
	.device.active img {
		opacity: 1;
	}
	.device img {
		opacity: 0.5;
	}
	.device .number {
		opacity: 0.2;
		font-size: 14px;
		color: #898c8f;
		font-weight: 300;
    }
  .btn-edit {
    background-color: #ffc61c;
  }
  .btn-arrow {
    background-color: #60db27;
  }
  .list_group, .show_group {
    display: flex;
    position: relative;
    width: 99%;
    height: 100%;
    margin: 3px 0px var(--group-height) 3px;
  }
  .list_group .item td, .show_group .item td{
    position: absolute;
    left: 0;
  }
  .hide_group .item {
    position: relative;
    width: 100%;
    height: 100%;
    display: none;
  }
  .group_name {
    cursor: pointer;
    width: 100%;
  }
  .hide_group .group_name {
    display: flex;
  }
  .group_name .group svg {
    transition: .3s all ease-in-out;
    transform: rotate(180deg);
    margin-left: 5px;
  }
  .group_name td, .hide_group .group_name td {
    display: flex;
    width: 100%;
  } 

  .hide_group .group_name .group svg {
    transition: .3s all ease-in-out;
    transform: rotate(90deg);
  }
  .btn-block {
    background-color: #ff911c;
  }
  .remove_group {
    color: #000;
    transition: .2s all ease-in-out;
    -webkit-user-select: none;        
    -moz-user-select: none;
    -ms-user-select: none; 
    user-select: none;
  }
  .remove_group:hover {
    color: #ee5c5c;
  }
  .list-item-buttons {
    display: flex;
    align-items: center;
  }
  img {
    transition: .3s all ease-in-out;
  }
  img.active {
    transform: rotate(180deg);
  }
  .item {
    padding: 5px 10px 5px 5px;
    border-bottom: 1px solid #DDD;
    display: flex;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;
  }
  .subgroup.devices img {
    height: 45px;
    margin: 0px 10px;
  }
  .subgroup.devices, .btns {
    display: flex;
    align-items: center;
    padding-left: 15px;
  }
</style>
