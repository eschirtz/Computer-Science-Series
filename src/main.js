import Vue from 'vue';
import App from './App';
import router from './router';

import './styles/normalize.css';
import './styles/skeleton.css';
import './styles/master.css';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
});
