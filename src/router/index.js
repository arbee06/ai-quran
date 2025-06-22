import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home/index.vue'
import SurahView from '../views/surah/index.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/surah/:id',
    name: 'Surah',
    component: SurahView,
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router