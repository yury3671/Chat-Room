<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import {
  Document,
  Clock,
  MoreFilled,
  ArrowRight,
  Filter,
  Top,
  Back,
  DeleteFilled,
  Hide,
  MuteNotification,
  Delete,
  ChatLineSquare,
  Close,
  CircleCloseFilled,
  DocumentAdd,
} from '@element-plus/icons-vue'

import V3Emoji from 'vue3-emoji'
import 'vue3-emoji/dist/style.css'
import { friendList, showList, searchFriend, pinUpdate, showUpdate, sendFile } from '@/api/setting'
import { groupMembers, groupSearch } from '@/api/group'
import { messageList, messageDelete, messageRevoke } from '@/api/message'
import emitter from '@/assets/eventBus'
import { useChatStore, useAccountStore } from '@/stores'
import { sendMessage, setMessageHandler, initWebsocket } from '@/utils/websocket'
initWebsocket()
const scrollRef = ref(null)
const chatStore = useChatStore()
const accountStore = useAccountStore()
const hisRef = ref(null)
const panelRef = ref(null)
let isLoad = false
//滚动到最底部

const scrollToBottom = () => {
  const scrollHeight = scrollRef.value.wrapRef.scrollHeight

  scrollRef.value.setScrollTop(scrollHeight)
  isLoad = true
}
//高亮下标
const activeId = ref(0)
const msg = ref('')
//表情包相关配置
const onVue3Emoje = (val) => {
  msg.value += val
}
const optionsName = {
  'Smileys & Emotion': '笑脸&表情',
  'Food & Drink': '食物&饮料',
  'Animals & Nature': '动物&自然',
  'Travel & Places': '旅行&地点',
  'People & Body': '人物&身体',
  Objects: '物品',
  Symbols: '符号',
  Flags: '旗帜',
  Activities: '活动',
}
//列表信息
const list = ref([])
//消息列表
const msgs = ref([])

//自动获焦
const inpRef = ref()
const getInfo = async () => {
  const res = await showList()
  console.log(res)
  list.value = res.data.data.list

  const myId = list.value.find((item) =>
    item.friend_info ? item.friend_info.account_id === accountStore.id : false,
  )?.relation_id
  if (myId) {
    chatStore.setMyId(myId)
  }

  list.value.sort((a, b) => {
    // 如果a是pin且b不是，则a排前面（返回-1）
    if (a.is_pin && !b.is_pin) return -1
    // 如果b是pin且a不是，则b排前面（返回1，即a排后面）
    if (!a.is_pin && b.is_pin) return 1
    // 两者is_pin相同，保持原顺序（返回0）
    return 0
  })
}
//刷新消息
let page = 1

let total = 0
const getMes = async () => {
  const date = Date.now()
  const res = await messageList(chatStore.chatId, date, page, 30)
  console.log(res)
  total = res.data.data.total
  msgs.value.unshift(...res.data.data.list.reverse())
  page += 1
  // scrollToBottom()
}
//切换对话时

const info = ref({})
const title = ref('')
const pageRef = ref(null)
const change = async () => {
  let id = chatStore.chatId
  msgs.value = []
  page = 1
  total = 0
  isLoad = false
  if (search.value === 2) {
    pageRef.value.clear()
    list1.value = []

    list.value = oldList.value
    search.value = 1
  }
  const target = list.value.find((item) => item.relation_id === chatStore.chatId)
  if (target) {
    target.msgNum = 0
  }
  if (!list.value.some((item) => item.relation_id === id)) {
    await showUpdate(id, true)
    await getInfo()
  }
  info.value = list.value.find((item) => item.relation_id === id)

  if (info.value.relation_type === 'friend') {
    if (info.value.nick_name !== ' ' && info.value.nick_name) {
      title.value = info.value.nick_name
    } else {
      title.value = info.value.friend_info.name
    }
  } else {
    const res = await groupMembers(info.value.relation_id)
    // console.log(res)
    title.value = info.value.group_info.name + `(${res.data.data.Total})`
  }

  await getMes()
  await nextTick()
  scrollToBottom()
  msg.value = ''
  inpRef.value.focus()
}

