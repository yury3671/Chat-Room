<script setup>
import { ref } from 'vue'
import { Female, Male, CirclePlusFilled, MoreFilled } from '@element-plus/icons-vue'
import { accountGet, tokenGet } from '@/api/account'
import { userDelete } from '@/api/user'
import { useUserStore, useAccountStore } from '@/stores'
import { useRouter } from 'vue-router'

//存储所有账号数组
const list = ref([])
//获取用户所有账户信息
const userStore = useUserStore()
const accountStore = useAccountStore()
const getAccount = async () => {
  userStore.removeToken2()
  accountStore.removeAll()

  const res = await accountGet()
  console.log(res)
  list.value = res.data.data.list
}
getAccount()

//新建账号
const editRef = ref()
const edit = () => {
  editRef.value.open(1)
}
//登录账号
const router = useRouter()

const login = async (id) => {
  console.log(id)
  const res = await tokenGet(id)
  console.log(res)
  userStore.setToken2(res.data.data.account_token.token)
  accountStore.setId(id)
  router.push('/')
}
const dialogVisible1 = ref(false)
const dialogVisible2 = ref(false)
//修改邮箱
const emailRef = ref()
const editEmail = () => {
  emailRef.value.open()
}
//修改密码
const passwordRef = ref()
const editPassword = () => {
  passwordRef.value.open()
}
//删除用户
const quit = async () => {
  userStore.removeToken1()
  await userDelete()
  ElMessage.success('注销成功')
  router.push('/login')
}
//退出用户
const del = async () => {
  userStore.removeToken1()
  router.push('/login')
}
</script>

<template>
  <div class="container">
    <div class="box">
      <header>
        <div>账号管理</div>
        <el-popover
          placement="right-start"
          :width="100"
          trigger="click"
          :show-arrow="false"
          popper-style="padding:0;background-color: rgba(255, 255, 255, 0.5);border:0;"
        >
          <template #reference>
            <el-icon class="more"><MoreFilled /></el-icon>
          </template>
          <div class="menu">
            <div class="opt" @click="editEmail">修改邮箱</div>
            <div class="opt" @click="editPassword">修改密码</div>
            <div class="opt" @click="dialogVisible1 = true">注销用户</div>
            <div class="opt" @click="dialogVisible2 = true">退出登录</div>
          </div>
          <alter-email ref="emailRef"></alter-email>
          <alter-password ref="passwordRef"></alter-password>
          <el-dialog v-model="dialogVisible1" title="确认注销" width="30%">
            <span>确认要注销用户吗</span>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="dialogVisible1 = false">取消</el-button>
                <el-button type="primary" @click="quit"> 确认 </el-button>
              </span>
            </template>
          </el-dialog>
          <el-dialog v-model="dialogVisible2" title="确认退出" width="30%">
            <span>确认要退出用户吗</span>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="dialogVisible2 = false">取消</el-button>
                <el-button type="primary" @click="del"> 确认 </el-button>
              </span>
            </template>
          </el-dialog>
        </el-popover>
      </header>
      <div class="content">
        <div class="item" v-for="item in list" :key="item.id" @click="login(item.id)">
          <div class="it">
            <el-avatar shape="square" :src="item.avatar" />
            <div class="name">{{ item.name }}</div>
            <el-icon size="17" color="#fb7373" v-if="item.gender === '女'"><Female /></el-icon>
            <el-icon size="17" color="#10aeff" v-if="item.gender === '男'"><Male /></el-icon>
          </div>
        </div>
        <div class="item" @click="edit">
          <div class="it add">
            <el-icon size="30" color="skyblue"><CirclePlusFilled /></el-icon>
            <div>添加账号</div>
          </div>
        </div>
        <edit-info ref="editRef" @create="getAccount()"> </edit-info>
      </div>
    </div>
  </div>
</template>

<style scoped>
.opt {
  text-align: center;
  line-height: 30px;
}
.opt:hover {
  background-color: rgba(128, 128, 128, 0.1);
  cursor: pointer;
}
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

.box {
  width: 370px;
  margin: 200px auto;
}
.content {
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 7px;
  cursor: pointer;
}
header {
  font-size: 27px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.item {
  padding: 0 10px;
}
.it {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
  margin: 0 10px;
}

.item:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.add {
  justify-content: center;
  border: 0;
}
.more:hover {
  color: grey;
  cursor: pointer;
}
</style>
