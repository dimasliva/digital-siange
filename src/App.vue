<template>
  <div class="container">
    <Sidebar @saveplaylist="savePlaylist" :isedit="editedPlaylist"/>
    <div class="content">
      <HintModal v-if="openHint" @closemodal="openHint = false"/>
      <Hint @openhint="openHint = true" />
      <router-view @saveplaylist="savePlaylist"/>
    </div>
  </div>
</template>
<script>
// @ is an alias to /src
import Sidebar from '@/components/Sidebar.vue'
import Hint from './components/Hint/Hint.vue'
import HintModal from './components/Hint/HintModal.vue'

export default {
  name: 'App',
  components: {
    Sidebar, Hint,
    HintModal
  },
  data: () => ({
    openHint: false,
    editedPlaylist: false
  }),
  mounted(){
  },
  methods: {
    savePlaylist(isEdit) {
      this.editedPlaylist = isEdit
      console.log('savePlaylist', isEdit)
    }
  }
}
</script>
<style>
:root {
  --hint-size: 40px;
  --hint-white-size: 32px;
  --width-hint: 90%;
}
@media (max-width: 414px) {
  .container {
    flex-direction: column;
  }
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
  width: 100%;
}
.container {
	display: flex;
	width: 100%;
	height: 100%;
}
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
  font-family: "Open Sans", "Segoe UI", "Liberation Sans", sans-serif;
}
html, body {
	height: 100%;
	width: 100%;
}
.container .content {
  width: 100%;
  z-index: 2;
}
.list-item-buttons > button {
  margin-left: 5px;
  padding: 5px 15px;
  background: #EEE;
  color: #111;
  padding: 6px;
  border: 0;
  border-radius: 4px;
  font-family: inherit;
}
.list-item-buttons > button:hover {
  background: #d3d3d3;
}
.btn {
  font: 400 10pt "Golos Text", "Open Sans", "Segoe UI", "Liberation Sans", sans-serif;
  background: #888;
  color: #fff;
  border: 0;
  border-radius: 3px;
  padding: 5px 10px;
  vertical-align: bottom;
  min-width: 120px;
  cursor: pointer;
  display: inline-block;
  text-decoration: none;
}
.btn:hover {
  background: #737373;
}
.btn:first-child {
  margin-right: 5px;
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
.cursor {
  cursor: pointer;
}
</style>
