import axios from 'axios'
import ELEMENT from 'element-ui'
import store from '@/store'
import router from '@/router'

axios.defaults.baseURL = '/api'

axios.interceptors.request.use(config => {
  config.headers['token'] = store.state.token
  if (store.state.xParams) config.headers['x-params'] = store.state.xParams
  return config
}, error => {
  return Promise.reject(error)
})

var NOOP = () => {}
var $ajax = (opts) => {
  opts.done = opts.done || NOOP
  opts.fail = opts.fail || NOOP
  opts.always = opts.always || NOOP
  axios(opts).then(({data}) => {
    if (data.status === 200 || data.status === 403) {
      opts.done(data)
    } else if (data.status === 10001) {
      ELEMENT.Message.error('登录过期')
      router.push('/login')
    } else if (data.status !== 10002) {
      ELEMENT.Message.error(data.message)
      opts.fail(data)
    } else {
      opts.fail(data)
    }
  }).catch(({response}) => {
    ELEMENT.Message.error(response.statusText)
    opts.fail()
  }).always(() => {
    opts.always()
  })
}

export default {
  name: 'ajax',
  install (Vue) {
    Vue.prototype.$ajax = $ajax
  }
}
