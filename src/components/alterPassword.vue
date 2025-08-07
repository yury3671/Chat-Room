<script setup>
import { ref } from 'vue'
import { userCode, passwordAlert } from '@/api/user'
//控制编辑框的打开与关闭
const dialogVisible = ref(false)
const open = () => {
  dialogVisible.value = true
}
defineExpose({ open })
//控制验证码输入框显示和隐藏
const appear = ref(false)
//表单数据
const form = ref({
  email: '',
  code: '',
  password: '',
})
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
  code: [
    { required: true, message: '验证码不可以为空', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z]{6}$/,
      message: '验证码为6位字母',
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
//获取验证码倒计时
const getRef = ref()
let flag = true
let timer = 0
const formRef = ref()
const confirm = async () => {
  if (flag) {
    //单独验证email是否正确
    await formRef.value.validateField('email')
    //发送验证码
    const res = await userCode(form.value.email)
    console.log(res)
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
//修改密码
const save = async () => {
  await formRef.value.validate()
  console.log(form.value.code)
  console.log(form.value.password)
  const res = await passwordAlert(form.value.code, form.value.password)
  console.log(res)
  ElMessage.success('修改密码成功')
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog title="修改密码" v-model="dialogVisible" width="20%">
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item prop="email">
        <el-input placeholder="邮箱" @focus="appear = true" v-model="form.email"></el-input>
      </el-form-item>
      <el-form-item v-show="appear" prop="code">
        <el-input placeholder="验证码" v-model="form.code"></el-input>
        <span class="confirm" @click="confirm" ref="getRef" :class="{ active: form.email }"
          >获取验证码
        </span>
      </el-form-item>
      <el-form-item prop="password">
        <el-input placeholder="新密码" v-model="form.password"></el-input>
      </el-form-item>
      <el-form-item>
        <div class="foot">
          <el-button class="btn save" @click="save">保存</el-button>
          <el-button class="btn" @click="dialogVisible = false">取消</el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped>
.el-form {
  padding-top: 20px;
}
.foot {
  display: flex;
  width: 100%;
  justify-content: end;
}
.btn {
  width: 80px;
}
.save {
  background-color: skyblue;
  color: white;
}
.save:hover {
  background-color: rgb(105, 160, 182);
}

.confirm {
  color: grey;
  position: absolute;
  right: 15px;
}
.active {
  color: rgb(79, 117, 241);
}
</style>
