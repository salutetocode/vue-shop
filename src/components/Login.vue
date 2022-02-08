<template>
  <div class="login-contanier">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    data() {
      return {
        // 登录表单的数据绑定对象
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        // 表单的验证规则对象
        rules: {
          // 验证用户名是否合法
          username: [{
              required: true,
              message: '请输入用户名',
              trigger: 'blur'
            },
            {
              min: 2,
              max: 5,
              message: '请输入2-5个字符',
              trigger: 'blur'
            }
          ],
          // 验证密码是否合法
          password: [{
              required: true,
              message: '请输入密码',
              trigger: 'blur'
            },
            {
              min: 6,
              max: 15,
              message: '请输入6-15个字符',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    methods: {
      // 点击重置按钮，重置登录表单
      resetLoginForm() {
        // this是当前组件的实例对象
        this.$refs.loginFormRef.resetFields()
      },
      login() {
        // 表单的验证
        this.$refs.loginFormRef.validate(async (valid) => {
          // 表单验证不通过
          if (!valid) return
          // 表单验证通过，发起请求
          const {
            data: res
          } = await this.$http.post('login', this.loginForm)
          if (res.meta.status !== 200) return this.$message.error('登录失败')
          this.$message.success('登录成功')
          // 将登录成功后的token保存到客户端的sessionStorage
          window.sessionStorage.setItem('token', res.data.token)
          // 通过编程式导航this.$router.push()跳转到后台主页 路由地址为/home
          this.$router.push('/home')
        })
      }
    }
  }

</script>

<style lang="less" scoped>
  .login-contanier {
    height: 100%;
    background-color: #2b4b6b;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    // 这两种都可以
    // margin-top: -150px;
    // margin-left: -225px;
    .avatar_box {
      position: absolute;
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }

  // 为防止输入框压住头像，就把表单放到底部，即bottom=0
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .btns {
    display: flex;
    // 横轴上居右对齐
    justify-content: flex-end;
  }

</style>
