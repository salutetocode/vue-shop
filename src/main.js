// 入口文件
import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'
// 导入字体图标
import './assets/fonts/iconfont.css'
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
// 配置请求拦截器
axios.interceptors.request.use((config) => {
  // 为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 挂载
Vue.prototype.$http = axios
Vue.config.productionTip = false
// 全局注册
Vue.component('tree-table', TreeTable)
new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
