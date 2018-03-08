// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import moment from 'moment'
import echarts from 'echarts'
import Vuebar from 'vuebar'
import 'es6-promise-always'
import $ajax from './ajax'
import store from './store'

Vue.use(Element)
Vue.use($ajax)
Vue.use(Vuebar)
Vue.prototype.moment = moment
Vue.prototype.$echarts = echarts

Vue.config.productionTip = false

store.commit('updateToken', localStorage.getItem('token'))
store.commit('updateXparams', localStorage.getItem('xParams'))

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
