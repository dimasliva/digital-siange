<template>
	<div class="main_content">
    <!-- Modal windows -->
    <Header :title="'Редактирование плейлиста '"/>
    <div class="basic-container">
      <div class="row">
        <div class="col">Идентификатор</div>
        <div class="col" id="playerSerial">{{device.id}}</div>
      </div>
      <div class="row">
        <div class="col">Примененное расписание</div>
        <div class="col" id="playerGroup">{{device.group}}</div>
      </div>
      <div class="row">
        <div class="col">Последний запрос</div>
        <div class="col" id="playerLast">{{device.lastacc}} (сейчас)</div>
      </div>
      <div class="row">
        <div class="col">IP-адрес медиаплеера</div>
        <div class="col" id="playerAddress">{{stats.ip_address}}</div>
      </div>
      <div class="row">
        <div class="col">Выполняемая задача</div>
        <div class="col" id="telemetryProc">{{stats.process_executable}} – {{stats.process_status}}</div>
      </div>
      <div class="row">
        <div class="col">Информация о функционировании устройства</div>
        <div class="col">
          <canvas ref="telemetryGraphs" width="300" height="90"></canvas>
          </div>
      </div>
      <div class="row">
        <div class="col">Часовой пояс медиаплеера</div>
        <div class="col">
          <select v-model="device.tz_offset" id="playerTimezone">
            <option disabled>Выберите часовой пояс</option>
          <option value="-43200">-12:00</option><option value="-39600">-11:00</option><option value="-36000">-10:00</option><option value="-32400">-9:00</option><option value="-28800">-8:00</option><option value="-25200">-7:00</option><option value="-21600">-6:00</option><option value="-18000">-5:00</option><option value="-14400">-4:00</option><option value="-10800">-3:00</option><option value="-7200">-2:00</option><option value="-3600">-1:00</option><option value="0">0:00</option><option value="3600">+1:00</option><option value="7200">+2:00</option><option value="10800">+3:00</option><option value="14400">+4:00</option><option value="18000">+5:00</option><option value="21600">+6:00</option><option value="25200">+7:00</option><option value="28800">+8:00</option><option value="32400">+9:00</option><option value="36000">+10:00</option><option value="39600">+11:00</option><option value="43200">+12:00</option></select>
          <button @click="setTimezone">Установить часовой пояс</button>
        </div>
      </div>
      <div class="row">
        <div class="col">Командный интерфейс медиаплеера</div>
        <div class="col">
          <div>
            <input v-model="command" type="text" placeholder="Введите команду" size="50" id="remoteCommandInput">
            <button type="button" @click="setCommand">Отправить команду</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Команда</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody id="remoteCommandLog">
              <tr v-for="list in logs" :key="list">
                <td>{{list.timestamp}}</td>
                <td>
                  <span v-for="command in list.params" :key="command">{{command}}</span>
                </td>
                <td>{{new Date(list.timestamp) < new Date() ? "Выполнено" : "Не выполнено"}}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <div>
            <button type="button" onclick="RemoteCommandClearHistory()">Очистить историю выполненных команд</button>
          </div>
        </div>
      </div>
    </div>
	</div>
</template>

<script>
import Header from '@/components/Header.vue'
import {getPlayerStatus} from "@/api/func"

export default {
  name: 'Player',
  components: {
    Header,
  },
  data: () => ({
    logs: [],
    device: {},
    stats: {},
    command: "",
  }),
  mounted() {
    this.getPlayerStatus()
    this.getCmdLogs()
  },
  methods: {
    async setCommand() {
      await fetch("/api/players/remotecmd", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          player: this.$route.params.id,
          command: this.command,
        })
			}).then(async res => {
        this.command = ""
        this.getPlayerStatus()
        this.getCmdLogs()
      })
    },
    async setTimezone() {
      await fetch("/api/players/set_timezone", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "player": this.$route.params.id,
	        "tzOffset": this.device.tz_offset,
        })
			}).then(async res => {
        const resp = await res.json()
        console.log('resp', resp)
      })
    },
    drawCanvase() {
      let graphs = this.$refs.telemetryGraphs.getContext('2d');
      graphs.font = '11px Tahoma, sans-serif';
      graphs.fillStyle = '#F66';
      graphs.fillRect(0, 8, 300, 20);
      graphs.fillStyle = '#A00';
      graphs.fillRect(0, 8, Math.round(parseFloat(this.stats.cpu) * 3), 20);
      graphs.fillStyle = '#6AF';
      graphs.fillRect(0, 38, 300, 20);
      graphs.fillStyle = '#06A';
      graphs.fillRect(0, 38, Math.round(parseFloat(this.stats.ram) * 3), 20);
      graphs.fillStyle = '#8C2';
      graphs.fillRect(0, 68, 300, 20);
      graphs.fillStyle = '#6A0';
      let t = this.stats.temperature ? Number(this.stats.temperature) : '0.0';
      graphs.fillRect(0, 68, Math.round(((t > 30 ? t : 30) - 30) * 6), 20);
      graphs.fillStyle = '#fff';
      graphs.fillText('CPU:  ' + this.stats.cpu, 6, 22);
      graphs.fillText('RAM:  ' + this.stats.ram, 6, 52);
      graphs.fillText('Температура: ' + t + '°C', 6, 82);
    },
    async getPlayerStatus() {
      const resp = await getPlayerStatus(this.$route.params.id)
      this.device = resp.device
      this.stats = resp.stats
      this.drawCanvase()
      console.log('resp', resp)
    },
    async getCmdLogs() {
      await fetch("/api/players/remotecmd/list", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          player: this.$route.params.id,
        })
			}).then(async res => {
        const resp = await res.json()
        if(resp.data.length === 0) {
          this.logs = [
            {
              "id": "a45872f542774c0a9b312def38d1fe31",
              "params": [
                "fdisk -l"
              ],
              "status": 1,
              "timestamp": "2022-11-22T05:42:01"
            },
            {
              "id": "90e8599aad2f4ebcaeeda13c96105ede",
              "params": [
                "reboot"
              ],
              "status": 1,
              "timestamp": "2022-11-18T07:55:59"
            },
            {
              "id": "7bf8fc9ae23948bcbcc8ec12ec4b0412",
              "params": [
                "reboot"
              ],
              "status": 1,
              "timestamp": "2022-11-17T09:26:58"
            }
          ]
          console.log('logs', this.logs)
          return
        }
        this.logs = resp.data

      })
    },
  },
  watch: {
    device() {
      this.drawCanvase()
    }
  }
}
</script>
<style scoped>
	.main_content {
		width: 100%;
	}
  .basic-container {
    padding: 8px;
    font-size: 14px;
  }
  .row {
    display: flex;
  }
.row > .col:nth-child(1) {
    width: 320px;
    padding: 5px 0;
}
.row > .col {
    padding: 5px 0;
}
canvas {
    aspect-ratio: auto 300 / 90;
}
table {
    width: 100%;
}

td {
    padding: 5px;
    vertical-align: top;
}
table th {
    text-align: left;
}
</style>
