<script setup>
import { ref } from 'vue'
import { accountCreate, accountAlert, alterAvator } from '@/api/account'
import { Camera } from '@element-plus/icons-vue'

import { useAccountStore, useUserStore } from '@/stores'
const userStore = useUserStore()
//个人信息
let flag = 0
//控制编辑页的打开
const dialogVisible = ref(false)
const form = ref(null)
//头像上传
const imageUrl = ref('')
const file = ref(null)
const open = (num) => {
  dialogVisible.value = true
  //根据传递的参数确认是创建还是修改
  flag = num
  const { name, gender, signature, avatar } = useAccountStore()
  form.value = {
    name,
    gender,
    signature,
  }
  if (flag === 1) {
    file.value = null
    imageUrl.value = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  } else {
    imageUrl.value = avatar
  }
}
defineExpose({ open })

//自定义校验：validator:(rule, value, callback)
//rule:当前校验规则相关的信息
//value:所校验的表单元素目前的表单值
//callback: 无论成功或失败，都需要callback回调
// 1.callback() 校验成功
// 2.callback(new Error(错误信息)) 校验失败
const rules = {
  name: [
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          ElMessage({
            message: '昵称不能为空',
            type: 'warning',
            offset: 120,
          })
          callback(new Error())
        } else {
          callback() //成功
        }
      },
      trigger: 'blur',
    },
  ],
  // signature: [
  //   {
  //     validator: (rule, value, callback) => {
  //       if (value === '') {
  //         ElMessage({
  //           message: '个性签名不能为空',
  //           type: 'warning',
  //           offset: 120,
  //         })
  //         callback(new Error())
  //       } else {
  //         callback() //成功
  //       }
  //     },
  //     trigger: 'blur',
  //   },
  // ],
}

//uploadFile是文件对象
const selectFile = async (uploadFile) => {
  //只触发一次状态改变
  if (uploadFile.status !== 'ready') return
  //预览图片 生成临时url
  imageUrl.value = URL.createObjectURL(uploadFile.raw)
  if (flag === 1) {
    file.value = uploadFile.raw
  } else {
    useAccountStore().setAvatar(imageUrl.value)
    await alterAvator(uploadFile.raw)
    ElMessage.success('设置成功')
  }
}
//子传父
const emit = defineEmits(['create', 'alert'])
//修改个人信息
const formRef = ref()
const save = async () => {
  await formRef.value.validate()
  if (!form.value.gender) {
    form.value.gender = '未知'
  }
  if (flag === 1) {
    //创建
    const res = await accountCreate(form.value)
    if (file.value) {
      console.log(res)
      userStore.setToken2(res.data.data.param_get_account_token.account_token.token)
      const res1 = await alterAvator(file.value)
      console.log(res1)
      userStore.setToken2('')
    }
    ElMessage.success('创建成功')
    emit('create')
    dialogVisible.value = false
  } else {
    //修改
    await accountAlert(form.value)
    ElMessage.success('修改成功')
    emit('alert')
    dialogVisible.value = false
  }
}
//取消按钮
const quit = async () => {
  if (flag === 2) {
    await formRef.value.validate()
  }
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog title="编辑资料" v-model="dialogVisible" width="30%">
    <el-form :model="form" :rules="rules" ref="formRef">
      <!-- 关闭element-plus的自动上传，不需要action等参数 -->
      <!-- 只需要做前端的本地预览图片即可，无需在提交前上传图标 -->
      <!-- 语法：URL.createObjectURL(...)  创建本地预览的地址来预览-->
      <el-upload
        class="avatar-uploader"
        :show-file-list="false"
        :auto-upload="false"
        :on-change="selectFile"
      >
        <el-avatar v-if="imageUrl" shape="square" :src="imageUrl" :size="100" />
        <el-icon class="plus" size="40"><Camera /></el-icon>
      </el-upload>
      <el-form-item prop="name">
        <el-input maxlength="20" show-word-limit v-model="form.name">
          <template #prepend>昵称</template>
        </el-input>
      </el-form-item>
      <el-form-item prop="signature">
        <el-input maxlength="100" show-word-limit v-model="form.signature">
          <template #prepend>个签</template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="form.gender" placeholder="性别" clearable>
          <el-option label="女" value="女" />
          <el-option label="男" value="男" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <div class="foot">
          <el-button class="btn save" @click="save">保存</el-button>
          <el-button class="btn" @click="quit">取消</el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped>
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
.plus {
  width: 100px;
  height: 100px;
  background-color: rgba(128, 128, 128, 0.5);
  position: absolute;
}
.avatar-uploader {
  width: 100px;
  height: 100px;
  margin: 15px auto;
}
</style>
