import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'
// 路由懒加载 const Foo = () => import(/* webpackChunkName: "group-foo" */ './Foo.vue')
const Login = () =>
  import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () =>
  import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () =>
  import(
    /* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue'
  )
// import Users from '../components/user/Users.vue'
const Users = () =>
  import(
    /* webpackChunkName: "users_rights_roles" */ '../components/user/Users.vue'
  )
// import Rights from '../components/power/Rights.vue'
const Rights = () =>
  import(
    /* webpackChunkName: "users_rights_roles" */ '../components/power/Rights.vue'
  )
// import Roles from '../components/power/Roles.vue'
const Roles = () =>
  import(
    /* webpackChunkName: "users_rights_roles" */ '../components/power/Roles.vue'
  )
// import Cate from '../components/goods/Cate.vue'
const Cate = () =>
  import(/* webpackChunkName: "cate_params" */ '../components/goods/Cate.vue')
// import Params from '../components/goods/Params.vue'
const Params = () =>
  import(/* webpackChunkName: "cate_params" */ '../components/goods/Params.vue')
// import List from '../components/goods/List.vue'
const List = () =>
  import(/* webpackChunkName: "list_addgoods" */ '../components/goods/List.vue')
// import AddGoods from '../components/goods/AddGoods.vue'
const AddGoods = () =>
  import(
    /* webpackChunkName: "list_addgoods" */ '../components/goods/AddGoods.vue'
  )
// import Order from '../components/order/Order.vue'
const Order = () =>
  import(/* webpackChunkName: "order_report" */ '../components/order/Order.vue')
// import Report from '../components/report/Report.vue'
const Report = () =>
  import(
    /* webpackChunkName: "order_report" */ '../components/report/Report.vue'
  )

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: AddGoods },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // 如果用户访问的是登录页，直接放行，登录页没有权限限制
  if (to.path === '/login') return next()
  // 如果访问的不是登录页，是有权限限制的页面
  // 从sessionStorage中获取到保存的token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token，强制跳转到登录页
  if (!tokenStr) return next('/login')
  // tokon存在 放行
  next()
})
export default router
