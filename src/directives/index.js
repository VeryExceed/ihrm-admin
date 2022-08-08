
export const imagerror = {
  // 指令对象 会在当前的dom元素插入到节点之火执行
  inserted(dom, options) {
    // options是 指令中的变量的解释 其中有一个属性叫做 value
    // dom 表示当前指令作用的dom对象
    // dom认为此时就是图片
    dom.src = dom.src || options.value
    // 当图片有地址，但是地址没有加载成功的时候 报错 出发图片事件 => onerror
    dom.onerror = function() {
      // 当图片出现异常时 将指令配置的默认图片设置为该图片的内容
      dom.src = options.value // 不能写死
    }
  },
  componentUpdated(dom, options) {
    dom.src = dom.src || options.value
  }
}
