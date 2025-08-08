<script setup>
import { nextTick, ref } from 'vue'
import { Search, CircleCloseFilled } from '@element-plus/icons-vue'
import { friendList, searchFriend } from '@/api/setting'
import { groupInvite } from '@/api/group'
import { useAccountStore } from '@/stores'
import emitter from '@/assets/eventBus'
const emit = defineEmits(['close'])
const accountStore = useAccountStore()

const dialogVisible = ref(false)
const inpRef = ref(null)

//成员列表
const members = ref([])
//好友列表
const list = ref([])
const flag = ref(0)
const relation_id = ref('')
const existList = ref([])
const check = ref([])
const open = async (num, id, info) => {
  members.value = []
  check.value = []
  flag.value = num
  dialogVisible.value = true

  nextTick(() => {
    // 第二重延迟：确保对话框完全插入到 body 中
    setTimeout(() => {
      inpRef.value.focus()
    }, 100) // 可根据实际情况调整延迟时间
  })
  const res = await friendList()
  console.log(res)
  list.value = res.data.data.list
  if (num === 2) {
    relation_id.value = id
    existList.value = info
    list.value.forEach((item, index) => {
      if (isDisabled(item)) {
        check.value[index] = true
      }
    })
  }
}

defineExpose({ open })
const name = ref('')
//取消操作
const quit = () => {
  dialogVisible.value = false
}
//完成
const editRef = ref()
const accounts = ref([])
const finish = async () => {
  if (members.value.length > 0) {
    accounts.value = members.value.map((item) => item.friend_info.account_id)
    if (flag.value === 1) {
      editRef.value.open(1, accounts.value)
    } else {
      const res = await groupInvite(accounts.value, relation_id.value)
      console.log(res)
      dialogVisible.value = false
      emit('close')
      emitter.emit('updata', 1)
    }
  }
}

const change = (index, item) => {
  if (!isDisabled(item)) {
    check.value[index] = !check.value[index]
    // console.log(check.value[index])
    if (check.value[index] === true) {
      if (!members.value.includes(list.value[index])) {
        members.value.push(list.value[index])
      }
    } else {
      const pos = members.value.indexOf(list.value[index])
      members.value.splice(pos, 1)
    }
  }
}
const del = (item, index) => {
  const pos = list.value.indexOf(item)
  check.value[pos] = false

  members.value.splice(index, 1)
}
const isDisabled = (value) => {
  if (flag.value === 2) {
    return existList.value.some((item) => item.account_id === value.friend_info.account_id)
  }
  return false
}
//搜索好友
const oldList = ref('')
const search = async () => {
  if (name.value) {
    oldList.value = list.value
    const res = await searchFriend(name.value)
    console.log(res)
    list.value = res.data.data.list.filter(
      (item) => item.friend_info.account_id !== accountStore.id,
    )
  } else {
    console.log(oldList.value)
    list.value = oldList.value
  }
  if (flag.value === 2) {
    list.value.forEach((item, index) => {
      if (isDisabled(item)) {
        check.value[index] = true
      }
    })
  }
}
const recover = () => {
  if (!name.value) {
    search()
  }
}
</script>

<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      width="640px"
      draggable
      :show-close="false"
      :close-on-click-modal="false"
      :style="{ padding: '0' }"
    >
      <div class="container">
        <div class="left">
          <header>
            <el-input
              ref="inpRef"
              :prefix-icon="Search"
              placeholder="请输入关键字"
              v-model="name"
              @keyup.enter="search"
              clearable
              @change="recover"
            ></el-input>
          </header>

          <el-scrollbar class="friends">
            <div
              class="item"
              v-for="(item, index) in list"
              @click="change(index, item)"
              :key="item.relation_id"
            >
              <el-checkbox
                v-model="check[index]"
                size="large"
                style="pointer-events: none"
                :disabled="isDisabled(item)"
              />
              <el-avatar shape="square" :src="item.friend_info.avatar" />
              <div class="name1">{{ item.friend_info.name }}</div>
            </div>
          </el-scrollbar>
        </div>
        <div class="right">
          <header>
            <span> 选择联系人 </span>
            <span class="select">已选择{{ members.length }}个联系人</span>
          </header>

          <el-scrollbar class="list">
            <div class="member">
              <div class="mem" v-for="(item, index) in members" :key="item.relation_id">
                <el-avatar shape="square" :src="item.friend_info.avatar" />
                <div class="name2">{{ item.friend_info.name }}</div>
                <el-icon class="del" size="17" @click="del(item, index)"
                  ><CircleCloseFilled
                /></el-icon>
              </div>
            </div>
          </el-scrollbar>

          <div class="btm">
            <el-button @click="finish" class="finish">完成</el-button>
            <el-button @click="quit">取消</el-button>
          </div>
          <edit-group ref="editRef" @success="dialogVisible = false"></edit-group>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.name1 {
  max-width: 170px; /* 限制最大宽度，超过此宽度文本将换行 */
  word-wrap: break-word; /* 超过最大宽度时自动换行 */
  word-break: break-all; /* 使长单词也能断行 */
}
.name2 {
  max-width: 60px; /* 限制最大宽度，超过此宽度文本将换行 */
  word-wrap: break-word; /* 超过最大宽度时自动换行 */
  word-break: break-all; /* 使长单词也能断行 */
}
.list {
  height: 409px;
}
.el-input {
  width: 240px;
}
::v-deep .el-dialog__header {
  padding: 0;
}
.container {
  display: flex;
  color: black;
  /* height: 500px; */
  /* background-color: chartreuse; */
}
.left {
  padding-top: 20px;
  width: 320px;
  box-sizing: border-box;
  border-right: 1px solid #eee;
}
.left header {
  text-align: center;
}

.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 20px;
}
.item:hover {
  background-color: #eee;
}
::v-deep .el-checkbox__inner {
  border-radius: 50%;
}
.friends {
  margin: 10px 0;
  height: 450px;
}
.right {
  width: 320px;
  position: relative;
  padding: 15px 0;
  box-sizing: border-box;
}
.right header {
  font-size: 18px;
  padding: 0 19px;
  margin-bottom: 10px;
}
.btm {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 100%;
  text-align: center;
  padding: 15px 0;
}
.el-button {
  width: 90px;
  margin: 0 15px;
}
.finish {
  background-color: skyblue;
  color: white;
  border: 0;
}
.finish:hover {
  background-color: rgb(105, 160, 182);
}
.member {
  padding: 10px 0;

  margin: 0 auto;
  width: 240px;
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  row-gap: 10px;
}
.mem {
  position: relative;
  width: 60px;
  /* background-color: aqua; */
  text-align: center;
}
.select {
  font-size: 13px;
  color: grey;
  margin-left: 80px;
}
.del {
  position: absolute;
  top: -8px;
  right: 0;
  color: rgb(189, 184, 184);
}
.del:hover {
  cursor: pointer;
  color: grey;
}
</style>
