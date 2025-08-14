<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userCode, userRegister } from '@/api/user'
// import { ElMessage } from 'element-plus'
//表单数据
const form = ref({
  email: '',
  password: '',
  code: '',
})
//表单校验
const rules = {
  email: [
    { required: true, message: '邮箱不可以为空', trigger: 'blur' },
    {
      //\.表示匹配点号（转义字符/）
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '请输入正确邮箱账号',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '密码不可以为空', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]{6,20}$/,
      message: '密码必须为6-20位，可以包含大小写字母、数字、下划线',
      trigger: 'blur',
    },
  ],
  code: [
    { required: true, message: '验证码不可以为空', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z]{6}$/,
      message: '验证码为6位字母',
      trigger: 'blur',
    },
  ],
}
//获取验证码倒计时
const getRef = ref()
let flag = true
let timer = 0
const confirm = async () => {
  if (flag) {
    //单独验证email是否正确
    await formRef.value.validateField('email')
    console.log(form.value.email)
    //发送验证码
    await userCode(form.value.email)
    let num = 60
    getRef.value.innerHTML = `${num}后重新获取`
    flag = false
    getRef.value.style.color = 'grey'
    timer = setInterval(() => {
      num--
      console.log(num)
      getRef.value.innerHTML = `${num}后重新获取`
      if (num === 0) {
        clearInterval(timer)
        getRef.value.innerHTML = '获取验证码'
        getRef.value.style.color = 'rgb(79, 117, 241)'
        flag = true
        num = 60
      }
    }, 1000)
  }
}
//控制验证码输入框显示和隐藏
const appear = ref(false)
//表单预校验
const router = useRouter()
const formRef = ref()
const register = async () => {
  await formRef.value.validate()
  const res = await userRegister(form.value)
  console.log(res)
  clearInterval(timer)
  ElMessage.success('注册成功')
  router.push('/login')
}
//返回登录
const login = async () => {
  clearInterval(timer)
  router.push('/login')
}
</script>

<template>
  <div class="container">
    <div class="content">
      <header>
        <div class="head">欢迎注册</div>
        <div>每一天，乐在沟通</div>
      </header>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="email">
          <el-input
            placeholder="邮箱"
            @focus="appear = true"
            v-model="form.email"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input placeholder="密码" v-model="form.password" show-password clearable></el-input>
        </el-form-item>
        <el-form-item v-show="appear" prop="code">
          <el-input placeholder="验证码" v-model="form.code" clearable></el-input>
          <span class="confirm" @click="confirm" ref="getRef" :class="{ active: form.email }"
            >获取验证码
          </span>
        </el-form-item>
        <el-form-item>
          <el-button class="btn" @click="register" plain>立即注册</el-button>
        </el-form-item>
        <el-form-item><span class="back" @click="login">返回登录</span></el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  /* background-image: url('../../utils/微信图片_20240605221651.jpg'); */
  background-image: linear-gradient(125deg, skyblue, pink, #8fe6cb, rgb(157, 193, 223), #dfc2eb);
  background-size: 400%;
  animation: bgmove 17s infinite;
}
@keyframes bgmove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.content {
  margin: 250px auto;
  width: 350px;
}
.head {
  font-size: 35px;
  margin-bottom: 10px;
}
.el-form {
  margin-top: 30px;
}
.btn {
  width: 350px;
  background-color: rgb(22, 103, 196);
  color: white;
  height: 40px;
  border: 0;
}
.btn:hover {
  background-color: rgb(10, 73, 145);
  color: white;
}
.confirm {
  color: grey;
  position: absolute;
  right: 15px;
}
.active {
  color: rgb(79, 117, 241);
}
.back {
  cursor: pointer;
}
.back:hover {
  color: rgb(79, 117, 241);
}
</style>
