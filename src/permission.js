// 权限拦截 导航守卫 路由守卫 router
import router from '@/router' // 引入路由实例
import store from '@/store' // 引入vuex store实例
import NProgress from 'nprogress' // 引入一份进度条插件
import 'nprogress/nprogress.css' // 引入进度条样式

const whiteList = ['/login', '/404'] // 定义白名单 不受权限控制的页面
// 路由前置守卫
router.beforeEach(async(to, from, next) => {
  NProgress.start()
  // 首先判断有无token
  if (store.getters.token) {
    // 如果有token 继续判断是不是去登录页
    if (to.path === '/login') {
      next('/') // 跳到主页
    } else {
      // 要判断是不是已经获取过资料
      if (!store.getters.userId) {
        // 如果id 不存在 意味着当前没有用户资料 就要去获取用户资料
        // vuex的action 是一个promise
        // 写await 获取完资料再放行
        const { roles } = await store.dispatch('user/getUserInfo')
        // 如果说后续 需要根据用户资料获取数据的话 这里必须改成同步

        // actions中函数 默认是Promise对象 调用这个对象 想要获取返回的值话 必须 加 await或者是then
        const routes = await store.dispatch('permission/filterRoutes', roles.menus)
        // routes就是帅选得到的动态路由
        // 动态路由 添加到 路由表中 默认的路由表 只有静态路由 没有动态路由
        // addRoutes  必须 用 next(地址) 不能用next()
        router.addRoutes([...routes, { path: '*', redirect: '/404', hidden: true }]) // 添加到动态路由表
        next(to.path)
      } else {
        next() // 放行
      }
    }
  } else {
    // 如果没有token
    if (whiteList.indexOf(to.path) > -1) {
      // 如果找到了, 表示在白名单里
      next()
    } else {
      next('/login') // 没有token 跳到登录页
    }
  }
  NProgress.done() // 手动强制关闭一次  为了解决 手动切换地址时  进度条的不关闭的问题
})

// 后置守卫
router.afterEach(() => {
  NProgress.done() // 关闭进度条
})
