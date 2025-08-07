<script setup>
import { ref } from 'vue'
import { Female, Male } from '@element-plus/icons-vue'
import { applicationCreate } from '@/api/application'
import { infoGet } from '@/api/account'
import emitter from '@/assets/eventBus'
const person = ref({})
const account_id = ref('')
const dialogVisible = ref(false)
const open = async (id) => {
  dialogVisible.value = true
  account_id.value = id
  const res = await infoGet(id)
  person.value = res.data.data.info
  console.log(person.value)
}
defineExpose({ open })
const mes = ref('')

//取消
const quit = () => {
  dialogVisible.value = false
}
//发送申请
const send = async () => {
  const res = await applicationCreate(account_id.value, mes.value)
  console.log(res)
  emitter.emit('success')
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    width="20%"
    draggable
    :modal="false"
    center
    top="20vh"
    append-to-body="true"
  >
    <template #header>
      <div class="head">申请添加好友</div>
    </template>
    <div class="content">
      <div class="info">
        <el-avatar shape="square" :src="person.avatar" />
        <div class="name">{{ person.name }}</div>
        <el-icon size="17" color="#fb7373" v-if="person.gender === '女'"><Female /></el-icon>
        <el-icon size="17" color="#10aeff" v-if="person.gender === '男'"><Male /></el-icon>
      </div>
      <div class="mes">
        <div>填写验证信息</div>
        <el-input class="input" type="textarea" v-model="mes" :rows="2"></el-input>
      </div>
      <div class="foot">
        <el-button class="btn send" @click="send">发送</el-button>
        <el-button class="btn" @click="quit">取消</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.head {
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}
.input {
  margin: 10px 0;
}
.foot {
  display: flex;
  width: 100%;
  justify-content: end;
}
.btn {
  width: 80px;
}
.send {
  background-color: skyblue;
  color: white;
}
.send:hover {
  background-color: rgb(105, 160, 182);
}
</style>
