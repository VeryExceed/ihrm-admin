<template>
  <!-- 新增部门的数据 -->
  <el-dialog :title="showTitle" :visible="showDialog" @close="btnCancel">
    <!-- 表单组件 el-form -->
    <el-form
      ref="deptForm"
      label-width="120px"
      :model="formData"
      :rules="rules"
    >
      <el-form-item label="部门名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="1-50个字符"
          style="width: 80%"
        />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="1-50个字符"
          style="width: 80%"
        />
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <el-select
          v-model="formData.manager"
          placeholder="请选择"
          style="width: 80%"
          @focus="getEmployeeSimple"
        >
          <el-option
            v-for="item in peoples"
            :key="item.id"
            :label="item.username"
            :value="item.username"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input
          v-model="formData.introduce"
          placeholder="1-300个字符"
          style="width: 80%"
          type="textarea"
          :rows="3"
        />
      </el-form-item>
    </el-form>
    <!-- el-dailog有专门放置底部操作栏的 插槽 -->
    <el-row slot="footer" type="flex" justify="center">
      <el-col :span="6">
        <el-button @click="btnCancel">取 消</el-button>
        <el-button type="primary" @click="btnOk">确 定</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { getDepartments, addDepartments, getDepartDetail, updateDepartments } from '@/api/departments'
import { getEmployeeSimple } from '@/api/employees'
export default {
  name: 'AddDept',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    // 当前操作的节点
    treeNode: {
      type: Object,
      default: null
    }
  },
  data() {
    // 去找同级部门下 是否有重复的部门名称
    const checkNameRepeat = async(rule, value, callback) => {
      // 先获取最新的组织架构数据
      const { depts } = await getDepartments()
      // 检查重复规则 需要支持两种 新增模式 / 编辑模式
      // depts 是所有的部门数据
      // 找技术部所有的子节点
      let isRepeat = false
      if (this.formData.id) {
        // 编辑模式
        // 编辑 上海事业部 => 校验规则 除了我之外 同级部门下 不能有叫上海事业部的
        isRepeat = depts.filter(item => item.id !== this.formData.id && item.pid === this.treeNode.id).some(item => item.name === value)
      } else {
        // 没id 新增模式
        isRepeat = depts.filter(item => item.pid === this.treeNode.id).some(item => item.name === value)
      }
      isRepeat ? callback(new Error(`同级部门下已经有${value}的部门了`)) : callback()
    }
    // 检查编码重复
    const checkCodeRepeat = async(rule, value, callback) => {
      const { depts } = await getDepartments()
      let isRepeat = false
      if (this.formData.id) {
        // 编辑模式下 不能算自己
        isRepeat = depts.some(item => item.id !== this.formData.id && item.code === value && value)
      } else {
        isRepeat = depts.some(item => item.code === value && value) // 加一个value不为空 因为我们部门有可能没有code
      }
      isRepeat ? callback(new Error(`组织架构中已经有部门使用${value}编码`)) : callback()
    }
    return {
      formData: {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '' // 部门分组
      },
      // 定义校验规则
      rules: {
        name: [
          { required: true, message: '部门名称不能为空', trigger: 'blur' },
          {
            min: 1,
            max: 50,
            message: '部门名称要求1-50个字符',
            trigger: 'blur'
          },
          {
            trigger: 'blur',
            validator: checkNameRepeat // 自定义函数的形式校验
          }
        ],
        code: [
          { required: true, message: '部门编码不能为空', trigger: 'blur' },
          {
            min: 1,
            max: 50,
            message: '部门编码要求1-50个字符',
            trigger: 'blur'
          },
          {
            trigger: 'blur',
            validator: checkCodeRepeat // 自定义函数的形式校验
          }
        ],
        manager: [
          { required: true, message: '部门负责人不能为空', trigger: 'blur' }
        ],
        introduce: [
          { required: true, message: '部门介绍不能为空', trigger: 'blur' },
          {
            trigger: 'blur',
            min: 1,
            max: 300,
            message: '部门介绍要求1-50个字符'
          }
        ]
      },
      peoples: [] // 接收获取员工简单列表数据
    }
  },
  computed: {
    showTitle() {
      return this.formData.id ? '编辑部门' : '新增部门'
    }
  },
  methods: {
    async getEmployeeSimple() {
      this.peoples = await getEmployeeSimple()
    },
    // 点击确定时触发
    btnOk() {
      this.$refs.deptForm.validate().then(() => {
        return this.formData.id ? updateDepartments(this.formData) : addDepartments({ ...this.formData, pid: this.treeNode.id })
      }).then(() => {
        this.$emit('addDepts') // 告诉父组件 新增数据成功 重新拉取数据
        // update:props名称
        this.$emit('update:showDialog', false)
      })
    },
    btnCancel() {
    // 重置数据 因为resetFields 只能重置 表单数据 非表单 比如编辑中的id 不能重置
      this.formData = {
        name: '',
        code: '',
        manager: '',
        introduce: ''
      }
      this.$refs.deptForm.resetFields() // 重置校验字段
      this.$emit('update:showDialog', false) // 关闭
    },
    // 获取部门详情
    async getDepartDetail(id) {
      this.formData = await getDepartDetail(id)
    }
  }

}
</script>

<style lang="scss" scoped></style>
