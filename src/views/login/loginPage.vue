<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userLogin } from '@/api/user'
import { useUserStore } from '@/stores'

//控制登录界面弹出
const dialogVisible = ref(false)
//登录操作
const login = () => {
  dialogVisible.value = true
}
//表单数据
const form = ref({
  email: '',
  password: '',
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
}
//表单预校验
const userStore = useUserStore()
const formRef = ref()
const onLogin = async () => {
  await formRef.value.validate()
  const res = await userLogin(form.value)
  console.log(res)
  userStore.setToken1(res.data.data.token.access_token)
  ElMessage.success('登录成功')
  router.push('/account')
}
//跳转注册
const router = useRouter()
const register = () => {
  router.push('/register')
}
</script>
<template>
  <div class="container">
    <el-header>
      <div class="main">首页</div>
      <div class="login" @click="login">登录</div>
    </el-header>
    <el-dialog v-model="dialogVisible" width="37%" center show-close>
      <template #header>
        <div class="my-header">密码登录</div>
      </template>
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
        <el-form-item>
          <el-button class="btn" @click="onLogin">登录</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="register" @click="register">注册账号</span>
      </template>
    </el-dialog>
    <div class="welcome">Hi! Welcome</div>
    <ul class="bg-squares">
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
  </div>
</template>
<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  text-align: center;
  position: fixed;
  background-image: linear-gradient(to top left, #ffe29f, #ffa99f, skyblue);
}
.el-header {
  position: relative;
  z-index: 3;
}
.welcome {
  margin-top: 300px;
  font-size: 70px;
  color: white;
  text-shadow: 10px 10px 10px grey;
}
.bg-squares {
  list-style: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.bg-squares li {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.15);
  position: absolute;
  bottom: -160px;
  animation: square 20s linear infinite;
}
.bg-squares li:nth-child(1) {
  left: 10%;
}
.bg-squares li:nth-child(2) {
  left: 20%;
  width: 80px;
  height: 80px;
  animation-delay: 2s;
  animation-duration: 17s;
}
.bg-squares li:nth-child(3) {
  left: 25%;
  animation-delay: 4s;
}
.bg-squares li:nth-child(4) {
  left: 40%;
  width: 60px;
  height: 60px;
  animation-delay: 4s;
  background-color: rgba(255, 255, 255, 0.25);
  animation-duration: 22s;
}
.bg-squares li:nth-child(5) {
  left: 70%;
}
.bg-squares li:nth-child(6) {
  left: 80%;
  width: 120px;
  height: 120px;
  animation-delay: 4s;
  background-color: rgba(255, 255, 255, 0.2);
  animation-duration: 3s;
}
.bg-squares li:nth-child(7) {
  left: 32%;
  width: 160px;
  height: 160px;
  animation-delay: 7s;
}
.bg-squares li:nth-child(8) {
  left: 55%;
  width: 20px;
  height: 20px;
  animation-delay: 15s;
  animation-duration: 40s;
}
.bg-squares li:nth-child(9) {
  left: 25%;
  width: 10px;
  height: 10px;
  animation-delay: 2s;
  background-color: rgba(255, 255, 255, 0.3);
  animation-duration: 40s;
}
.bg-squares li:nth-child(10) {
  left: 90%;
  width: 160px;
  height: 160px;
  animation-delay: 11s;
}
@keyframes square {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-120vh) rotate(600deg);
  }
}
.login:hover {
  color: #e7857a;
}
.main {
  color: skyblue;
  background-color: rgba(255, 255, 255);
  padding: 5px 13px;
  border-radius: 15px;
}
.el-dialog {
  padding: 40px 0;
  z-index: 6;
}
.el-header {
  padding: 0 50px;
  border-bottom: 1px solid white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}
.el-input {
  width: 350px;
  /* margin: 0 auto; */
}
.btn {
  width: 350px;
  background-color: rgb(22, 103, 196);
  color: white;
  height: 40px;
  border: 0;
  /* margin: 0 auto; */
}
.btn:hover {
  background-color: rgb(10, 73, 145);
  color: white;
}
.el-form {
  width: 350px;
  margin: 20px auto;
}

.my-header {
  font-size: 25px;
}
.register {
  cursor: pointer;
}
.register:hover {
  color: rgb(79, 117, 241);
}
</style>
