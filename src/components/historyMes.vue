<script setup>
import { nextTick, ref } from 'vue'
import { messageList, messageSearch } from '@/api/message'
import { Close, Document, ChatSquare } from '@element-plus/icons-vue'
import { infoGet } from '@/api/account'

import { useAccountStore } from '@/stores'
const userAccount = useAccountStore()
const emit = defineEmits(['jump'])
const scrollRef = ref(null)
//滚动到最底部
const scrollToBottom = () => {
  const scrollHeight = scrollRef.value.wrapRef.scrollHeight

  scrollRef.value.setScrollTop(scrollHeight)
}
const inpRef = ref(null)
const dialogVisible = ref(false)
const name = ref('')
const list = ref([])
const relation_id = ref('')
let page = 1
let total = 0
let isSearch = false
let res = null
//计算时间
const getTime = (time) => {
  const date = new Date(time)
  const month = (date.getMonth() + 1).toString()
  const day = date.getDate().toString()
  const nowDate = new Date()
  const nowMonth = (nowDate.getMonth() + 1).toString()
  const nowDay = nowDate.getDate().toString()
  if (month === nowMonth && day === nowDay) {
    return time.slice(11, 16)
  } else if (month === nowMonth && +day === +nowDay - 1) {
    return '昨天'
  } else {
    return time.slice(5, 10)
  }
}
const content = ref('')
const getMes = async () => {
  if (isSearch) {
    res = await messageSearch(relation_id.value, content.value, page, 30)
    console.log(res)
  } else {
    const date = Date.now()
    res = await messageList(relation_id.value, date, page, 30)
    console.log(res)
  }

  list.value.unshift(...res.data.data.list.filter((item) => item.is_revoke === undefined).reverse())
  total = res.data.data.total
  page += 1
}
const open = async (title, id) => {
  content.value = ''
  isSearch = false
  page = 1
  total = 0
  list.value = []
  console.log(id)
  relation_id.value = id
  name.value = title
  dialogVisible.value = true
  await getMes()
  inpRef.value.focus()
  await nextTick()
  scrollToBottom()
}

const oldList = ref([])
let oldTotal = 0
let oldPage = 0
defineExpose({ open })

const search = async () => {
  if (content.value) {
    isSearch = true
    oldList.value = list.value
    oldPage = page
    oldTotal = total
    list.value = []
    page = 1
    await getMes()
    await nextTick()
    scrollToBottom()
  } else {
    isSearch = false
    page = oldPage
    total = oldTotal
    list.value = oldList.value
  }
}
const recover = () => {
  if (!content.value) {
    search()
  }
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
    if (scrollTop < 30 && scrollHeight > clientHeight && page <= total) {
      await getMes()
      scrollRef.value.setScrollTop(30)
    }
  }, 200)
}
const fileSize = (size) => {
  if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1).toString() + 'K'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(1).toString() + 'M'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(1).toString() + 'G'
  }
}
const fileName = (fullName, num) => {
  const lastDotIndex = fullName.lastIndexOf('.')
  if (num === 1) {
    return fullName.substring(0, lastDotIndex)
  } else {
    return fullName.substring(lastDotIndex + 1)
  }
}
const openFile = (url) => {
  window.open(url, '_blank')
}
const posMsg = (id) => {
  dialogVisible.value = false
  emit('jump', id)
}
</script>

<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      width="30%"
      :modal="false"
      draggable="true"
      :show-close="false"
      style="padding: 0"
      :header-class="head"
    >
      <header>
        <div class="head">
          <span>{{ name }}</span
          ><el-icon @click="dialogVisible = false"><Close /></el-icon>
        </div>
        <div style="text-align: center; padding: 10px 0">
          <el-input
            v-model="content"
            ref="inpRef"
            :prefix-icon="Search"
            placeholder="请输入关键字"
            clearable
            @keyup.enter="search"
            @change="recover"
            class="inp"
          ></el-input>
        </div>
      </header>
      <el-scrollbar height="550" ref="scrollRef" @scroll="handleScroll">
        <div class="mes" v-for="item in list" :key="item.id">
          <el-avatar shape="square" :src="item.account_avatar" />
          <div class="box">
            <div class="title">
              <span>{{
                item.account_id === userAccount.id
                  ? userAccount.name
                  : item.nick_name && item.nick_name !== ' '
                    ? item.nick_name
                    : item.account_name
              }}</span>
              <span>{{ getTime(item.create_at) }}</span>
            </div>
            <div class="content">
              <div v-if="item.msg_type === 'text'">
                {{ item.msg_content }}
              </div>
              <img
                class="img"
                :src="item.msg_content"
                alt=""
                v-else-if="
                  fileName(item.file_name, 2) === 'png' || fileName(item.file_name, 2) === 'jpg'
                "
              />
              <div
                class="file"
                :style="{
                  width: `140px`,
                  height: `140px`,
                }"
                @click="openFile(item.msg_content)"
                v-else
              >
                <el-icon :size="80" color="grey"><Document /></el-icon>
                <div>
                  <span class="fileName">{{ fileName(item.file_name, 1) }}</span
                  >.{{ fileName(item.file_name, 2) }}
                </div>
                <div style="color: grey; font-size: 13px">
                  {{ fileSize(item.file_size) }}
                </div>
              </div>
              <el-icon size="20" class="chat" @click="posMsg(item.id)"><ChatSquare /></el-icon>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<style scoped>
.chat {
  visibility: hidden;
}
.mes:hover .chat {
  visibility: visible;
}
.content {
  /* background-color: aqua; */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
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
  background-color: #eee;
  text-align: center;
  padding: 7px 0;
  box-sizing: border-box;
}
.img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 5px;
}
::v-deep .el-dialog__header {
  display: none;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
}
.inp {
  width: 90%;
}
.mes {
  padding: 20px;

  display: flex;

  gap: 10px;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}
.box {
  width: 490px;
  /* background-color: aqua; */
}
.title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
</style>
