<template>
	<div class="main_content">
    <Header />
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
import { getCookie, setCookie } from '@/api/func'

export default {
  name: 'Login',
  components: {
    Header,
    LoginModal,
  },
  data: () => ({
    openLogin: false
  }),
  mounted() {
    console.log()
    if(this.$route.query.login) {
      this.openLogin = true
    }
  },
  methods: {
    async authUser(user) {
      console.log(user)
      let formData = new FormData()
      for(let name in user) {
        formData.append(name, user[name]);
      }
      await fetch("/login", {
        method: 'POST',
        body: formData
      }).then(() => {
        setCookie('session_id', Math.ceil(Math.random()*100000), 1)
        setCookie('user', user.name, 1)
        let session_id = getCookie('session_id')
        let username = getCookie('user')
        console.log(session_id)
        console.log(username)
        if(session_id && username) {
          this.$router.push({name: 'PlayLists'})
        }
      })
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
