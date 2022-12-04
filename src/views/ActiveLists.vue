<template>
	<div class="main_content">
    <ScreenModal v-if="openImage" :title="'Снимок экрана'" :item="clickedItem" @savemodal="saveName" @closemodal="openImage = false"/>
    <SelecteModal v-if="openMaster" :devices="lists" @closemodal="openMaster = false"/>
    <CreateModal v-if="openTicker" :title="'Установить текст на всех устройствах'" :item="{name: ''}" @savemodal="setTicker" @closemodal="openTicker = false"/>
    <CreateModal v-if="openTextTicker" :title="'Установить бегущую строку'" :item="clickedItem" @savemodal="updateSub" @closemodal="openTextTicker = false"/>
		<Header :btn="'Мастер запуска плееров'" :btntwo="'Установить строку на всех'" @opensecond="openTicker = true" @openlist="openMaster = true"/>
		<div class="content">
			<table>
				<thead>
					<tr>
        	  <th></th>
						<th><b>Имя</b></th>
						<th><b>Плейлист</b></th>
						<th><b>Бегущая строка</b></th>
						<th></th>
        	</tr>
				</thead>
				<tbody>
					<tr v-for="(list, i) in lists" :key="i">
						<td class="list_icon">
						</td>
						<td class="replay">
							<span>{{list.name}}</span>
						</td>
						<td class="playlist">
							<router-link style="color: #28d;" :to="`/edit/${list.group}`">{{list.scheduleName}}</router-link>
							<br>
							<span style="color:red" v-if="list.lastError">{{list.lastError.error}}</span>
						</td>
						<td>
							<span v-if="list.text">{{list.text}}</span>
							<!-- <span>{{subs[i].text}}</span> -->
							<br/>
							<a @click="editText(list)" class="edit">Изменить</a>
						</td>
						<td class="list-item-buttons">
							<button @click="showImage(list)" type="button" title="Снимок экрана"><img src="@/assets/imgs/playlist/camera.svg"></button>
							<button @click="delPlayer(list)" type="button" title="Stop"><img src="@/assets/imgs/playlist/delete.svg"></button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
import Header from '@/components/Header.vue';
import ScreenModal from '@/components/Playing/ScreenModal.vue';
import {padTo2Digits, updateSub, removeCmd, getSubs} from "@/api/func"
import SelecteModal from '@/components/Playing/SelecteModal.vue';
import CreateModal from '@/components/CreateModal.vue';

export default {
  components: { Header, ScreenModal, SelecteModal, CreateModal },
  name: 'ActiveLists',
	data: () => ({
		lists: [],
		subs: [],
		clickedItem: {}, 
		openImage: false,
		openMaster: false,
		openTicker: false,
		openTextTicker: false,
	}),
	
	mounted() {
		this.getSubs()
	},
	methods: {
    async getPlayers() {
      await fetch("/api/players/list").then(async res => {
        let lists = await res.json()
        this.lists = lists.result
        console.log("players", this.lists)
				this.lists.forEach((val, i) => {
					val.text = this.subs[i].text
				})
				this.lists.map(val => {
					let d = new Date(val.lastacc)
  				let date = [
  				  padTo2Digits(d.getDate()),
  				  padTo2Digits(d.getMonth() + 1),
  				  d.getFullYear(),
  				].join('.');
					val.lastacc = date
				})
      })
    },
    async getSubs() {
			this.subs = await getSubs()
				this.getPlayers()
    },
		editText(list) {
			this.clickedItem = list
			this.clickedItem.name = list.text
			this.openTextTicker = true
		},
		showImage(list) {
			this.clickedItem = list
			this.openImage = true
		},
		async setTicker(content) {
      await fetch("/api/subs/broadcast", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
					"content": content
        })
			}).then(() => {
				this.openTicker = false
				this.getPlayers()
				this.getSubs()
      })
		},
		async updateSub(content, item) {
      const resp = await updateSub(content, item.id)
      if(resp.status === 'ok') {
				this.getPlayers()
				this.getSubs()
				this.openTextTicker = false
			}
			console.log('resp', resp)
    },
    async delPlayer(list) {
			await removeCmd(list.id)
			this.getPlayers()
    },
	},
	computed: {
		
	}
}
</script>
<style scoped>
  @media (max-width: 414px) {
		table tbody tr td {
			font-size: 12px !important;
		}
  }
	@media (max-width: 924px) {
		table td, table tr th {
			font-size: 14px;
		}
		table td .device span:last-child {
			font-size: 9px;
		}
		.replay {
			font-size: 12px;
		}
		.replay {
			margin-left: 10px;
		}
	}
	.main_content {
		width: 100%;
	}
	a.edit {
		color: #28d;
		text-decoration: underline;
		cursor: pointer;
	}
	.list_icon {
    width: 96px;
    align-self: stretch;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: auto 48px;	
    background-image: url("@/assets/imgs/playlist/monitor.svg");
	}
	.main_content .content {
		width: 100%;
		padding: 6px;
	}
	.content table {
    width: 100%;
    border-collapse: collapse;
	}
	td.playlist {
		vertical-align: middle;
	}
	table th {
		font-weight: 400;
		font-size: 18px;
		padding: 0 10px 10px 0px;
		text-align: center;
	}
	table thead tr th {
    padding: 10px;
    vertical-align: middle;
    text-align: left;
		font-size: 14px;
		white-space: nowrap;
    border-bottom: 2px solid #CCC;
		color: #000;
	}
	table tbody tr{
    align-items: center;
    max-height: 67px;
		height: 67px;
	}
	table tbody tr td {
		text-align: left;
		padding: 15px 10px;
		padding-left: 0;
		font-size: 15px;
    max-height: 67px;
	}
	.replay {
		font-weight: bold;
		font-size: 14px;
		margin-left: 15px;
	}
	.device {
		display: flex;
		justify-content: start;
		align-items: center;
		flex-wrap: nowrap;
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
	.device .title {
		margin:0px 10px;
	}
	.device.active .number {
		opacity: .7;
	}
	.device .number {
		opacity: .3;
		font-size: 12px;
		color: #898c8f;
		font-weight: 300;
	}
	.list-item-buttons {
		display: flex;
	}
</style>
