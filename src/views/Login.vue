<template>
	<div class="main_content">
    <Header />
    <WarningModal :isActive="openWarning" :text="warningText"/>
    <LoginModal v-if="openLogin" @savemodal="authUser" @closemodal="openLogin = false"/>
		<div class="content">
      <div class="header">Доступ ограничен</div>
      <div class="login" @click="openLogin = true">Выполните вход</div>
		</div>
	</div>
</template>

<script>
import Header from '@/components/Header.vue'
import LoginModal from '@/components/LoginModal.vue'
import { getCookie } from '@/api/func'
import WarningModal from '@/components/WarningModal.vue'

export default {
  name: 'Login',
  components: {
    Header,
    LoginModal,
    WarningModal,
  },
  data: () => ({
    openLogin: false,
    openWarning: false,
    warningText: "",
  }),
  mounted() {
    console.log()
    if(this.$route.query.login) {
      this.openLogin = true
    }
  },
  methods: {
    async authUser(user) {
      let formData = new FormData()
      for(let name in user) {
        formData.append(name, user[name]);
      }
      fetch("/login", {
        method: 'POST',
       credentials: 'same-origin',
        body: formData
      }).then((res) => {
        if(res.status === 302) {
        }
        let session_id = getCookie('session_id')
        let username = getCookie('user')
        if(session_id && username) {
          this.$router.push({name: 'PlayLists'})
          return
        } else {
          this.warningText = 'Не верный логин или пароль'
          this.openWarning = true

          setTimeout(() => {
          this.warningText = 'Не верный логин или пароль'
          this.openWarning = false
          }, 2000)
        }
       });
    }
  },
  watch: {
    page() {
      this.$router.replace({query: {}})
      this.openLogin = true
    }
  },
computed: {
  page () {
    return this.$route.query.login
  }
}
}
</script>
<style scoped>
  .content {
    padding: 8px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    font-size: 14px;
  }
  .header {
    font-size: 1.6em;
    margin-bottom: 1em;
  }
  .login {
    color: #28d;
    cursor: pointer;
    text-decoration: underline;
  }
</style>
