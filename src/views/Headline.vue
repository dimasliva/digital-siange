<template>
	<div class="main_content">
    <Header :btntwo="'Установить для всех'" @opensecond="openEditAll = true"/>
    <CreateModal v-if="openEdit" :title="'Установить текст'" :item="clickedItem" @savemodal="updateSub" @closemodal="openEdit = false"/>
    <CreateModal v-if="openEditAll" :title="'Установить текст на всех устройствах'" @savemodal="updateAllSubs" @closemodal="openEditAll = false"/>
		<div class="content">
			<div class="table" width="100%">
				<div class="item" @click="editTicker(list)" v-for="list in lists" :key="list.id">
					<div class="td list_icon"></div>
          <div class="title-list">
            <span v-show="!list.edit">{{list.name}}</span>
          </div>
          <div class="list-item-buttons">
            <button @click="editTicker(list)" title="Переименовать"><img src="/static/icons/rename.svg"></button>
          </div>
				</div>
		  </div>
		</div>
	</div>
</template>

<script>
import Header from '@/components/Header.vue'
import {getSubs, updateSub, updateAllSubs} from "@/api/func"
import CreateModal from '@/components/CreateModal.vue'

export default {
  name: 'Headline',
  components: {
    Header,
    CreateModal
  },
  data: () => ({
		lists: [],
    openEditAll: false,
    openEdit: false,
    clickedItem: {},
  }),
  mounted() {
    this.getLists()
  },
  methods: {
    async updateAllSubs(content) {
      console.log('content', content)
      const resp = await updateAllSubs(content)
      this.openEditAll = false
      if(resp.status === 'ok') {
        this.getLists()
      }
    },
		async updateSub(content, item) {
      const resp = await updateSub(content, item.id)
      this.openEdit = false
      this.clickedItem = null
      if(resp.status === 'ok') {
        this.getLists()
      }
		},
    editTicker(item) {
      this.openEdit = true
      this.clickedItem = {...item, name: item.text}
      console.log('clickedItem', this.clickedItem)
    },
    async getLists() {
			this.lists = await getSubs()
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
	.list_icon {
    width: 96px;
    align-self: stretch;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: auto 48px;	
    background-image: url("@/assets/imgs/playlist/monitor.svg");
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
    display: flex;
    flex-direction: column;
  }
  .table .item {
    display: flex;
    align-items: flex-start;
    padding: 12px 10px 12px 5px;
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
