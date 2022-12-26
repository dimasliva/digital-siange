import { createRouter, createWebHistory } from 'vue-router'
import Players from '@/views/Players.vue'
import Devices from '@/views/Devices.vue'
import Stuff from '@/views/Stuff.vue'
import ListEdit from '@/views/ListEdit.vue'
import Directory from '@/views/Directory.vue'
import Player from '@/views/Player.vue'
import Headline from '@/views/Headline.vue'
import Login from '@/views/Login.vue'
import Playlists from '@/views/Playlists.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/players',
    name: 'Players',
    component: Players
  },
  {
    path: '/device',
    name: 'Devices',
    component: Devices
  },
  {
    path: '/playlists',
    name: 'Playlists',
    component: Playlists
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
