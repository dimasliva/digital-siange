<template>
	<div class="sidebar" :class="{toggled}">
    <AreYouSureModal v-if="openWarning" :routename="routeName" :warningtext="'Вы уходите со страницы, не сохранив плейлист.'" @savemodal="nextPage" @closemodal="openWarning = false"/>
		<div class="head">
			<b>DIGITAL SIGNAGE SERVER</b>
      <button id="sidebarSwitch" @click="toggleSidebar">☰</button>
		</div>
		<div class="content" :class="{toggled}">
      <div class="sidebar-menu">
        <div class="a"
          @click="goRoute('Players')"
          :class="{'active': $route.name === 'Players', 'disabled': $route.name === 'Login'}"
        >
					<img src="@/assets/imgs/sidebar/menuplaceholder.svg">
					<div>Воспроизведение</div>
        </div>
        <div class="a"
          @click="goRoute('Devices')"
         :class="{'active': $route.name === 'Devices' || $route.name === 'Player', 'disabled': $route.name === 'Login'}"
        >
					<img src="@/assets/imgs/sidebar/menuplaceholder.svg">
					<div>Устройства</div>
        </div>
        <div class="a"
          @click="goRoute('Playlists')"
          :class="{'active': $route.name === 'Playlists' || $route.name === 'ListEdit', 'disabled': $route.name === 'Login'}"
        >
					<img src="@/assets/imgs/sidebar/menuplaceholder.svg">
					<div>Плейлисты</div>
        </div>
        <div class="a"
          @click="goRoute('Stuff')"
          :class="{'active': $route.name === 'Stuff' || $route.name === 'Directory', 'disabled': $route.name === 'Login'}"
        >
					<img src="@/assets/imgs/sidebar/menuplaceholder.svg">
					<div>Материалы</div>
        </div>
        <div class="a"
          @click="goRoute('Headline')"
         :class="{'active': $route.name === 'Headline', 'disabled': $route.name === 'Login'}"
        >
					<img src="@/assets/imgs/sidebar/menuplaceholder.svg">
					<div>Бегущая строка</div>
        </div>
			</div>
		</div>
		<div class="disk" :class="{toggled}">
      <div class="sidebar-login-block" v-if="loggedUser">
        Выполнен вход как {{username}} <a class="cursor" @click="logout">Выйти</a>
      </div>
      <div class="sidebar-login-block" v-else>
        <router-link :to="{name: 'Login', query: {login: 'true'} }">Войти</router-link>
      </div>
      <div class="disk_avalible" v-if="loggedUser">
        <span>Материалы: {{this.media_space}}</span>
        <span>Свободно: {{total_space}}</span>
      </div>
      <canvas id="diskStatus" width="256" height="16"></canvas>
    </div>
	</div>
</template>

<script>
import { eraseCookie, formatBytes, getCookie } from '@/api/func'
import AreYouSureModal from './PlayList/AreYouSureModal.vue'
export default {
  components: { AreYouSureModal },
  name: 'Sidebar',
  data: () => ({
    total_space: 0,
    media_space: 0,
    loggedUser: false,
    toggled: false,
    username: "",
    routeName: "",
    openWarning: false,
  }),
  props: {
    isedit: Boolean,
  },
  mounted() {
    console.log('isedit', this.isedit)
    this.getUser()
    this.getSpace()
  },
  methods: {
    nextPage(name) {
      this.openWarning = false
      console.log('name', name)
      this.$emit('saveplaylist', false)
      this.$router.push({name: name})
    },
    goRoute(name) {
      console.log('isedit', this.isedit)
      if(this.isedit) {
        this.routeName = name
        this.openWarning = true
        return
      }
      this.$router.push({name: name})
    },
    getUser() {
      this.username = getCookie('user')
      let session_id = getCookie('session_id')
      if(session_id && this.username) {
        this.loggedUser = true
        return
      }
      this.$router.push({name: "Login"})
    },
    toggleSidebar() {
      this.toggled = !this.toggled
    },
    logout() {
      eraseCookie('session_id')
      eraseCookie('user')
      this.loggedUser = false
      this.$router.push({name: 'Login'})
    },
    async getSpace() {
      await fetch("/api/files/usage").then(async res => {
        let lists = await res.json()
        this.total_space = formatBytes(lists.total)
        this.media_space = formatBytes(lists.media)
        let root = document.querySelector(':root');
        let spaced = (lists.free / lists.total);
        root.style.setProperty('--spaced', spaced+'%');

      })
    }
  },
  watch:{
    $route (){
      this.getUser()
    },
    isedit() {
      console.log(this.isedit)
    }
  } 
}
</script>
<style scoped>
  :root {
    --spaced: 40%;
  }
  @media (max-width: 414px) {
    .sidebar {
      width: 100% !important;
      z-index: 2;
      height: auto !important;
    }
    .container .sidebar .content, .disk {
      display: none;
    }
    .container .sidebar .content.toggled {
      padding-bottom: 70px;
    }
    .container .sidebar .content.toggled, .container .sidebar .disk.toggled  {
      display: block;
    }
    .container .sidebar .disk.toggled {
      bottom: -5px;
    }
    .container .sidebar.toggled .head b {
      display: block;
    }
    .disk.toggled .sidebar-login-block {
      padding-bottom: 16px;
    }
  }
  .sidebar-login-block {
    padding-bottom: 25px;
  }
  .sidebar-login-block a {
    color:#28d;
  }
  .sidebar.toggled .content, .sidebar.toggled .head b, .disk.toggled  {
    display: none;
  }
  #sidebarSwitch {
    font-size: 18pt;
    vertical-align: middle;
    margin-top: -5px;
    margin-left: auto;
    border: 0;
    background: transparent;
    cursor: pointer;
    color: #FFF;
  }
	.sidebar {
		height: 100%;
    padding: 0px;
    background-color: #30363c;
    color: white;
    position: relative;
    font-size: 14px;
	}
	.sidebar .head {
    font-weight: bold;
    text-transform: uppercase;
    padding: 20px;
    display: flex;
    align-items: center;
    background: #202830;
    height: 72px;
    flex-shrink: 0;
    flex-grow: 0;
    box-sizing: border-box;
  }
  .head b {
    white-space: nowrap;
    margin-right: 20px;
    font-size: 14px;
  }
	.sidebar .content {
    width: 100%;
    display: flex;
    flex-direction: column;
    /* align-items: center; */
    font-size: 14px;
    text-align: left;
	}
  .sidebar-menu {
    padding: 5px 5px 0px 5px;
  }
  .sidebar-menu > .a {
    color: #CCC;
    padding: 15px;
    display: block;
    border-radius: 5px;
    display: flex;
    align-items: center;
    text-decoration: none;
    cursor: pointer;
  }
  .sidebar-menu > .a > img {
    margin-right: 20px;
    opacity: .4;
  }
  .sidebar-menu > .a.active > img {
    opacity: 1;
  }
	.sidebar .content .a.active {
    color: white;
    font-weight: bold;
	}
	.sidebar .content .a:hover {
		background-color: #20262c;
	}
  .disk_avalible {
    background-color: white;
    text-align: center;
    padding: 0px 5px;
    height: 20px;
    font-size: 11px;
    font-weight: bold;
    width: 90%;
    color: #000914;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
  }
  .disk_avalible::after {
    content: "";
    position: absolute;
    left: 0px;
    top: 0px;
    background-color: #30a5e8;
    width: var(--spaced);
    z-index: 3;
  }
  .sidebar .disk {
    position: absolute;
    left: 14px;
    bottom: 0px;
    width: 100%;
  }
</style>
