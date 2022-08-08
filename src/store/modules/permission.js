import { asyncRoutes, constantRoutes } from '@/router'
// vuex中的permission模块用来存放当前 静态路由 + 当前用户的权限路由
const state = {
  routes: constantRoutes // 所有人默认拥有静态路由
}
const mutations = {
  setRoutes(state, newRoutes) {
    state.routes = [...constantRoutes, ...newRoutes]
  }
}
const actions = {
  // 筛选权限路由
  filterRoutes(context, menus) {
    const routes = []
    menus.forEach(key => {
      routes.push(...asyncRoutes.filter(item => item.name === key)) // 得到一个数组
    })

    // routes就是当前用户拥有的 动态路由权限
    context.commit('setRoutes', routes)
    return routes
    // state数据 是用来 显示左侧菜单用的  return是给路由addRoutes用的
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
