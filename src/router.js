import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home'
import WriteupViewer from '@/views/writeup-viewer/writeups'
import Ep01 from '@/views/ep01/demo'
import Ep03 from '@/views/ep03/demo'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/demos/ep01',
      name: 'Simulated Annealing',
      component: Ep01
    },
    {
      path: '/demos/ep03',
      name: 'K-Means Clustering',
      component: Ep03
    },
    {
      path: '/writeups/:episode',
      name: 'Write-Up',
      component: WriteupViewer
    },
    {
      path: '/',
      name: 'Home',
      component: Home
    }
  ]
})
