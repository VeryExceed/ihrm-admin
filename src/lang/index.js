import Vue from 'vue' // 引入Vue
import VueI18n from 'vue-i18n'
import Cookie from 'js-cookie'
import elementEN from 'element-ui/lib/locale/lang/en' // 引入饿了么英文包
import elementZH from 'element-ui/lib/locale/lang/zh-CN' // 引入饿了么的中文包
import customZH from './zh' // 引入自定义中文包
import customEN from './en' // 引入自定义英文包
Vue.use(VueI18n) // 全局注册国际化包
export default new VueI18n({
  locale: Cookie.get('language') || 'zh', // 从cookie 获取语言类型，获取不到就是中文
  messages: {
    en: {
      ...elementEN,
      ...customEN
    },
    zh: {
      ...elementZH,
      ...customZH
    }
  }
})
