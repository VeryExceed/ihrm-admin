<template>
  <div class="dashboard-container">
    <div class="app-container">
      <add-employee :show-dialog.sync="showDialog" />
      <page-tools :show-before="true">
        <span slot="before">共{{ page.total }}条记录</span>
        <template slot="after">
          <el-button
            :disabled="!checkPermission('POINT-USER-UPDATE')"
            size="small"
            type="warning"
            @click="$router.push('/import?type=user')"
          >导入</el-button>
          <el-button
            size="small"
            type="info"
            @click="exportMutiData"
          >复杂表头excel导出</el-button>
          <el-button
            size="small"
            type="danger"
            @click="exportData"
          >普通excel导出</el-button>
          <el-button
            size="small"
            type="primary"
            @click="showDialog = true"
          >新增员工</el-button>
        </template>
      </page-tools>
      <!-- 表格和分页 -->
      <el-card v-loading="loading">
        <el-table border :data="list">
          <el-table-column label="序号" align="center" sortable type="index" />
          <el-table-column
            label="姓名"
            align="center"
            sortable
            prop="username"
          />
          <el-table-column label="头像" align="center">
            <template slot-scope="{ row }">
              <img
                slot="reference"
                v-imagerror="require('@/assets/common/bigUserHeader.png')"
                :src="row.staffPhoto"
                style="
                  border-radius: 50%;
                  width: 100px;
                  height: 100px;
                  padding: 10px;
                "
                alt=""
                @click="showQrCode(row.staffPhoto)"
              >
            </template>
          </el-table-column>
          <el-table-column
            label="工号"
            align="center"
            sortable
            prop="workNumber"
          />
          <el-table-column
            label="聘用形式"
            align="center"
            sortable
            prop="formOfEmployment"
            :formatter="formatEmployment"
          />
          <el-table-column
            label="部门"
            align="center"
            sortable
            prop="departmentName"
          />
          <el-table-column
            label="入职时间"
            align="center"
            sortable
            prop="timeOfEntry"
          >
            <template slot-scope="{ row }">
              {{ row.timeOfEntry | formatDate }}
            </template>
          </el-table-column>
          <el-table-column
            label="账户状态"
            align="center"
            sortable
            prop="enableState"
          >
            <template slot-scope="{ row }">
              <!-- 根据当前状态 是否打开 -->
              <el-switch :value="row.enableState === 1" />
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            sortable
            fixed="right"
            width="280"
          >
            <template slot-scope="{ row }">
              <el-button
                type="text"
                size="small"
                @click="$router.push(`/employees/detail/${row.id}`)"
              >查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button
                type="text"
                size="small"
                @click="assignRole(row.id)"
              >角色</el-button>
              <el-button
                type="text"
                size="small"
                @click="deleteEmployee(row.id)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-row
          type="flex"
          justify="center"
          align="middle"
          style="height: 60px"
        >
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
    <el-dialog title="图片二维码" :visible.sync="showCodeDialog">
      <!-- 放置canvas -->
      <el-row type="flex" justify="center">
        <canvas ref="myCanvas" />
      </el-row>
    </el-dialog>
    <!-- 角色分配组件 -->
    <assign-role
      ref="assignRole"
      :show-role-dialog.sync="showRoleDialog"
      :user-id="userId"
    />
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees'
import AddEmployee from './components/add-employee.vue'
import AssignRole from './components/assign-role.vue'
import { formatDate } from '@/filters'
import QrCode from 'qrcode'
import mixin from '@/mixin/checkPermission'
export default {
  components: { AddEmployee, AssignRole },
  mixins: [mixin],
  data() {
    return {
      loading: false,
      list: [],
      page: {
        page: 1, // 当前页码
        size: 10,
        total: 0 // 总数量
      },
      showDialog: false,
      showCodeDialog: false, // 显示二维码的弹层
      showRoleDialog: false, // 显示role角色的弹层
      userId: null // 记录当前点击的id
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
      const obj = EmployeeEnum.hireType.find((item) => item.id === cellValue)
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
    },
    exportData() {
      // 懒加载模块 => 只有当点击按钮的时候才去加载这个模块
      const headers = {
        姓名: 'username',
        手机号: 'mobile',
        入职日期: 'timeOfEntry',
        聘用形式: 'formOfEmployment',
        转正日期: 'correctionTime',
        工号: 'workNumber',
        部门: 'departmentName'
      }
      import('@/vendor/Export2Excel').then(async(excel) => {
        // 获取所有的员工列表数据
        const { rows } = await getEmployeeList({
          page: 1,
          size: this.page.total
        })
        // rows是所有的员工列表数据
        // [{ username: '张三', mobile: 123 }]  => [[ '张三', 123 ]]

        // excel导出的默认对象
        excel.export_json_to_excel({
          filename: '人力资源表',
          header: Object.keys(headers),
          data: this.formatJSON(headers, rows)
        })
      })
    },
    // 格式化json数据
    formatJSON(headers, rows) {
      // rows 是一行一行的  =>  [{},{}] => [[],[]]
      return rows.map((item) => {
        // item {username: '张三', mobile: 123}  现在是对象 => []
        // ["姓名","手机号"] => [ '张三', '123']
        return Object.keys(headers).map((key) => {
          // key是中文 headers[key]是英文 // item是 英文 {username: '张三', mobile: 123}
          if (
            headers[key] === 'timeOfEntry' ||
            headers[key] === 'correctionTime'
          ) {
            // 如果是日期的话 就需要格式化日期
            return formatDate(item[headers[key]])
          } else if (headers[key] === 'formOfEmployment') {
            // 要把聘用形式转化成文本
            const obj = EmployeeEnum.hireType.find(
              (o) => o.id === item[headers[key]]
            )
            return obj ? obj.value : '未知'
          }
          return item[headers[key]]
        })
      })
    },
    exportMutiData() {
      // 懒加载模块 =>
      const headers = {
        姓名: 'username',
        手机号: 'mobile',
        入职日期: 'timeOfEntry',
        聘用形式: 'formOfEmployment',
        转正日期: 'correctionTime',
        工号: 'workNumber',
        部门: 'departmentName'
      }
      import('@/vendor/Export2Excel').then(async(excel) => {
        // 获取所有的员工列表数据
        const { rows } = await getEmployeeList({
          page: 1,
          size: this.page.total
        })
        excel.export_json_to_excel({
          filename: '人力资源表',
          header: Object.keys(headers),
          multiHeader: [['姓名', '主要信息', '', '', '', '', '部门']], // 复杂表头的导出 数组中的一个数组 就是一行表头
          data: this.formatJSON(headers, rows),
          merges: ['A1:A2', 'B1:F1', 'G1:G2'] // 合并列  不用区分顺序 只写合并的单元格的顺序号
        })
      })
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
    },
    async assignRole(id) {
      this.userId = id // props传值是异步的
      await this.$refs.assignRole.getUserDetailById(id)
      this.showRoleDialog = true
    }
  }
}
</script>

<style></style>
