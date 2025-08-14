<script setup>
import { ref } from 'vue'
import { groupCreate, groupInvite, groupUpdate } from '@/api/group'
import { Camera } from '@element-plus/icons-vue'

import emitter from '@/assets/eventBus'
const emit = defineEmits(['success', 'close'])
//群聊信息
const form = ref({
  name: '',
  description: '',
})
//头像上传
const imageUrl = ref('')
let flag = 0
//控制编辑页的打开
const dialogVisible = ref(false)
const account_id = ref([])
const group_info = ref({})
const file = ref(null)
const open = (num, info) => {
  if (num === 1) {
    form.value = {
      name: '',
      description: '',
    }
    account_id.value = info
    imageUrl.value = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    file.value = null
  } else {
    form.value.name = info.name
    form.value.description = info.description
    imageUrl.value = info.avatar
    group_info.value = info
  }
  dialogVisible.value = true
  //根据传递的参数确认是创建还是修改
  flag = num
}
defineExpose({ open })
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
}
//uploadFile是文件对象
const selectFile = async (uploadFile) => {
  //只触发一次状态改变
  if (uploadFile.status !== 'ready') return
  //预览图片 生成临时url
  imageUrl.value = URL.createObjectURL(uploadFile.raw)
  file.value = uploadFile.raw
}
const formRef = ref()
const create = async () => {
  await formRef.value.validate()
  if (flag === 1) {
    //创建
    const res = await groupCreate(form.value)
    console.log(res)
    if (file.value) {
      const res1 = await groupUpdate(res.data.data.relation_id, file.value, form.value)
      console.log(res1)
    }
    await groupInvite(account_id.value, res.data.data.relation_id)

    emit('success')
    ElMessage.success('创建成功')
  } else {
    const res = await groupUpdate(group_info.value.relation_id, file.value, form.value)
    console.log(res)
    ElMessage.success('修改成功')
    emit('close')
  }
  emitter.emit('updata')
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog v-model="dialogVisible" title="群聊信息" width="20%" :modal="false" draggable="true">
    <el-form :model="form" ref="formRef" :rules="rules" class="form">
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
        <el-input placeholder="群聊名称" v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-input placeholder="群聊描述" v-model="form.description"></el-input>
      </el-form-item>
      <el-form-item>
        <div class="foot">
          <el-button class="btn save" @click="create" v-if="flag === 1">创建</el-button>
          <el-button class="btn save" @click="create" v-else>修改</el-button>
          <el-button class="btn" @click="dialogVisible = false">返回</el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped>
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
.form {
  margin-top: 20px;
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
</style>
