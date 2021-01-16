<template>
  <div class="container">
    <el-row>
      <el-col class="outer">
        <el-tabs v-model="activeName" @tab-click="tabClick('form')">
          <el-tab-pane label="登录" name="login">
            <el-form ref="form" :model="form" class="form">
              <el-row>
                <el-col :xs="24">
                  <el-form-item
                    prop="username"
                    :rules="[{ required: true, message: '请输入用户名' }]"
                  >
                    <el-input
                      v-model="form.username"
                      prefix-icon="el-icon-user-solid"
                      placeholder="用户名"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :xs="24">
                  <el-form-item
                    prop="password"
                    :rules="[{ required: true, message: '请输入密码' }]"
                  >
                    <el-input
                      type="password"
                      v-model="form.password"
                      placeholder="密码"
                      prefix-icon="el-icon-s-goods"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :xs="24">
                  <el-form-item>
                    <el-button
                      class="submitButton"
                      type="primary"
                      @click="submitForm('form')"
                      :loading="loading"
                      :disabled="disabled"
                      >登录</el-button
                    >
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="注册" name="register">
            <el-form
              ref="registerForm"
              :model="registerForm"
              class="registerForm"
            >
              <el-row>
                <el-col :xs="24">
                  <el-form-item
                    prop="username"
                    :rules="[{ required: true, message: '请输入用户名' }]"
                  >
                    <el-input
                      v-model="registerForm.username"
                      prefix-icon="el-icon-user-solid"
                      placeholder="用户名"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :xs="24">
                  <el-form-item
                    prop="password"
                    :rules="[{ required: true, message: '请输入密码' }]"
                  >
                    <el-input
                      type="password"
                      v-model="registerForm.password"
                      placeholder="密码"
                      prefix-icon="el-icon-s-goods"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :xs="24">
                  <el-form-item>
                    <el-button
                      class="submitButton"
                      type="primary"
                      @click="submitRegisterForm('registerForm')"
                      :loading="loading"
                      :disabled="disabled"
                      >注册</el-button
                    >
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  name: 'Login',
  data() {
    return {
      activeName: 'login',
      form: {
        username: '',
        password: '',
      },
      registerForm: {
        username: '',
        password: '',
      },
      loading: false,
      disabled: false,
    }
  },
  methods: {
    tabClick(formName) {
      formName && this.$refs[formName].resetFields()
    },
    // 登录
    submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.loading = true
          this.disabled = true
          const res = await axios({
            method: 'POST',
            url: 'http://localhost:3001/login',
            data: this.form,
          })
          if (res.data.status !== 200) {
            this.$msg.error(res.data.message)
          } else {
            this.$msg.success('登录成功')
            localStorage.setItem('token', res.data.data)
            this.$router.replace('/')
          }
          this.loading = false
          this.disabled = false
          this.$refs[formName].resetFields()
        } else {
          return false
        }
      })
    },
    // 注册
    submitRegisterForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.loading = true
          this.disabled = true
          const res = await axios({
            method: 'POST',
            url: 'http://localhost:3001/register',
            data: this.registerForm,
          })
          if (res.data.status !== 200) {
            this.$msg.error(res.data.message)
          } else {
            this.activeName = 'login'
            this.$msg.success(res.data.message)
          }
          this.loading = false
          this.disabled = false
          this.$refs[formName].resetFields()
        } else {
          return false
        }
      })
    },
  },
}
</script>

<style scoped>
/deep/.el-tabs__item {
  color: #fff;
}
/deep/.el-tabs__item.is-active {
  color: #409eff;
}
.container {
  width: 100vw;
  height: 100vh;
  background-image: url('../public/logo.jpg');
}
.outer {
  min-width: 200px;
  max-width: 500px;
  height: 50%;
  margin-left: 50%;
  margin-top: 300px;
  transform: translateX(-50%);
}

.submitButton,
.registerButton {
  width: 100%;
  min-width: 100px;
}
</style>