//监听滚动到顶部
let scrollTimer = null
const handleScroll = async () => {
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(async () => {
    const scrollHeight = scrollRef.value.wrapRef.scrollHeight
    const scrollTop = scrollRef.value.wrapRef.scrollTop
    const clientHeight = scrollRef.value.wrapRef.clientHeight

    // 距离顶部小于50px时触发加载
    if (scrollTop < 30 && scrollHeight > clientHeight && isLoad && page <= total) {
      await getMes()
      scrollRef.value.setScrollTop(30)
    }
  }, 200)
}
//搜索好友
const search = ref(1)
const word = ref('')
const oldList = ref('')
const list1 = ref([])
const searchAll = async (name) => {
  if (name) {
    oldList.value = list.value
    word.value = name
    console.log(name)
    const res = await searchFriend(name)
    const res1 = await groupSearch(name)
    console.log(res1)
    search.value = 2
    list.value = res.data.data.list
    list1.value = res1.data.data.List
  } else {
    list1.value = []
    list.value = oldList.value
    search.value = 1
  }
}

onMounted(async () => {
  await getInfo()
  // scrollToBottom()
  if (chatStore.chatId) {
    change()
  }
})
watch(
  () => chatStore.chatId,
  async () => {
    if (chatStore.chatId) {
      change()
    }
  },
)
emitter.on('updata', async (num) => {
  if (!num) {
    chatStore.setChatId('')
  }
  list.value = []
  await getInfo()
  if (chatStore.chatId) {
    change()
  }
})

const setRef = ref()
//消息菜单显示

//显示全网搜索
const searchRef = ref()

const popoverVisible = ref(false)
const clickX = ref(0)
const clickY = ref(0)

const isTop = ref(true)
const isBack = ref(false)
//菜单显示
const flag = ref(0)
const rlyMsg = ref({})
const handleMenu = (e, num, data, isPin) => {
  flag.value = num

  if (num === 1) {
    if (search.value === 1) {
      activeId.value = data
      if (isPin === true) {
        isTop.value = false
      } else {
        isTop.value = true
      }

      // 获取点击位置相对于视口的坐标（clientX/clientY）
      clickX.value = e.clientX + 140 > window.innerWidth ? e.clientX - 140 : e.clientX
      clickY.value = e.clientY + 60 > window.innerHeight ? e.clientY - 60 : e.clientY
      // 显示弹窗
      popoverVisible.value = true
    }
  } else {
    rlyMsg.value = data

    activeId.value = data.id
    if (data.account_id === accountStore.id) {
      const time = new Date(data.create_at)
      const now = new Date()
      if (now - time < 2 * 60 * 1000) {
        isBack.value = true
      }
    } else {
      isBack.value = false
    }
    // 获取点击位置相对于视口的坐标（clientX/clientY）
    clickX.value = e.clientX + 140 > window.innerWidth ? e.clientX - 140 : e.clientX
    clickY.value = e.clientY + 60 > window.innerHeight ? e.clientY - 60 : e.clientY
    // 显示弹窗
    popoverVisible.value = true
  }
}
//设置置顶
const setTop = async () => {
  await pinUpdate(activeId.value, isTop.value)
  // console.log(res)
  popoverVisible.value = false

  getInfo()
}
//删除聊天
const hideChat = async () => {
  const res = await showUpdate(activeId.value, false)
  console.log(res)
  if (chatStore.chatId === activeId.value) {
    chatStore.setChatId('')
  }
  popoverVisible.value = false
  getInfo()
}
//删除消息
const delMes = async () => {
  await messageDelete(activeId.value)
  const index = msgs.value.findIndex((item) => item.id === activeId.value)
  if (index === msgs.value.length - 1) {
    const target = list.value.find((item) => item.relation_id === chatStore.chatId)
    target.newMsg = msgs.value[index - 1]
  }
  msgs.value.splice(index, 1)

  popoverVisible.value = false
}
//撤回消息
const backMes = async () => {
  await messageRevoke(activeId.value)

  popoverVisible.value = false
}
const handelPanel = (e, id, dir) => {
  panelRef.value.open(e, id, dir)
}
//引用消息
const replyId = ref(0)
const replyMsg = () => {
  replyId.value = activeId.value
  popoverVisible.value = false
}
// 汉字 → Base64 编码（UTF-8 格式）
const encodeBase64 = (str) => {
  // 浏览器环境：使用 btoa + encodeURIComponent（处理 UTF-8 字符）
  return btoa(unescape(encodeURIComponent(str)))
}

