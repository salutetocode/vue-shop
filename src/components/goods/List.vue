<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- :gutter="20"是两列之间的距离，即这里的搜索框和按钮之间的空隙 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="700px">
        </el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）" width="95px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量（kg）" width="70px"></el-table-column>
        <el-table-column prop="goods_number" label="商品数量" width="70px">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditGoodsDialog(scope.row.goods_id)">
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsById(scope.row.goods_id)">
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
      <!-- 修改商品信息的对话框 -->
      <el-dialog title="修改商品信息" :visible.sync="editGoodsDialogVisable" width="50%" @close="editGoodsDialogClosed">
        <el-form :model="editGoodsForm" :rules="editGoodsFormRules" ref="editGoodsFormRef" label-width="90px">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editGoodsForm.goods_name"></el-input>
          </el-form-item>
          <!-- 这里的prop是指校验规则 -->
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="editGoodsForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="editGoodsForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="editGoodsForm.goods_number"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editGoodsDialogVisable = false">取 消</el-button>
          <el-button type="primary" @click="editGoodsInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        goodslist: [],
        // 查询参数对象
        queryInfo: {
          // 查询参数
          query: '',
          // 当前页码
          pagenum: 1,
          // 每页显示条数
          pagesize: 10
        },
        total: 0,
        // 查询到的商品信息
        editGoodsForm: {},
        // 修改用户信息的验证规则对象
        editGoodsFormRules: {
          goods_name: [{
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }],
          goods_price: [{
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }],
          goods_weight: [{
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          }],
          goods_number: [{
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }]
        },
        // 控制修改商品信息的对话框是否可见
        editGoodsDialogVisable: false
      }
    },
    created() {
      this.getGoodsList()
    },
    methods: {
      async getGoodsList() {
        const {
          data: res
        } = await this.$http.get('goods', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表失败！')
        }
        this.goodslist = res.data.goods
        this.total = res.data.total
        console.log(this.goodslist)
        console.log(this.total)
      },
      // 监听pagenum变化的事件
      handleCurrentChange(newNum) {
        this.queryInfo.pagenum = newNum
        this.getGoodsList()
      },
      // 监听pagesize变化的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },
      // 展示修改商品信息的对话框
      async showEditGoodsDialog(id) {
        this.editGoodsDialogVisable = true
        // 根据传过来的id值查询商品信息
        const {
          data: res
        } = await this.$http.get('goods/' + id)
        // 如果查询失败
        if (res.meta.status !== 200) {
          return this.$message.error('查询商品信息失败！')
        }
        // 查询成功
        this.editGoodsForm = res.data
      },
      // 监听修改商品信息对话框的关闭事件
      editGoodsDialogClosed() {
        // 清空上一次关闭时的状态
        this.$refs.editGoodsFormRef.resetFields()
      },
      // 修改商品信息并提交
      editGoodsInfo() {
        // 先进行表单的预验证
        this.$refs.editGoodsFormRef.validate(async (valid) => {
          // 校验失败，停止修改商品信息的操作
          if (!valid) return
          // 校验成功，发起修改商品信息的网络请求
          const {
            data: res
          } = await this.$http.put('goods/' + this.editGoodsForm.goods_id, {
            goods_name: this.editGoodsForm.goods_name,
            goods_price: this.editGoodsForm.goods_price,
            goods_weight: this.editGoodsForm.goods_weight,
            goods_number: this.editGoodsForm.goods_number
          })
          if (res.meta.status !== 201) {
            this.$message.error('修改商品信息失败！')
          }
          // 隐藏修改商品信息的对话框
          this.editGoodsDialogVisable = false
          // 重新获取商品列表
          this.getGoodsList()
          this.$message.success('修改商品信息成功！')
        })
      },
      // 根据id删除对应的商品
      async removeGoodsById(id) {
        const confirmResult = await this.$confirm(
          '此操作将永久删除该商品, 是否继续?',
          '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch((err) => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已经取消了删除！')
        } else {
          const {
            data: res
          } = await this.$http.delete('goods/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error('删除商品失败！')
          }
          this.$message.success('删除商品成功！')
          this.getGoodsList()
        }
      },
      // 点击添加按钮，跳转到添加商品页面
      goAddGoodsPage() {
        // 使用路由导航对象跳转页面
        this.$router.push('/goods/add')
      }
    }
  }

</script>

<style lang="less" scoped></style>
