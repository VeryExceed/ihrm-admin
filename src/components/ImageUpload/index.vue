<template>
  <div>
    <el-upload
      list-type="picture-card"
      :limit="1"
      action="#"
      :on-preview="preview"
      :on-remove="handleRemove"
      :on-change="changeFile"
      :before-upload="beforeUpload"
      :http-request="upload"
      :file-list="fileList"
      :class="{ disabled: fileComputed }"
    >
      <i slot="default" class="el-icon-plus" />
      <template slot="file" slot-scope="{file}">
        <img
          class="el-upload-list__item-thumbnail"
          :src="file.url"
          alt=""
        >
        <span class="el-upload-list__item-actions">
          <span
            class="el-upload-list__item-preview"
            @click="preview(file)"
          >
            <i class="el-icon-zoom-in" />
          </span>
          <span
            v-if="!disabled"
            class="el-upload-list__item-delete"
            @click="showQrCode(file.url)"
          >
            <i class="el-icon-document" />
          </span>
          <span
            v-if="!disabled"
            class="el-upload-list__item-delete"
            @click="handleRemove(file)"
          >
            <i class="el-icon-delete" />
          </span>
        </span>
      </template>
    </el-upload>
    <el-progress v-if="showPercent" style="width: 180px" :percentage="percent" />
    <el-dialog title="图片" :visible.sync="showDialog">
      <img :src="imgUrl" style="width: 100%" alt="">
    </el-dialog>
    <el-dialog title="图片二维码" :visible.sync="showCodeDialog">
      <!-- 放置canvas -->
      <el-row type="flex" justify="center">
        <canvas ref="myCanvas" />
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import QrCode from 'qrcode'
import COS from 'cos-js-sdk-v5'
const cos = new COS({
  SecretId: 'AKID0qUxCDzWoqcAT9akfMoztYw60gkbCZq3', // 身份识别 ID
  SecretKey: 'DHE0Zv2uXyFQREk00jCPL1QZR3OTK9i0' // 身份密钥
})
export default {
  data() {
    return {
      fileList: [], // 图片地址设置为数组
      showDialog: false,
      showCodeDialog: false, // 显示二维码的弹层
      imgUrl: '',
      percent: 0,
      showPercent: false,
      disabled: false
    }
  },
  computed: {
    // 设定一个计算属性 判断是否已经上传完了一张
    fileComputed() {
      return this.fileList.length === 1
    }
  },
  mounted() {},

  methods: {
    preview(file) {
      this.imgUrl = file.url
      this.showDialog = true
    },
    handleRemove(file, fileList) {
      // file 是点击删除的文件
      // 将原来的文件排除掉，剩下的就是最新的数组
      this.fileList = this.fileList.filter((item) => item.uid !== file.uid)
    },
    // 修改文件时触发
    // 上传成功和上传失败都会触发
    changeFile(file, fileList) {
      this.fileList = fileList.map((item) => item)
    },
    // 上传之前的检查
    beforeUpload(file) {
      // 检查文件类型 文件大小
      const types = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png']
      // 如果不符合文件类型
      if (!types.includes(file.type)) {
        this.$message.error('上传图片只能是 JPG、GIF、BMP、PNG 格式!')
        return false
      }
      // 检查文件大小
      const maxSize = 5 * 1024 * 1024
      // 如果文件大于 5MB
      if (maxSize < file.size) {
        this.$message.error('图片大小最大不能超过5M')
        return false
      }
      return true
    },
    // 自定义上传动作 有个参数 有个file对象，是我们需要上传到腾讯云服务器的内容
    upload(params) {
      console.log(params.file)
      if (params.file) {
        this.showPercent = true // 显示进度条
        // 执行上传操作 腾讯云cos
        cos.putObject({
          Bucket: 'biantiandou-1313116208', // 存储桶
          Region: 'ap-guangzhou', // 地域
          Key: params.file.name, // 文件名
          Body: params.file, // 上传的文件对象
          StorageClass: 'STANDARD',
          // 进度条
          onProgress: (progressData) => {
            this.percent = progressData.percent * 100
          }
        }, (err, data) => {
          // data返回数据之后 应该如何处理
          console.log(err)
          if (data.statusCode === 200 && data.Location) {
            // 此时上传成功
            // 需要知道当前的这个地址是谁的url地址
            // params.file.uid => 当前上传文件的标识 果找到了一一样的uid 就表示他们同一张图片
            console.log(this.fileList)
            // 这样相当于将原来的旧地址换成新地址
            this.fileList = this.fileList.map(item => {
              // 将本地的地址替换成线上已经放在腾讯云之后的地址
              if (item.uid === params.file.uid) {
                return { url: 'http://' + data.Location, upload: true }
              }
              return item
            })
            this.showPercent = false // 关闭进度条
            this.percent = 0 // 将进度条归0
          }
        })
      }
    },
    showQrCode(url) {
      // url 存在的情况下
      if (url && url.trim()) {
        // 数据更新了 页面的渲染是异步的
        this.showCodeDialog = true
        this.$nextTick(() => {
          // 可以确认有ref对象啦
          QrCode.toCanvas(this.$refs.myCanvas, url) // 将地址转化为二维码
        })
      } else {
        this.$message.warning('该用户还未上传头像')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 在scoped 中需要用到样式穿透
::v-deep .disabled .el-upload--picture-card {
  display: none;
}
</style>
