<template>
  <el-dialog title="分配角色" :visible="showRoleDialog" @close="btnCancel">
    <!-- el-checkbox-group选中的是 当前用户所拥有的角色  需要绑定 当前用户拥有的角色-->
    <el-checkbox-group v-model="roleIds">
      <el-checkbox v-for="item in list" :key="item.id" :label="item.id">
        {{ item.name }}
      </el-checkbox>
    </el-checkbox-group>
    <template #footer>
      <el-row type="flex" justify="center">
        <el-col :span="6">
          <el-button type="primary" size="small" @click="btnOK">确定</el-button>
          <el-button size="small" @click="btnCancel">取消</el-button>
        </el-col>
      </el-row>
    </template>
  </el-dialog>
</template>

<script>
import { getRoleList } from '@/api/setting'
import { getUserDetailById } from '@/api/user'
import { assignRoles } from '@/api/employees'
export default {
  props: {
    showRoleDialog: {
      type: Boolean,
      default: false
    },
    // 用户id 用来查询当前用户的角色信息
    userId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      list: [], // 角色列表
      roleIds: []
    }
  },

  created() {
    this.getRoleList()
  },
  methods: {
    // 获取所有角色
    async getRoleList() {
      const { rows } = await getRoleList()
      this.list = rows
    },
    // 父组件调用的函数
    async getUserDetailById(id) {
      const { roleIds } = await getUserDetailById(id)
      this.roleIds = roleIds // 赋值本用户的角色
    },
    // 确定保存
    async btnOK() {
      await assignRoles({ id: this.userId, roleIds: this.roleIds })
      // 关闭弹窗
      this.$emit('update:showRoleDialog', false)
    },
    // 取消或者关闭
    btnCancel() {
      this.roleIds = [] // 情况原来的数组
      this.$emit('update:showRoleDialog', false)
    }
  }
}
</script>

<style lang="scss" scoped></style>