//处理消息
let target = null
setMessageHandler(async (data) => {
  console.log('处理收到的消息', data)
  target = list.value.find((item) => item.relation_id === data.relation_id)
  if (!target) {
    await showUpdate(data.relation_id, true)
    await getInfo()
    target = list.value.find((item) => item.relation_id === data.relation_id)
  }
  target.newMsg = data
  if (data.msg_type === 'revoke') {
    if (data.relation_id === chatStore.chatId) {
      console.log(112333)
      const index = msgs.value.findIndex((item) => item.id === data.msg_id)
      msgs.value[index].is_revoke = true
    }
  } else {
    if (data.relation_id === chatStore.chatId) {
      msgs.value.push(data)
      await nextTick()
      scrollToBottom()
    } else {
      if (target.msgNum) {
        target.msgNum += 1
      } else {
        target.msgNum = 1
      }
      if (target.is_pin) {
        const index = list.value.findIndex((item) => item.relation_id === data.relation_id) // 找到元素索引
        list.value.splice(index, 1) // 从原数组删除该元素（返回被删除的元素）
        list.value.unshift(target) // 插入到数组头部
      } else {
        const index = list.value.findIndex((item) => item.relation_id === data.relation_id) // 找到元素索引
        list.value.splice(index, 1) // 从原数组删除该元素（返回被删除的元素）
        const insertIndex = list.value.findLastIndex((item) => item.is_pin === true)
        list.value.splice(insertIndex, 0, target) // 从原数组删除该元素（返回被删除的元素）
      }
    }
  }
})
//发送消息
const file = ref(null)
const imageUrl = ref('')
const isSend = ref(false)
const sendMes = async () => {
  if (file.value && !isSend.value) {
    isSend.value = true
    const res = await sendFile(chatStore.chatId, file.value)
    console.log(res)
    file.value = ''
    isSend.value = false
  }
  //去除左右空格和换行符
  console.log(msg.value)
  msg.value = msg.value.trim().replace(/^[\s\n\r]+|[\s\n\r]+$/g, '')
  if (msg.value) {
    const base64Content = encodeBase64(msg.value)
    const data = {
      relation_id: chatStore.chatId,
      msg_content: base64Content,
      msg_extend: null,
      rly_msg_id: replyId.value,
    }
    console.log(data)
    sendMessage(data, (success) => {
      if (success) {
        console.log('发送消息成功')
      } else {
        console.log('发送消息失败或超时')
      }
    })
    replyId.value = 0
    msg.value = ''
    console.log(msg.value.length)
    inpRef.value.focus()
  }
}
//发送文件消息

const selectFile = async (uploadFile) => {
  //只触发一次状态改变
  if (uploadFile.status !== 'ready') return
  console.log(uploadFile)
  file.value = uploadFile.raw
  if (uploadFile.raw.type.includes('image')) {
    imageUrl.value = URL.createObjectURL(uploadFile.raw)
  } else {
    const fullName = uploadFile.raw.name
    const lastDotIndex = fullName.lastIndexOf('.')
    file.value.fileName = fullName.substring(0, lastDotIndex) // 从开头到最后一个 "." 前
    file.value.ext = fullName.substring(lastDotIndex + 1) // 从最后一个 "." 后到结尾
    //计算size
    const size = uploadFile.raw.size
    if (size < 1024 * 1024) {
      file.value.fileSize = (size / 1024).toFixed(1).toString() + 'K'
    } else if (size < 1024 * 1024 * 1024) {
      file.value.fileSize = (size / (1024 * 1024)).toFixed(1).toString() + 'M'
    } else {
      file.value.fileSize = (size / (1024 * 1024 * 1024)).toFixed(1).toString() + 'G'
    }
  }
}
//跳转
const msgRef = ref({})

let targetEl
const jumpMsg = async (id) => {
  targetEl = msgRef.value[id]?.$el
  // index = msgs.value.findIndex((item) => item.id === id && !item.is_revoke)
  while (page <= total) {
    if (targetEl) {
      break
    } else {
      await getMes()
      await nextTick()
    }
    targetEl = msgRef.value[id]?.$el
    // index = msgs.value.findIndex((item) => item.id === id && !item.is_revoke)
  }
  if (targetEl) {
    targetEl.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  } else {
    ElMessage.error('消息不存在')
  }
}
const chatsRef = ref([])
const clickList = async (id) => {
  chatStore.setChatId(id)
  if (search.value === 2) {
    pageRef.value.clear()
    list1.value = []
    list.value = oldList.value
    search.value = 1
    await nextTick()
    const index = list.value.findIndex((item) => item.relation_id === chatStore.chatId)
    chatsRef.value[index].$el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }
}
//处理回车
const handleEnter = (event) => {
  if (!event.shiftKey) {
    sendMes()
    event.preventDefault()
  }
}
</script>

