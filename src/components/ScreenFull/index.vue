<template>
  <div>
    <svg-icon
      icon-class="fullscreen"
      style="color:#fff;width:20px; height:20px"
      @click="changeScreen"
    />
  </div>
</template>

<script>
import ScreenFull from 'screenfull'
export default {
  methods: {
    // 改变全屏
    changeScreen() {
      if (!ScreenFull.isEnabled) {
        this.$message.warning('此时全屏组件不可用')
        return
      }
      // document.documentElement.requestFullscreen() 原生全屏方法
      ScreenFull.toggle()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
