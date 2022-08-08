<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card class="tree-card">
        <!-- 行列布局 -->
        <tree-tools
          :tree-node="company"
          :is-root="true"
          @addDepts="addDepts"
        />
        <el-tree
          :data="departs"
          :props="defaultProps"
          :default-expand-all="true"
          @node-click="handleNodeClick"
        >
          <template v-slot="{ data }">
            <tree-tools
              :tree-node="data"
              @delDepts="getDepartments"
              @addDepts="addDepts"
              @editDepts="editDepts"
            />
          </template>
        </el-tree>
      </el-card>
    </div>
    <add-dept ref="addDept" :show-dialog.sync="showDialog" :tree-node="node" @addDepts="getDepartments" />
  </div>
</template>

<script>
import TreeTools from './components/tree-tools.vue'
import AddDept from './components/add-dept.vue'
import { getDepartments } from '@/api/departments'
import { transListToTreeData } from '@/utils'
export default {
  components: {
    TreeTools,
    AddDept
  },
  data() {
    return {
      showDialog: false, // 显示窗体
      company: {},
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      departs: [
        {
          name: '总裁办',
          manager: '曹操',
          children: [{ name: '董事会', manager: '曹丕' }]
        },
        { name: '行政部', manager: '刘备' },
        { name: '人事部', manager: '孙权' }
      ],
      node: null
    }
  },
  created() {
    this.getDepartments()
  },
  methods: {
    handleNodeClick(data) {
      console.log(data)
    },
    async getDepartments() {
      const result = await getDepartments()
      console.log(result)
      this.company = { name: result.companyName, manager: '负责人', id: '' }
      this.departs = transListToTreeData(result.depts, '') // 需要将其转化成树形结构
    },

    addDepts(node) {
      this.showDialog = true // 显示弹窗
      // 因为node是当前点击的部门, 这个部门记录下来
      this.node = node
    },
    async editDepts(node) {
      // 首先打开弹层
      await this.$refs.addDept.getDepartDetail(node.id)
      this.showDialog = true
      this.node = node // 赋值操作的节点
    }
  }
}
</script>

<style scope>
.tree-card {
  padding: 30px 140px;
  font-size: 14px;
}
</style>
