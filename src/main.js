import Vue from 'vue';
import App from './App';
import router from './router';
import CircleButton from './components/shared/circle-button';
import Modal from './components/shared/modal';

import './styles/normalize.css';
import './styles/skeleton.css';
import './styles/master.css';

Vue.config.productionTip = false;
Vue.component('circle-button', CircleButton);
Vue.component('modal', Modal);
/* eslint-disable no-new */
router.beforeEach((to, from, next) => {
  document.title = to.name;
  next();
});
/* Create the main Vue instance */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
});
