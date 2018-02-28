import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'buy',
      component: resolve => require(['@/views/buy'], resolve),
      meta: {
        requiresAuth: true
      }
    }, {
      path: '/history',
      name: 'history',
      component: resolve => require(['@/views/history'], resolve),
      meta: {
        requiresAuth: true
      }
    }
  ]
})
