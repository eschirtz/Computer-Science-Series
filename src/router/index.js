import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Ep01 from '@/components/ep01/ep01';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/ep01',
      name: 'Simulated Annealing',
      component: Ep01,
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
  ],
});
