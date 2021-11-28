import Vue from 'vue'
// 按需导入
import { Button, Form, FormItem, Input, Message } from 'element-ui'
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// Message弹框提示组件需要全局挂载
// 全局挂载以后this就可以直接访问到了
Vue.prototype.$message = Message
