import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    token: '',
    xParams: ''
  },
  mutations: {
    updateToken (state, payload) {
      state.token = payload
    },
    updateXparams (state, payload) {
      state.xParams = payload
    }
  },
  actions: {
    //
  }
})
