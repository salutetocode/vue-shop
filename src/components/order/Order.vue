<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索订单区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单表格区域 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="600px">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="80px">
        </el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="80px">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status==='0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="80px">
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showeditAddressDialog(scope.row)">
            </el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next,
         jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 修改订单地址的对话框 -->
    <el-dialog title="修改地址" :visible.sync="editAddressDialogVisible" width="50%" @close="editAddressDialogClosed">
      <el-form :model="editAddressForm" :rules="editAddressFormRules" ref="editAddressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="editAddressForm.address1" :props="{ expandTrigger: 'hover' }" :options="cityData"
            @change="handleChange" clearable>
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editAddressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 显示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  import cityData from './citydata.js'
  export default {
    data() {
      return {
        // 订单列表
        orderlist: [],
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
        // 控制修改订单地址对话框的显示与隐藏
        editAddressDialogVisible: false,
        // 修改地址的表单数据对象
        editAddressForm: {
          address1: [],
          address2: ''
        },
        // 修改地址表单的验证规则对象
        editAddressFormRules: {
          address1: [{
            requried: true,
            message: '请选择省市区县',
            trigger: 'blur'
          }],
          address2: [{
            requried: true,
            message: '请填写详细地址',
            trigger: 'blur'
          }]
        },
        cityData,
        // 控制物流进度对话框的显示与隐藏
        progressVisible: false,
        // 物流信息
        progressInfo: []
      }
    },
    created() {
      this.getOrderList()
    },
    methods: {
      async getOrderList() {
        const {
          data: res
        } = await this.$http.get('orders', {
          params: this.queryInfo
        })
        console.log(res.data);
        if (res.meta.status !== 200) {
          return this.$message.error('获取订单列表失败！')
        }
        // this.$message.success('获取订单列表成功！')
        this.orderlist = res.data.goods
        this.total = res.data.total
      },
      // 监听pagesize改变的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        // pagesize改变后要重新获取订单列表
        this.getOrderList()
      },
      // 监听pagenum变化的事件
      handleCurrentChange(newPage) {
        // pagenum发生改变后要重新获取订单列表
        this.queryInfo.pagenum = newPage
        this.getOrderList()
      },
      // 展示修改订单地址的对话框
      showeditAddressDialog(info) {
        this.editAddressDialogVisible = true
        console.log(info);
      },
      // 监听修改订单地址对话框关闭的事件
      editAddressDialogClosed() {
        // 重置表单
        this.$refs.editAddressFormRef.resetFields()
      },
      // 当级联选择器的选择项发生变化时触发
      handleChange() {
        console.log(this.editAddressForm);
      },
      // 展示物流进度的对话框
      async showProgress() {
        const {
          data: res
        } = await this.$http.get('/kuaidi/1106975712662')
        // console.log(res.data);
        if (res.meta.status !== 200) {
          return this.$message.error('获取物流进度信息失败！')
        }
        this.progressInfo = res.data
        this.progressVisible = true
        console.log(this.progressInfo);
      }
    },
  }

</script>

<style lang="less" scoped>
  @import '../../plugins/timeline/timeline.css';
  @import '../../plugins/timeline-item/timeline-item.css';

  .el-cascader {
    width: 100%;
  }

</style>