<template>
  <!-- pinia组件自动注册 -->
  <page-container @search="searchAll" ref="pageRef">
    <template #left>
      <el-popover
        v-model:visible="popoverVisible"
        width="140"
        placement="right"
        trigger="contextmenu"
        :show-arrow="false"
        :popper-style="{
          minWidth: '0px',
          padding: 0,
          border: 0,
          position: 'absolute',
          top: `${clickY}px`,
          left: `${clickX}px`,
        }"
      >
        <div class="menu" v-if="flag === 1">
          <div class="opt" @click="setTop">
            <el-icon><Top /></el-icon>
            <span v-if="isTop">置顶</span>
            <span v-else>取消置顶</span>
          </div>

          <div class="opt" @click="hideChat">
            <el-icon><Hide /></el-icon>
            <span>不显示聊天</span>
          </div>
        </div>
        <div class="menu" v-else>
          <div class="opt" @click="replyMsg">
            <el-icon><ChatLineSquare /></el-icon>
            <span>引用</span>
          </div>

          <div class="opt" v-if="isBack" @click="backMes">
            <el-icon><Back /></el-icon>
            <span>撤回</span>
          </div>

          <div class="opt" @click="delMes">
            <el-icon><Delete /></el-icon>
            <span>删除</span>
          </div>
        </div>
      </el-popover>
      <div class="box">
        <el-scrollbar>
          <div class="title" v-show="search === 2 && list">联系人</div>
          <friends-list
            ref="chatsRef"
            v-for="value in list"
            :key="value.relation_id"
            :act="
              search === 1
                ? value.is_pin === true
                  ? true
                  : chatStore.chatId === value.relation_id
                : false
            "
            :msg="value.relation_type === 'friend' ? 1 : 4"
            :info="value"
            @click="clickList(value.relation_id)"
            @contextmenu.prevent="handleMenu($event, 1, value.relation_id, value.is_pin)"
          ></friends-list>
          <div class="title" v-show="search === 2 && list1.length">群聊</div>

          <friends-list
            v-show="search === 2"
            v-for="value in list1"
            :key="value.relation_id"
            :act="
              search === 1
                ? value.is_pin === true
                  ? true
                  : chatStore.chatId === value.relation_id
                : false
            "
            :msg="value.relation_type === 'friend' ? 2 : 3"
            :info="value"
            @click="clickList(value.relation_id)"
            @contextmenu.prevent="handleMenu($event, 1, value.relation_id, value.is_pin)"
          ></friends-list>
          <div class="apply" @click="searchRef.open(word)" v-show="search === 2">
            <span>全网搜索</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
          <search-name ref="searchRef"></search-name>
        </el-scrollbar>
      </div>
    </template>
    <template #right>
      <div v-show="chatStore.chatId !== ''">
        <div class="head">
          <div class="name">{{ title }}</div>
          <div>
            <el-icon class="extra" @click="setRef.open(info)"><MoreFilled /></el-icon>
          </div>
        </div>
        <msg-setting ref="setRef"></msg-setting>
        <info-panel ref="panelRef"></info-panel>
        <el-scrollbar ref="scrollRef" height="627" @scroll="handleScroll">
          <one-msg
            :ref="
              (el) => {
                if (el && !item.is_revoke) msgRef[item.id] = el
              }
            "
            v-for="item in msgs"
            :key="item.id"
            :info="item"
            @showMenu="handleMenu"
            @showPanel="handelPanel"
            @jump="jumpMsg"
          ></one-msg>
        </el-scrollbar>

        <div class="bottom">
          <div class="top">
            <div>
              <V3Emoji @click-emoji="onVue3Emoje" :recent="true" :options-name="optionsName"
                ><span class="iconfont icon-biaoqing icon"></span>
              </V3Emoji>
            </div>
            <el-upload :show-file-list="false" :auto-upload="false" :on-change="selectFile">
              <el-icon size="30"><DocumentAdd /></el-icon>
            </el-upload>

            <el-icon size="30" @click="hisRef.open(title, chatStore.chatId)"><Clock /></el-icon>
          </div>
          <history-mes ref="hisRef" @jump="jumpMsg"></history-mes>
          <div class="reply" v-if="replyId">
            <div class="rly">
              {{
                rlyMsg.nick_name && rlyMsg.nick_name !== ' '
                  ? rlyMsg.nick_name
                  : rlyMsg.account_name
              }}:
              {{
                rlyMsg.msg_type === 'text'
                  ? rlyMsg.msg_content
                  : rlyMsg.file_name.substring(rlyMsg.file_name.lastIndexOf('.') + 1) === 'png' ||
                      rlyMsg.file_name.substring(rlyMsg.file_name.lastIndexOf('.') + 1) === 'jpg'
                    ? '[图片]'
                    : '[文件]'
              }}
            </div>
            <el-icon @click="replyId = 0"><Close /></el-icon>
          </div>
          <div style="display: flex; align-items: center">
            <div class="img" v-if="file">
              <el-image
                :style="{
                  width: replyId ? `115px` : `136px`,
                  height: replyId ? `115px` : `136px`,
                  marginRight: '10px',
                }"
                v-if="file.type.includes('image')"
                :src="imageUrl"
                fit="cover"
              />
              <div
                class="file"
                :style="{
                  width: replyId ? `115px` : `136px`,
                  height: replyId ? `115px` : `136px`,
                  marginRight: '10px',
                }"
                v-else
              >
                <el-icon :size="replyId ? 70 : 80" color="grey"><Document /></el-icon>
                <div>
                  <span class="fileName">{{ file.fileName }}</span
                  >.{{ file.ext }}
                </div>
                <div style="color: grey; font-size: 13px">
                  {{ file.fileSize }}
                </div>
              </div>

              <el-icon class="del" size="15" @click="file = null"><Close /></el-icon>
            </div>

            <el-input
              ref="inpRef"
              v-model="msg"
              :rows="replyId ? 5 : 6"
              type="textarea"
              class="text"
              @keydown.enter="handleEnter"
            />
          </div>

          <div class="bot">
            <el-button
              :class="{
                send: msg.trim().replace(/^[\s\n\r]+|[\s\n\r]+$/g, '') || file,
              }"
              class="empty"
              @click="sendMes"
              >发送(S)</el-button
            >
          </div>
        </div>
      </div>
    </template>
  </page-container>
