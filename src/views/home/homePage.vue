<script setup>
import { accountDelete, infoGet } from '@/api/account'
import { ChatDotRound, User, Edit, Tools } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'

import { closeConnection } from '@/utils/websocket'

import { ref } from 'vue'

import { useUserStore, useAccountStore, useChatStore } from '@/stores'

const chatStore = useChatStore()
//获取账户信息
const isReady = ref(false)
const accountStore = useAccountStore()
const getInfo = async () => {
  const res = await infoGet(accountStore.id)
  const info = res.data.data.info
  console.log(info)
  accountStore.setId(info.id)
  accountStore.setName(info.name)
  accountStore.setGender(info.gender)

  accountStore.setAvatar(info.avatar)

  accountStore.setSignature(res.data.data.signature)
  isReady.value = true
}
getInfo()
const route = useRoute()
const router = useRouter()
//退出确认框
const dialogVisible1 = ref(false)
const dialogVisible2 = ref(false)
//注销函数
const userStore = useUserStore()
const quit = async () => {
  userStore.removeToken2()
  const res = await accountDelete(accountStore.id)
  accountStore.removeAll()
  console.log(res)
  closeConnection()
  // userStore.removeToken2()
  router.push('/account')
}
//登出函数
const logout = () => {
  chatStore.setChatId('')
  chatStore.setMyId('')
  userStore.removeToken2()
  accountStore.removeAll()
  closeConnection()
  router.push('/account')
}

//编辑个人信息
const editRef = ref()
const edit = () => {
  editRef.value.open(2)
  popoverRef.value.hide()
}

const popoverRef = ref(null)
//发消息
const sendMes = async () => {
  popoverRef.value.hide()

  // await showUpdate(chatStore.myId, true)
  chatStore.setChatId(chatStore.myId)
}
</script>

<template>
  <el-container>
    <el-aside>
      <el-menu :default-active="route.path" active-text-color="white" router collapse="true">
        <el-popover
          :show-arrow="false"
          placement="left-start"
          :width="400"
          trigger="click"
          offset="0"
          ref="popoverRef"
        >
          <template #reference>
            <el-menu-item>
              <div class="avatar">
                <el-avatar shape="square" :src="accountStore.avatar" />
              </div>
            </el-menu-item>
          </template>
          <div class="box">
            <person-info :flag="1"></person-info>
            <div class="bottom">
              <el-button class="btn edit" :icon="Edit" @click="edit">编辑资料</el-button>
              <el-button class="btn send" :icon="ChatDotRound" @click="sendMes">发消息</el-button>
            </div>
          </div>
        </el-popover>
        <edit-info ref="editRef" @alert="getInfo" v-if="isReady"></edit-info>
        <el-menu-item index="/chat">
          <el-icon size="40"><ChatDotRound /></el-icon>
        </el-menu-item>
        <el-menu-item index="/friends/1">
          <el-icon size="40"><User /></el-icon>
        </el-menu-item>
        <el-menu-item index="/friends/2">
          <el-icon size="40"><span class="iconfont icon-qunliao icon"></span></el-icon>
        </el-menu-item>
        <el-sub-menu :popper-offset="0" class="set">
          <template #title
            ><el-icon size="40"><Tools /></el-icon
          ></template>
          <el-menu-item @click="dialogVisible1 = true">注销账号</el-menu-item>
          <el-menu-item @click="dialogVisible2 = true">退出账号</el-menu-item>
        </el-sub-menu>
        <el-dialog v-model="dialogVisible1" title="确认注销" width="30%">
          <span>确认要注销账号吗</span>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogVisible1 = false">取消</el-button>
              <el-button type="primary" @click="quit"> 确认 </el-button>
            </span>
          </template>
        </el-dialog>
        <el-dialog v-model="dialogVisible2" title="确认退出" width="30%">
          <span>确认要退出账号吗</span>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogVisible2 = false">取消</el-button>
              <el-button type="primary" @click="logout"> 确认 </el-button>
            </span>
          </template>
        </el-dialog>
      </el-menu>
    </el-aside>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>
<style scoped>
.icon {
  font-size: 25px;
}

.avatar {
  display: flex;
  align-items: center;
}
.set {
  transform: translateY(600px);
}
.box {
  /* background-color: aqua; */
  /* width: 100px; */
  padding: 10px;
  color: black;
}
.el-main {
  padding: 0;
}
.el-aside {
  width: 64px;
  background-color: aqua;
  /* height: 100vh; */
}
.el-menu {
  height: 100vh;
  /* width: 81px; */
  padding: 30px 0;
  background-color: rgb(129, 198, 238);
}
.el-menu-item {
  margin: 0 auto;
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
}
.bottom {
  padding: 20px 0;
  text-align: center;
}
.btn {
  margin: 0 13px;
  width: 150px;
  height: 40px;
  font-size: 16px;
}
.send {
  background-color: skyblue;
  color: white;
}
.send:hover {
  background-color: rgb(105, 160, 182);
}
</style>
