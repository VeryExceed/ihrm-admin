<template>
  <el-row
    type="flex"
    justify="space-between"
    align="middle"
    style="width: 100%; height: 40px"
  >
    <el-col>
      <span>{{ treeNode.name }}</span>
    </el-col>
    <el-col :span="4">
      <el-row type="flex" justify="end">
        <el-col>{{ treeNode.manager }}</el-col>
        <el-col>
          <!-- 下拉菜单 -->
          <el-dropdown @command="operateDepts">
            <!-- 下拉菜单内容 -->
            <span> 操作<i class="el-icon-arrow-down" /> </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="add">添加子部门</el-dropdown-item>
              <el-dropdown-item v-if="!isRoot" command="edit">编辑部门</el-dropdown-item>
              <el-dropdown-item v-if="!isRoot" command="del">删除部门</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { delDepartments } from '@/api/departments'
// 该组件需要对外开放属性 外部需要提供一个对象 对象里需要有name manager
export default {
  name: 'TreeTools',
  props: {
    // 传入的数据
    treeNode: {
      type: Object,
      required: true
    },
    isRoot: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },

  mounted() {},

  methods: {
    operateDepts(type) {
      if (type === 'add') {
        // 添加子部门的操作
        // 告诉父组件 显示弹窗
        // 传treeNode 因为是添加子部门 需要当前部门数据
        this.$emit('addDepts', this.treeNode)
      } else if (type === 'edit') {
        // 编辑部门的操作
        this.$emit('editDepts', this.treeNode)
      } else {
        // 删除操作
        this.$confirm('确定要删除该部门吗？').then(() => {
          // 点击确认了就进入then
          return delDepartments(this.treeNode.id) // 返回promise对象
        }).then(() => {
          // 删除成功
          this.$emit('delDepts') // 触发自定义事件
          this.$message.success('删除部门成功')
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
