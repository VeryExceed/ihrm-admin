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
        await store.dispatch('user/getUserInfo')
      }
      next() // 放行
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
  NProgress.done()
})
