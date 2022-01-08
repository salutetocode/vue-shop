// 入口文件
import Vue from 'vue'
import App from './App.vue'
// 导入全局样式表
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'
// 导入字体图标
import './assets/fonts/iconfont.css'
import axios from 'axios'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入nprogress对应的js和css
import NProgress from 'nprogress'
import router from './router/index.js'
// 配置请求的根路径
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
// 配置请求拦截器
// 在request拦截器中展示进度条，使用NProgress.start();因为request拦截器说明发起了网络请求
axios.interceptors.request.use((config) => {
  NProgress.start()
  // 为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须return config
  return config
})
// 在response拦截器中隐藏进度条，使用NProgress.done();
axios.interceptors.response.use((config) => {
  NProgress.done()
  return config
})
// 挂载
Vue.prototype.$http = axios
Vue.config.productionTip = false
// 全局注册
Vue.component('tree-table', TreeTable)
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)
// 全局注册格式化时间的过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  // dt.getMonth() + 1+''是转化成字符串,.padStart(2,'0')是不足两位就用0补
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
