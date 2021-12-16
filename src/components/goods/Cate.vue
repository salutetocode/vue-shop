<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加商品类别按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showaddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 商品分类列表区域 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="level" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag
            type="success"
            v-else-if="scope.row.cat_level === 1"
            size="mini"
            >二级</el-tag
          >
          <el-tag type="warning" v-else size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="option" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showeditCateDialog(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCateById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
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
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            expand-trigger="hover"
            :options="parentcatelist"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children'
            }"
            v-model="selectedKeys"
            @change="parentcateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类名称的对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据列表
      catelist: [],
      // 查询条件
      queryInfo: {
        // 查询参数
        type: 3,
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 为表格指定列的定义
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          // 表示将当前行设为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'level'
        },
        {
          label: '操作',
          type: 'template',
          template: 'option'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类的id,默认为0
        cat_pid: 0,
        // 将要添加的分类等级，默认为一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentcatelist: [],
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 控制编辑分类名称对话框的显示与隐藏
      editCateDialogVisible: false,
      // 查询到的分类信息
      editCateForm: {},
      // 编辑分类信息表单的验证规则对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入要修改的信息', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('查询商品分类列表失败！')
      }
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize的变化
    handleSizeChange(newSize) {
      // 当pagesize发生变化后，就把新的newSize赋给pagesize
      this.queryInfo.pagesize = newSize
      // 重新获取分类列表
      this.getCateList()
    },
    // 监听pagenum的变化
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    // 点击按钮展示添加分类的对话框
    showaddCateDialog() {
      // 先获取父级分类数据列表
      this.getParentCateList()
      // 再展示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        // 表示只获取前两层
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败！')
      }

      this.parentcatelist = res.data
    },
    // 选择项发生变化触发这个函数
    parentcateChange() {
      console.log(this.selectedKeys)
      // 如果selectedKeys数组的length>0，就说明选中了父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        // 如果selectedKeys的length为0，则说明没有选中任何一个父级分类
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 监听添加分类对话框关闭的事件
    addCateDialogClosed() {
      // 清空对话框，重置表单数据
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 点击按钮，添加新的分类
    addCate() {
      // 预验证
      this.$refs.addCateFormRef.validate(async (valid) => {
        // 如果不合法就停止
        if (!valid) return
        // 合法
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 点击编辑按钮，展示编辑分类名称的对话框
    async showeditCateDialog(cateInfo) {
      this.editCateDialogVisible = true
      // console.log(cateInfo)
      const { data: res } = await this.$http.get(
        'categories/' + cateInfo.cat_id
      )
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类信息失败！')
      }
      // console.log(res.data)
      this.editCateForm = res.data
    },
    // 监听编辑分类信息对话框关闭的事件
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 点击确定按钮，触发修改分类信息事件
    editCateInfo() {
      // 先进行表单的预验证
      this.$refs.editCateFormRef.validate(async (valid) => {
        // 如果校验失败，就停止当前的修改分类信息操作
        if (!valid) return
        // 校验成功
        const { data: res } = await this.$http.put(
          'categories/' + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name }
        )
        console.log(res.data)
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类信息失败！')
        }
        this.getCateList()
        this.$message.success('修改分类信息成功！')
        this.editCateDialogVisible = false
      })
    },
    // 根据id删除对应的分类信息
    async removeCateById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消了删除')
      } else {
        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败！')
        }
        this.$message.success('删除分类成功！')
        this.getCateList()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin-bottom: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
