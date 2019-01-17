import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import WriteupViewer from '@/components/writeup-viewer/writeups';
import Ep01 from '@/components/ep01/demo';
import Ep03 from '@/components/ep03/demo';


Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/demos/ep01',
      name: 'Simulated Annealing',
      component: Ep01,
    },
    {
      path: '/demos/ep03',
      name: 'K-Means Clustering',
      component: Ep03,
    },
    {
      path: '/writeups/:episode',
      name: 'Write-Up',
      component: WriteupViewer,
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
  ],
});
