import axios from 'axios'
import ELEMENT from 'element-ui'
// import Vue from 'vue'

var $ajax = axios.create({
  baseURL: `/api`
})

var NOOP = () => {}
var http = (opts) => {
  opts.done = opts.done || NOOP
  opts.fail = opts.fail || NOOP
  opts.always = opts.always || NOOP
  $ajax(opts).then(({data}) => {
    if (data.status === 200 || data.status === 403) {
      opts.done(data)
    } else {
      ELEMENT.Message.error(data.message)
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
    Vue.ajax = http
    Vue.prototype.$ajax = http
  }
}
