<template>
<div id="moveFilesDialog" @click="closeModal" class="ds-dialog-fog">
	<div class="ds-minidialog" @click.stop>
    <div class="dialog-header">
    </div>
    <div class="dialog-body">
      <span class="login100-form-title">Войти</span>
      <div class="wrap-input100 validate-input" :class="{'alert-validate': valid_user}" :data-validate="valid_user_text">
        <input type="text" autocomplete="off" placeholder="Имя пользователя" v-model="user.user" id="user" user="user">
        <span class="focus-input100-1"></span>
        <span class="focus-input100-2"></span>
      </div>
      <div class="wrap-input100 rs1 validate-input" :class="{'alert-validate': valid_pass}" :data-validate="valid_pass_text">
        <input type="password" placeholder="Пароль" v-model="user.pass" id="pass" user="pass">
        <span class="focus-input100-1"></span>
        <span class="focus-input100-2"></span>
      </div>
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
      user: "",
      pass: "",
    },
    valid_user_text: "Заполните поле",
    valid_pass_text: "Неверный пароль",
    valid_user: false,
    valid_pass: false,
  }),
  props: {
  },
  computed: {
    isAnyError() {
      return this.valid_user || this.valid_pass
    }
  },
  mounted() {
    document.addEventListener('keydown', e => {
      this.keyDown(e)
    })
  },
  unmounted() {
    document.removeEventListener('keydown', e => {
      this.keyDown(e)
    })
  },
  methods: {
    keyDown(e) {
      if(e.key === "Enter") {
        this.saveModal()
      }
    },
    saveModal() {
      this.valid_user = false
      this.valid_pass = false
      if(this.user.user === '' || this.user.user === 'Имя пользователя') {
        this.valid_user_text = "Заполните поле"
        this.valid_user = true
      }
      if(this.user.pass === '') {
        this.valid_pass_text = "Заполните поле"
        this.valid_pass = true
      }
      if(this.isAnyError) {
        return
      }

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
  overflow-y: hidden;
}
.dialog-body {
  padding: 5px;
}
.dialog-body input[type=text], .dialog-body input[type=password], .dialog-body select {
display: block;
    width: 100%;
    background: 0 0;
    font-family: OpenSans-Regular;
    font-size: 15px;
    color: #666;
    line-height: 1.2;
    height: 68px;
    padding: 0 25px;
        outline: none;
    border: none;
}
.ds-minidialog {
  width: 500px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 20px 0 rgb(0 0 0 / 10%);
  -moz-box-shadow: 0 3px 20px 0 rgba(0,0,0,.1);
  -webkit-box-shadow: 0 3px 20px 0 rgb(0 0 0 / 10%);
  -o-box-shadow: 0 3px 20px 0 rgba(0,0,0,.1);
  -ms-box-shadow: 0 3px 20px 0 rgba(0,0,0,.1);
  padding: 50px;
}
.btn {
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
  width: 100%;
  height: 60px;
  background-color: #4272d7;
  font-family: OpenSans-Regular;
  font-size: 14px;
  color: #fff;
  line-height: 1.2;
  text-transform: uppercase;
  -webkit-transition: all .4s;
  -o-transition: all .4s;
  -moz-transition: all .4s;
  transition: all .4s;
  margin-top: 20px;
}
.btn:hover {
  background-color: #333333;
}
.dialog-header {
  display: flex;
  justify-content: flex-end;
}
.wrap-input100 {
      width: 100%;
    position: relative;
    background-color: #fff;
    border: 1px solid #e6e6e6;
}
.login100-form-title {
  display: block;
  font-size: 30px;
  color: #555;
  line-height: 1.2;
  text-align: center;
  margin-bottom: 30px;
}
.symbol-input100 {
  position: absolute;
  top: 35%;
  left: 8%;
  width: 18px;
  height: 30px;
}
.focus-input100-1, .focus-input100-2 {
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    
}
.focus-input100-1::before, .focus-input100-2::before {
    content: "";
    display: block;
    position: absolute;
    width: 0;
    height: 1px;
    background-color: #4272d7;
}
.focus-input100-1::before {
    top: -1px;
    left: 0;
}
.focus-input100-1::after, .focus-input100-2::after {
    content: "";
    display: block;
    position: absolute;
    width: 1px;
    height: 0;
    background-color: #4272d7;
}
.focus-input100-1::after {
    top: 0;
    right: -1px;
}
.alert-validate::before {
    content: attr(data-validate);
    position: absolute;
    max-width: 70%;
    background-color: #fff;
    border: 1px solid #c80000;
    border-radius: 2px;
    padding: 4px 25px 4px 10px;
    top: 50%;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
    right: 12px;
    pointer-events: none;
    font-family: OpenSans-Regular;
    color: #c80000;
    font-size: 13px;
    line-height: 1.4;
    text-align: left;
    visibility: hidden;
    opacity: 0;
    -webkit-transition: opacity .4s;
    -o-transition: opacity .4s;
    -moz-transition: opacity .4s;
    transition: opacity .4s;
    visibility: visible;
    opacity: 1;
}
.alert-validate::after {
    content: '🔥';
    display: block;
    position: absolute;
    color: #c80000;
    font-size: 16px;
    top: 50%;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
    right: 18px;
}
</style>
