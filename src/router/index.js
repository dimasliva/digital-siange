import { createRouter, createWebHistory } from 'vue-router'
import ActiveLists from '@/views/ActiveLists.vue'
import Devices from '@/views/Devices.vue'
import Lists from '@/views/Lists.vue'
import Stuff from '@/views/Stuff.vue'
import ListEdit from '@/views/ListEdit.vue'
import Directory from '@/views/Directory.vue'
import Player from '@/views/Player.vue'
import Headline from '@/views/Headline.vue'
import Login from '@/views/Login.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/activity',
    name: 'PlayLists',
    component: ActiveLists
  },
  {
    path: '/device',
    name: 'Devices',
    component: Devices
  },
  {
    path: '/lists',
    name: 'Lists',
    component: Lists
  },
  {
    path: '/stuff',
    name: 'Stuff',
    component: Stuff
  },
  {
    path: '/headlines',
    name: 'Headline',
    component: Headline
  },
  {
    path: '/edit/:id',
    name: 'ListEdit',
    component: ListEdit
  },
  {
    path: '/dir/:id',
    name: 'Directory',
    component: Directory
  },
  {
    path: '/players/:id',
    name: 'Player',
    component: Player
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
