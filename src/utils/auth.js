import Cookies from 'js-cookie'

const TokenKey = 'hrsaas-ihrm-token' // 设定一个独一无二的key

const timeKey = 'hr-sass-time-key'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function setTimeStamp() {
  // 设置当前时间戳
  Cookies.set(timeKey, Date.now())
}

export function getTimeStamp() {
  return Cookies.get(timeKey)
}
