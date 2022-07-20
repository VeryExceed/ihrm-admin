<template>
  <div class="dashboard-container">
    <div class="app-container">
      <add-employee :show-dialog.sync="showDialog" />
      <page-tools :show-before="true">
        <span slot="before">共166条记录</span>
        <template slot="after">
          <el-button size="small" type="warning">导入</el-button>
          <el-button size="small" type="danger">导出</el-button>
          <el-button size="small" type="primary" @click="showDialog = true">新增员工</el-button>
        </template>
      </page-tools>
      <!-- 表格和分页 -->
      <el-card v-loading="loading">
        <el-table border :data="list">
          <el-table-column label="序号" align="center" sortable type="index" />
          <el-table-column label="姓名" align="center" sortable prop="username" />
          <el-table-column label="工号" align="center" sortable prop="workNumber" />
          <el-table-column label="聘用形式" align="center" sortable prop="formOfEmployment" :formatter="formatEmployment" />
          <el-table-column label="部门" align="center" sortable prop="departmentName" />
          <el-table-column label="入职时间" align="center" sortable prop="timeOfEntry">
            <template slot-scope="{ row }">
              {{ row.timeOfEntry | formatDate }}
            </template>
          </el-table-column>
          <el-table-column label="账户状态" align="center" sortable prop="enableState">
            <template slot-scope="{ row }">
              <!-- 根据当前状态 是否打开 -->
              <el-switch :value="row.enableState === 1" />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" sortable fixed="right" width="280">
            <template slot-scope="{ row }">
              <el-button type="text" size="small">查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small">角色</el-button>
              <el-button type="text" size="small" @click="deleteEmployee(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-row type="flex" justify="center" align="middle" style="height:60px">
          <el-pagination
            layout="prev, pager, next"
            :page-size="page.size"
            :current-page="page.page"
            :total="page.total"
            @current-change="changePage"
          />
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees'
import AddEmployee from './components/add-employee.vue'
export default {
  components: { AddEmployee },
  data() {
    return {
      loading: false,
      list: [],
      page: {
        page: 1, // 当前页码
        size: 10,
        total: 0 // 总数量
      },
      showDialog: false
    }
  },
  created() {
    this.getEmployeeList()
  },
  methods: {
    changePage(newPage) {
      this.page.page = newPage
      this.getEmployeeList()
    },
    async getEmployeeList() {
      this.loading = true
      const { total, rows } = await getEmployeeList(this.page)
      this.page.total = total
      this.list = rows
      this.loading = false
    },
    formatEmployment(row, column, cellValue, index) {
    // 要去找 1所对应的值
      const obj = EmployeeEnum.hireType.find(item => item.id === cellValue)
      return obj ? obj.value : '未知'
    },
    // 删除员工
    async deleteEmployee(id) {
      try {
        await this.$confirm('您确定删除该员工吗')
        await delEmployee(id)
        this.getEmployeeList()
        this.$message('删除员工成功')
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>

<style></style>
