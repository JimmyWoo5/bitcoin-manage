import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    }, {
      path: '/login',
      name: 'login',
      component: resolve => require(['@/views/login/login'], resolve),
      meta: {
        requiresAuth: true
      }
    }, {
      path: '/home',
      component: resolve => require(['@/views/home/home'], resolve),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'buy',
          component: resolve => require(['@/views/home/buy'], resolve),
          meta: {
            requiresAuth: true
          }
        }, {
          path: '/history',
          name: 'history',
          component: resolve => require(['@/views/home/history'], resolve),
          meta: {
            requiresAuth: true
          }
        }, {
          path: '/chart',
          name: 'chart',
          component: resolve => require(['@/views/home/chart'], resolve),
          meta: {
            requiresAuth: true
          }
        }, {
          path: '/auto',
          name: 'auto',
          component: resolve => require(['@/views/home/auto-fill'], resolve),
          meta: {
            requiresAuth: true
          }
        }
      ]
    }
  ]
})
