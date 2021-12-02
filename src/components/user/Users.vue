<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisable = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <!-- 作用域插槽渲染状态 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加用户的对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisable"
        width="50%"
        @close="addDialogClosed"
      >
        <!-- 内容主题区域 -->
        <el-form
          :model="addUserForm"
          :rules="addUserFormRules"
          ref="addUserFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUserForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisable = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户信息的对话框 -->
      <el-dialog
        title="修改用户信息"
        :visible.sync="editDialogVisable"
        width="50%"
        @close="editDialogClosed"
      >
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <!-- 这里的prop是指校验规则 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisable = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    // var checkEmail = (rule, value, callback) => {
    //   // 验证邮箱的正则表达式
    //   const regEmail = /^([a-zA-Z0-9_-])+@(a-zA-Z0-9_-)+(\.[a-zA-Z0-9_-])+/
    //   if (regEmail.test(value)) {
    //     // 合法的邮箱
    //     return cb()
    //   }
    //   // 邮箱不合法
    //   cb(new Error('请输入合法的邮箱'))
    // }
    // 验证手机号码的规则
    var checkMobile = (rule, value, callback) => {
      // 验证手机号码的正则表达式
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法的手机号码
        return callback()
      }
      // 手机号码不合法
      callback(new Error('请输入合法的手机号码'))
    }
    return {
      // 获取用户列表的参数头像
      queryInfo: {
        // 查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 2
      },
      userlist: [],
      total: 1,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisable: false,
      // 控制修改用户信息对话框的显示与隐藏
      editDialogVisable: false,
      // 添加用户的表单数据
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单的验证规则对象
      addUserFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 5, message: '用户名在2~5个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码在6~15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 查询到的用户信息
      editForm: {},
      // 更改用户信息的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // 数据获取失败
      if (res.meta.status !== 200)
        return this.$message.error('获取用户列表失败')
      // 数据获取成功
      this.userlist = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      console.log(newSize)
      // 通过当前选择的pagesize重新渲染页面
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听switch开关状态的改变
    async userStateChanged(userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        // 因为此时虽然没有成功更改数据库里的用户状态，但是页面上已经更改了，所以要把页面上的状态恢复
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      // 清空上一次关闭时的状态，保证每次打开都是全新的对话框
      this.$refs.addUserFormRef.resetFields()
    },
    // 点击确定按钮，添加新用户
    addUser() {
      // 进行表单数据的预验证
      this.$refs.addUserFormRef.validate(async (valid) => {
        // 校验失败 停止添加的操作
        if (!valid) return
        // 校验成功，可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败!')
        }
        this.$message.success('添加用户成功!')
        // 隐藏添加用户的对话框
        this.addDialogVisable = false
        // 重新获取用户列表数据
        this.getUserList()
      })
    },
    // 展示修改用户信息的对话框
    async showEditDialog(id) {
      this.editDialogVisable = true
      // 根据传过来的id值查询用户信息
      const { data: res } = await this.$http.get('users/' + id)
      // 如果查询失败
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败!')
      }
      // 查询成功
      this.editForm = res.data
    },
    // 监听修改用户信息对话框的关闭事件
    editDialogClosed() {
      // 清空上一次关闭时的状态，保证每次打开都是全新的对话框
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo() {
      // 先进行表单的预验证
      this.$refs.editFormRef.validate(async (valid) => {
        // 校验失败，停止修改用户信息的操作
        if (!valid) return
        // 校验成功，可以发起更改用户信息的网络请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        )
        if (res.meta.status !== 200) {
          this.$message.error('修改用户信息失败！')
        }
        // 隐藏修改用户信息的对话框
        this.editDialogVisable = false
        // 重新获取用户列表
        this.getUserList()
        this.$message.success('修改用户信息成功！')
      })
    },
    // 根据id删除对应的用户信息
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      // 如果用户确认删除，则返回值为字符串confirm
      // 如果用户取消了删除，则返回值为字符串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消了删除！')
      } else {
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败！')
        }
        this.$message.success('删除用户成功！')
        // 重新获取用户列表
        this.getUserList()
      }
    }
  }
}
</script>

<style lang="less" scoped></style>
