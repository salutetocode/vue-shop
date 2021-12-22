<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- Tab栏区域 -->
      <el-form :model="addGoodsForm" :rules="addGoodsFormRules" ref="addGoodsFormRef" label-width="100px"
        label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addGoodsForm.goods_cat" :options="catelist" :props="{
                  expandTrigger: 'hover',
                  value: 'cat_id',
                  label: 'cat_name',
                  children: 'children'
                }" @change="handleChange" clearable></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="(item, i) in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="(item, i) in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片要上传到的后台api地址 -->
            <el-upload action="https://lianghj.top:8888/api/private/v1/upload" :on-preview="handlePreview"
              :on-remove="handleRemove" list-type="picture" :headers="headersObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览的对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewimg"></img>
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'
  export default {
    data() {
      return {
        activeIndex: '0',
        // 添加商品的表单数据对象
        addGoodsForm: {
          // 商品名称
          goods_name: '',
          // 商品价格
          goods_price: 0,
          // 商品重量
          goods_weight: 0,
          // 商品数量
          goods_number: 0,
          // 商品分类的数组
          goods_cat: [],
          // 图片的数组
          pics: [],
          // 商品的详情描述
          goods_introduce: '',
          // 商品的参数数组，包含动态参数和静态属性
          attrs: []
        },
        // 添加商品表单的验证规则对象
        addGoodsFormRules: {
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
          }],
          goods_cat: [{
            required: true,
            message: '请选择商品分类',
            trigger: 'blur'
          }]
        },
        // 商品分类列表
        catelist: [],
        // 动态参数列表
        manyTableData: [],
        // 静态属性列表
        onlyTableData: [],
        // 图片上传组件的headers请求头对象
        headersObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        // 预览图片地址
        previewPath: '',
        // 控制图片预览对话框是否可见
        previewVisible: false,
      }
    },
    created() {
      this.getCateList()
    },
    // 计算属性
    computed: {
      // 获取三级分类的id
      cateId() {
        if (this.addGoodsForm.goods_cat.length === 3) {
          return this.addGoodsForm.goods_cat[2]
        }
        return null
      }
    },
    methods: {
      // 获取所有商品分类数据列表
      async getCateList() {
        const {
          data: res
        } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类列表失败！')
        }
        console.log(res.data)
        this.catelist = res.data
        // this.$message.success('获取商品分类列表成功！')
      },
      // 级联选择器的选择项发生变化时触发
      handleChange() {
        console.log(this.addGoodsForm.goods_cat)
        // 判断是否选择了三级分类
        if (this.addGoodsForm.goods_cat.length !== 3) {
          this.addGoodsForm.goods_cat = []
        }
      },
      // 在标签页切换时触发
      beforeTabLeave(activeName, oldactiveName) {
        // console.log('即将要去往的标签页：' + activeName)
        // console.log('即将要离开的标签页：' + oldactiveName)
        if (oldactiveName === '0' && this.addGoodsForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类！')
          // 阻止标签页进行切换
          return false
        }
      },
      // 点击标签页时触发
      async tabClicked() {
        // console.log(this.activeIndex)
        if (this.activeIndex === '1') {
          // console.log('动态参数面板')
          const {
            data: res
          } = await this.$http.get(
            `categories/${this.cateId}/attributes`, {
              params: {
                sel: 'many'
              }
            }
          )
          // console.log(res.data)
          if (res.meta.status !== 200) {
            return this.$message.error('获取动态属性失败！')
          }
          res.data.forEach((item) => {
            item.attr_vals =
              item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
          })
          this.manyTableData = res.data
        } else if (this.activeIndex === '2') {
          // console.log('静态属性面板')
          const {
            data: res
          } = await this.$http.get(
            `categories/${this.cateId}/attributes`, {
              params: {
                sel: 'only'
              }
            }
          )
          console.log(res.data)
          if (res.meta.status !== 200) {
            return this.$message.error('获取静态属性失败！')
          }
          this.onlyTableData = res.data
        }
      },
      // 处理图片预览效果
      handlePreview(file) {
        console.log(file);
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },
      // 处理移除图片的操作
      handleRemove(file) {
        console.log(file)
        // 1.获取将要删除的图片的临时路径
        const filePath = file.response.data.tmp_path
        // 2.从pics数组中找到这个图片对应的索引值
        const i = this.addGoodsForm.pics.findIndex((x) => x.pic === filePath)
        // 3.调用数组的splice方法，把图片信息对象，从pics数组中移除
        this.addGoodsForm.pics.splice(i, 1)
        console.log(this.addGoodsForm)
      },
      // 文件上传成功时触发的方法
      handleSuccess(response) {
        // console.log(response)
        // 1.拼接得到一个图片信息对象
        const picinfo = {
          pic: response.data.tmp_path
        }
        // 2.将图片信息对象push到pics数组中
        this.addGoodsForm.pics.push(picinfo)
        console.log(this.addGoodsForm)
      },
      // 添加商品
      add() {
        console.log(this.addGoodsForm);
        // 先进行预验证
        this.$refs.addGoodsFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填写必要的表单项！')
          }
          // 验证合法就执行添加商品的业务逻辑
          // 把数组转化为以,分隔的字符串
          // 深拷贝 lodash cloneDeep(obj)
          const form = _.cloneDeep(this.addGoodsForm)
          form.goods_cat = form.goods_cat.join(',')
          // 处理动态参数
          this.manyTableData.forEach(item => {
            const newManyInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addGoodsForm.attrs.push(newManyInfo)
          })
          // 处理静态属性
          this.onlyTableData.forEach(item => {
            const newOnlyInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addGoodsForm.attrs.push(newOnlyInfo)
          })
          form.attrs = this.addGoodsForm.attrs
          console.log(form)

          // 发起请求，添加商品
          // 商品的名字必须是唯一的
          const {
            data: res
          } = await this.$http.post('goods', form)
          if (res.meta.status !== 201) {
            return this.$message.error('添加商品失败！')
          }
          this.$message.success('添加商品成功！')
          // 使用路由导航返回商品列表页面
          this.$router.push('/goods')
        })
      }
    }
  }

</script>

<style lang="less" scoped>
  .el-steps {
    margin: 15px 0;
  }

  .el-step__title {
    font-size: 13px;
  }

  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .previewimg {
    width: 100%;
  }

  .btnAdd {
    margin-top: 15px;
  }

</style>
