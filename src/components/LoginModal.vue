<template>
<div id="moveFilesDialog" @click="closeModal" class="ds-dialog-fog">
	<div class="ds-minidialog" @click.stop>
		<div class="dialog-header">Войти</div>
    <div class="dialog-body">
    	<label for="user">Имя пользователя</label>
    	<input type="text" v-model="user.name" id="user" name="user">
    	<label for="pass">Пароль</label>
    	<input type="password" v-model="user.pass" id="pass" name="pass">
    </div>
		<div class="dialog-footer">
	     	<button class="btn" @click="saveModal">Войти</button>
      </div>
	  </div>
	</div>
</template>

<script>

export default {
  name: 'LoginModal',
  data: () => ({
    user: {
      name: "",
      pass: "",
    }
  }),
  props: {
  },
  computed: {
  },
  mounted() {
  },
  methods: {
    saveModal() {
      this.$emit('savemodal', this.user)
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
}
</script>
<style scoped>  
.ds-dialog-fog {
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
}
.dialog-body {
  padding: 5px;
}
.dialog-body input[type=text], .dialog-body input[type=password], .dialog-body select {
    display: block;
    padding: 6px;
    margin: 6px 0;
    width: 100%;
    box-sizing: border-box;
    background: #FFF;
    border: 1px solid #909090;
}
.ds-minidialog {
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
.dialog-header {
    background: #555;
    color: #FFF;
    margin: 0;
    padding: 10px;
    font-size: 1.3em;
    font-weight: bold;
}
.ds-minidialog .listview {
    max-height: 50vh;
    background-color: #FFF;
    padding: 4px;
    border: 1px solid #DEDEDE;
    display: block;
}
.list-item {
    display: flex;
    align-items: center;
    padding: 5px 10px 5px 5px;
    box-sizing: border-box;
    border-bottom: 1px solid #DDD;
}
.list-item-icon {
    background-image: url(@/assets/imgs/folder.svg);
    width: 96px;
    align-self: stretch;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: auto 48px;
}
.list-item-caption {
    flex-grow: 1;
    padding: 10px;
    min-height: 56px;
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
.dialog-footer {
    margin: 0 5px;
    padding: 10px;
    text-align: right;
    border-top: 1px solid #CCC;
}
</style>
