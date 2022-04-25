import {createRouter, createWebHashHistory} from "vue-router";
import Home from "../pages/Home.vue";
import Room from "../pages/Room.vue";

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: Home
  },
  {
    path: '/room',
    component: Room
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
