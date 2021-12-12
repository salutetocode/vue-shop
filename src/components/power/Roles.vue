<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisable = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightByid(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 !== 0 ? 'bdtop' : '', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightByid(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <!-- 通过for循环嵌套渲染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightByid(scope.row, item3.id)"
                    >
                      <!-- 渲染三级权限 -->
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"> </el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"> </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showRoleEditDialog(scope.row.id)"
              >编辑
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色的对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addRoleDialogVisable"
        width="50%"
        @close="addRoleDialogClosed"
      >
        <el-form
          :model="addRoleForm"
          :rules="addRoleFormRules"
          ref="addRoleFormRef"
          label-width="70px"
        >
          <el-form-item label="角色名" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRoleDialogVisable = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限的对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="showSetRightDialogVisible"
        width="50%"
        @close="SetRightDialogClosed"
      >
        <!-- 树形控件 -->
        <el-tree
          :data="rightList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
          ref="treeRef"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showSetRightDialogVisible = false"
            >取 消</el-button
          >
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色信息的对话框 -->
      <el-dialog
        title="修改角色信息"
        :visible.sync="editRoleDialogVisable"
        width="50%"
        @close="editRoleDialogClosed"
      >
        <el-form
          :model="editRoleForm"
          :rules="editRoleFormRules"
          ref="editRoleFormRef"
          label-width="70px"
        >
          <el-form-item label="角色名" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <!-- 这里的prop是指校验规则 -->
          <el-form-item label="描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRoleDialogVisable = false">取 消</el-button>
          <el-button type="primary" @click="editRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 控制分配权限的对话框是否展示
      showSetRightDialogVisible: false,
      // 权限列表
      rightList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        // 代表看到的是哪个属性对应的值
        label: 'authName',
        // 代表父子节点是通过什么属性来嵌套的
        children: 'children'
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
      // 控制添加角色对话框的显示与隐藏
      addRoleDialogVisable: false,
      // 添加角色的表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单的验证规则对象
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 5,
            message: '角色名称在2~5个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '角色描述在2~10个字符之间',
            trigger: 'blur'
          }
        ]
      },
      // 控制角色信息修改对话框的显示与隐藏
      editRoleDialogVisable: false,
      // 查询到的角色信息
      editRoleForm: {},
      // 更改角色信息的验证规则对象
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 5,
            message: '角色名称在2~5个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '角色描述在2~10个字符之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    // 获取角色列表
    this.getRolesList()
  },
  methods: {
    // 获取所有的角色
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    // 根据id删除权限
    async removeRightByid(role, rightId) {
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
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败！')
        }
        this.$message.success('删除权限成功！')
        // 不建议重新获取权限列表，那样就会重新渲染整个页面
        // this.getRolesList()
        // 更新最新的权限
        role.children = res.data
      }
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      //当前被展开权限的角色id
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      // 把获取到的数据保存在data中
      this.rightList = res.data
      console.log(this.rightList)
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      this.showSetRightDialogVisible = true
    },
    // 通过递归的方式，获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果不是三级节点，就继续往该节点的下一层进行递归，直至三级节点
      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框关闭的事件
    SetRightDialogClosed() {
      // 每次关闭对话框之后都清除defKeys数组中积累的数据，保证每次打开都是属于自己的数据
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 把keys数组转化为以英文,拼接的字符串
      const idStr = keys.join(',')
      // 分配权限
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      // 角色授权失败
      if (res.meta.status !== 200) {
        return this.$message.error('角色分配权限失败！')
      }
      this.$message.success('角色分配权限成功！')
      // 重新获取所有的角色数据
      this.getRolesList()
      // 关闭分配权限的对话框
      this.showSetRightDialogVisible = false
    },
    // 点击确定按钮，添加新角色
    addRole() {
      // 进行表单数据的预验证
      this.$refs.addRoleFormRef.validate(async (valid) => {
        // 校验失败 停止添加角色的网络请求
        if (!valid) return
        // 校验成功，可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        // 隐藏添加角色的对话框
        this.addRoleDialogVisable = false
        // 重新获取角色列表数据
        this.getRolesList()
      })
    },
    // 监听添加角色对话框关闭的事件
    addRoleDialogClosed() {
      // 清空上一次关闭时的状态，保证每次打开都是全新的对话框
      this.$refs.addRoleFormRef.resetFields()
    },
    // 展示修改角色信息的对话框
    async showRoleEditDialog(id) {
      this.editRoleDialogVisable = true
      // 根据传过来的id查询角色信息
      const { data: res } = await this.$http.get('roles/' + id)
      // 如果查询失败
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败！')
      }
      // 查询成功
      this.editRoleForm = res.data
    },
    // 监听修改用户信息对话框关闭的事件
    editRoleDialogClosed() {
      // 清空上一次关闭时的状态，保证每次打开都是全新的对话框
      this.$refs.editRoleFormRef.resetFields()
    },
    // 修改角色信息并提交
    editRoleInfo() {
      // 先进行表单的预验证
      this.$refs.editRoleFormRef.validate(async (valid) => {
        // 校验失败，停止修改角色信息的操作
        if (!valid) return
        // 校验成功，可以发起更改用户信息的网络请求
        const { data: res } = await this.$http.put(
          'roles/' + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('修改角色信息失败！')
        }
        // 隐藏修改角色信息的对话框
        this.editRoleDialogVisable = false
        // 重新获取角色列表
        this.getRolesList()
        this.$message.success('修改角色信息成功！')
      })
    },
    // 根据id删除对应的角色信息
    async removeRoleById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消了删除！')
      } else {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除角色失败！')
        }
        this.$message.success('删除角色成功！')
        // 重新获取角色列表
        this.getRolesList()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  // 纵向上居中
  align-items: center;
}
</style>
