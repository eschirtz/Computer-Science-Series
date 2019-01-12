import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Ep01 from '@/components/ep01/ep01';
import Ep03 from '@/components/ep03/ep03';


Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/ep01',
      name: 'Simulated Annealing',
      component: Ep01,
    },
    {
      path: '/ep03',
      name: 'K-Means Clustering',
      component: Ep03,
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
  ],
});
