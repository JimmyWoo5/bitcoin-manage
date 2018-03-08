<template>
  <div id='login'>
    <el-form :model="form" :rules="rules" ref="form" class='form'>
      <el-form-item prop="account">
        <el-input @keyup.enter.native='login' placeholder='请输入账号' v-model.trim="form.account"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input @keyup.enter.native='login' type="password" placeholder='请输入密码' v-model.trim="form.password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button style='width:100%' type="primary" @click="login" :loading='loading'>登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loading: false,
      form: {
        account: '',
        password: ''
      },
      rules: {
        account: [{required: true, message: '请输入账号'}],
        password: [{required: true, message: '请输入密码'}]
      }
    }
  },
  methods: {
    login () {
      this.$refs.form.validate(valid => {
        if (valid) {
          console.log(this.form)
          this.loading = true
          this.$ajax({
            url: '/account/login',
            method: 'post',
            data: this.form,
            done: (res) => {
              localStorage.setItem('token', res.data)
              this.$store.commit('updateToken', res.data)
              this.$router.push('/home')
            },
            always: () => {
              this.loading = false
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="less">
  #login{
    .form{width:300px;padding: 50px 100px;margin:10% auto;background: #fafafa;}
  }
</style>
