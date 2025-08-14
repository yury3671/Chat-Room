<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { Female, Male } from '@element-plus/icons-vue'
import { ChatDotRound, CirclePlus } from '@element-plus/icons-vue'
import { friendList, showUpdate } from '@/api/setting'

import { useChatStore, useAccountStore } from '@/stores'
import { infoGet } from '@/api/account'
const emit = defineEmits(['close'])
const chatStore = useChatStore()
const accountStore = useAccountStore()
const friendRef = ref(null)
const popoverVisible = ref(false)
const clickX = ref(0)
const clickY = ref(0)
const info = ref({})
const isShow = ref(true)
const account_id = ref('')
const direction = ref(false)
const isFriend = ref(false)
const relation_id = ref('')
const friends = ref([])
onMounted(async () => {
  const res = await friendList()
  console.log(res)
  friends.value = res.data.data.list
})

const open = async (e, id, dir) => {
  isFriend.value = false
  direction.value = dir
  account_id.value = id
  // e.stopPropagation()
  // popoverVisible.value = false
  isShow.value = false
  const res = await infoGet(id)
  console.log(res)
  info.value = res.data.data
  const friend = friends.value.find((item) => item.friend_info.account_id === id)
  if (friend) {
    isFriend.value = true
    relation_id.value = friend.relation_id
  }
  // 获取点击位置相对于视口的坐标（clientX/clientY）
  clickX.value = e.clientX
  clickY.value = e.clientY

  isShow.value = true
  popoverVisible.value = true
}

defineExpose({ open })
//发消息
const sendMes = async () => {
  if (account_id.value === accountStore.id) {
    chatStore.setChatId(chatStore.myId)
  } else {
    chatStore.setChatId(relation_id.value)
  }
  popoverVisible.value = false
  emit('close')
}
</script>

<template>
  <el-popover
    v-model:visible="popoverVisible"
    v-if="isShow"
    width="300"
    placement="right"
    trigger="focus"
    :show-arrow="false"
    :popper-style="{
      minWidth: '0px',
      position: 'absolute',
      top: `${clickY}px`,
      left: `${direction ? clickX - 300 : clickX}px`,
    }"
  >
    <div class="panel">
      <div class="header">
        <el-avatar shape="square" v-if="info.info" :src="info.info.avatar" :size="50" />
        <div v-if="info.info">
          <span style="margin-right: 5px">{{ info.info.name }}</span>
          <el-icon size="20" color="#fb7373" v-if="info.info.gender === '女'"><Female /></el-icon>
          <el-icon size="20" color="#10aeff" v-if="info.info.gender === '男'"><Male /></el-icon>
        </div>
      </div>
      <div class="sign">
        <span style="color: grey">个性签名</span
        ><span style="margin-left: 15px">{{ info.signature }}</span>
      </div>
      <div class="bottom">
        <el-button
          class="btn"
          :icon="ChatDotRound"
          v-if="isFriend || account_id === accountStore.id"
          @click="sendMes"
          >发消息</el-button
        >
        <el-button class="btn" :icon="CirclePlus" v-else @click="friendRef.open(account_id)"
          >加好友</el-button
        >
        <add-friend ref="friendRef"></add-friend>
      </div>
    </div>
  </el-popover>
</template>

<style scoped>
.header {
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}
.panel {
  color: black;
}
.sign {
  margin: 20px 0;
}
.bottom {
  text-align: center;
}
.btn {
  background-color: skyblue;
  color: white;
  width: 150px;
}
.btn:hover {
  background-color: rgb(105, 160, 182);
}
</style>
