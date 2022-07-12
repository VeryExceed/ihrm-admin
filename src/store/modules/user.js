import { getToken, setToken, removeToken } from '@/utils/auth'
import { login } from '@/api/user'

// 状态
const state = {
  token: getToken() // 设置token初始状态 token持久化 => 放到缓存中
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