</template>

<style scoped>
.fileName {
  display: inline-block;

  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file {
  font-size: 15px;
  line-height: 17px;
  background-color: white;
  text-align: center;
  padding: 7px 0;
  box-sizing: border-box;
}
.del {
  padding: 2px;
  position: absolute;
  top: -7px;
  right: 2px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  z-index: 10;
  color: white;
  cursor: pointer;
}
.img {
  line-height: 0;
  position: relative;
}
.reply {
  border-radius: 5px;
  padding: 5px 10px;
  color: grey;
  background-color: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  /* display: none; */
}
.rly {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.title {
  padding: 5px 15px;
  color: grey;
  font-size: 14px;
}
.opt {
  text-align: center;
  line-height: 30px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 7px;
}
.opt:hover {
  background-color: rgba(128, 128, 128, 0.1);
  cursor: pointer;
}
.apply {
  height: 40px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.apply:hover {
  background-color: #eee;
}
.box {
  height: 862px;
}
.head {
  /* position: fixed; */
  /* top: 0px; */
  display: flex;
  justify-content: space-between;
  font-size: 26px;
  height: 70px;
  line-height: 70px;
  padding: 0 30px;
  border-bottom: 1px solid #e6dddd;
  position: relative;
  overflow: hidden;
}
.extra:hover {
  cursor: pointer;
  color: grey;
}

.el-aside {
  height: 100vh;
}
header {
  padding-bottom: 15px;
  padding-top: 30px;
  display: flex;
  justify-content: space-evenly;
}
.el-input {
  width: 200px;
}

.bottom {
  box-sizing: border-box;
  /* position: fixed; */
  /* bottom: 0; */
  /* width: 1539px; */
  /* background-color: aqua; */
  border-top: 1px solid #e6dddd;
  padding: 5px 25px;
}
.icon {
  font-size: 28px;
}
.top {
  /* background-color: antiquewhite; */
  height: 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
}
.bot {
  margin-top: 5px;
  display: flex;
  justify-content: flex-end;
}
.text {
  border: 0;
  background-color: pink;
}
.empty {
  background-color: #eee;
  color: grey;
}
.send {
  background-color: skyblue;
  color: white;
}
.send:hover {
  background-color: rgb(105, 160, 182);
}
</style>
