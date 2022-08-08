import { getToken, setToken, removeToken, setTimeStamp } from '@/utils/auth'
import { login, getUserInfo, getUserDetailById } from '@/api/user'
import { resetRouter } from '@/router'

// 状态
const state = {
  token: getToken(), // 设置token初始状态 token持久化 => 放到缓存中
  userInfo: {}
}
// 修改状态
const mutations = {
  // 设置token
  setToken(state, token) {
    state.token = token // 设置token 只是修改state的数据
    // vuex变化 => 缓存数据
    setToken(token) // vuex和 缓存数据的同步
  },
  // 删除数据
  removeToken(state) {
    state.token = null // 删除vuex的token
    removeToken() // 先清除 vuex 再清除缓存 vuex和 缓存数据的同步
  },
  // 设置用户信息
  setUserInfo(state, userInfo) {
    state.userInfo = { ...userInfo } // 用浅拷贝的方式赋值对象 因为这样数据更新之后，才会触发组件的更新
  },
  // 删除用户信息
  removeUserInfo(state) {
    state.userInfo = {}
  }
}
// 执行异步
const actions = {
  // 定义login aciton 调用action 传递过来的参数
  async login(context, data) {
    const result = await login(data) // 实际上就是一个promise result就是执行的结果
    // axios默认给数据添加一层data
    // 表示登录接口调用成功 也就是以为着你的用户名和密码是正确的
    // 现在有用户token
    // actions 修改state 必须通过mutations
    context.commit('setToken', result) // 提交mutations设置token
    // 写入时间戳
    setTimeStamp() // 当前时间戳存入缓存
  },
  // 获取用户资料action
  async getUserInfo(context) {
    const result = await getUserInfo() // result就是用户的的基本资料
    const baseInfo = await getUserDetailById(result.userId) // 为了获取头像
    context.commit('setUserInfo', { ...result, ...baseInfo }) // 将整个的个人信息设置到用户的vuex数据中
    return result
  },
  // 登出的action
  logout(context) {
    // 删除token
    context.commit('removeToken') // 删除vuex中的 删除缓存的token
    // 删除用户资料
    context.commit('removeUserInfo') // 删除用户信息
    // 重置路由
    resetRouter()
    // vuex的数据还在
    // 要清空permission模块下的state数据
    // 子模块调用子模块的action  默认情况下 子模块的context是子模块的
    // 父模块 调用 子模块的action
    // 子模块调用子模块的action 可以 将 commit的第三个参数 设置成  { root: true } 就表示当前的context不是子模块了 而是父模块
    context.commit('permission/setRoutes', [], { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
