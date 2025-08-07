<script setup>
import { ref, nextTick } from 'vue'
import { ArrowRight, Plus } from '@element-plus/icons-vue'
import { groupMembers, groupQuit, groupDissolve } from '@/api/group'
import { nicknameUpdate, friendDelete, pinUpdate } from '@/api/setting'
import emitter from '@/assets/eventBus'

const drawer = ref(false)
//删除联系人
const dialogVisible = ref(false)
const info = ref({})
const list = ref([])
const show = ref(false)
const remark = ref('点击添加备注')
const isPin = ref(false)
const open = async (value) => {
  if (value.nick_name !== ' ' && value.nick_name) {
    remark.value = value.nick_name
  } else {
    remark.value = '点击添加备注'
  }

  if (value.is_pin) {
    isPin.value = value.is_pin
  }
  info.value = value
  drawer.value = true
  if (value.relation_type === 'group') {
    const res = await groupMembers(info.value.relation_id)
    console.log(res)
    list.value = res.data.data.List
  }
}
defineExpose({ open })

//修改备注
const inpRef = ref()

const focus = () => {
  if (remark.value === '点击添加备注') {
    remark.value = ''
  }
  show.value = true
  nextTick(() => {
    inpRef.value.focus()
  })
}
const setRemark = () => {
  show.value = false
  nextTick(async () => {
    if (!remark.value) {
      await nicknameUpdate(info.value.relation_id, ' ')
      remark.value = '点击添加备注'
    } else {
      await nicknameUpdate(info.value.relation_id, remark.value)
    }
    if (info.value.relation_type === 'group') {
      const res = await groupMembers(info.value.relation_id)
      console.log(res)
      list.value = res.data.data.List
    }

    emitter.emit('updata', 1)
  })
}
//退出群聊或删除联系人
const quit = async () => {
  if (info.value.relation_type === 'friend') {
    const res = await friendDelete(info.value.relation_id)
    console.log(res)
  } else if (info.value.is_leader === true) {
    const res = await groupDissolve(info.value.relation_id)
    console.log(res)
  } else {
    const res = await groupQuit(info.value.relation_id)
    console.log(res)
  }
  dialogVisible.value = false
  emitter.emit('updata', 0)

  drawer.value = false
}
const editRef = ref(null)
//设置置顶
const setTop = async () => {
  await pinUpdate(info.value.relation_id, isPin.value)
  emitter.emit('updata', 1)
}
const groupRef = ref(null)
const panelRef = ref(null)
</script>

<template>
  <div>
    <el-drawer
      v-model="drawer"
      :with-header="false"
      size="400px"
      modal-class="modal"
      style="height: 875px; position: fixed; top: 70px; background-color: #eee"
    >
      <el-scrollbar>
        <div class="content">
          <div class="member" v-if="info.relation_type === 'group'">
            <info-panel ref="panelRef" @close="drawer = false"></info-panel>

            <header>
              <span>群聊成员</span>
            </header>
            <div class="mems">
              <div class="mem" v-for="item in list" :key="item.account_id">
                <el-avatar
                  shape="square"
                  :src="item.avatar"
                  class="av"
                  @click="panelRef.open($event, item.account_id, true)"
                />
                <div class="name">
                  {{ item.nickname !== ' ' && item.nickname ? item.nickname : item.name }}
                </div>
              </div>
              <div class="mem" @click="groupRef.open(2, info.relation_id, list)">
                <el-icon size="20" class="add"><Plus /></el-icon>
                <div class="name">邀请</div>
              </div>
            </div>
            <group-create ref="groupRef"></group-create>
          </div>

          <div v-if="info.relation_type === 'group' && info.group_info.description">
            <div class="tip">群公告</div>
            <div class="item">
              <span>{{ info.group_info.description }}</span>
            </div>
          </div>

          <div>
            <div class="tip" v-if="info.relation_type === 'group'">我的本群昵称</div>
            <div class="tip" v-else>备注</div>
            <div class="item nick" @click="focus">
              <span
                v-show="!show"
                ref="textRef"
                class="txt"
                :class="{ empty: remark === '点击添加备注' }"
                >{{ remark }}</span
              >
              <el-input
                ref="inpRef"
                class="inp"
                v-model="remark"
                v-show="show"
                @keyup.enter="setRemark"
              ></el-input>
            </div>
          </div>

          <div class="setting">
            <div class="item">
              <span>设为置顶</span>
              <el-switch v-model="isPin" @change="setTop" />
            </div>
            <div
              class="item"
              v-if="info.relation_type === 'group' && info.is_leader === true"
              @click="editRef.open(2, info.group_info)"
            >
              <span>修改群聊信息</span>
            </div>
            <edit-group ref="editRef" @close="drawer = false"></edit-group>

            <div class="item delete" @click="dialogVisible = true">
              <span v-if="info.relation_type === 'friend'">删除好友</span>
              <span v-else-if="info.is_leader === true">解散群聊</span>
              <span v-else>退出群聊</span>
            </div>
            <el-dialog v-model="dialogVisible" title="确认删除" width="30%">
              <span v-if="info.relation_type === 'friend'">确认要删除此联系人吗</span>
              <span v-else-if="info.is_leader === true">确认要解散群聊吗</span>
              <span v-else>确认要退出群聊吗</span>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="dialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="quit"> 确认 </el-button>
                </span>
              </template>
            </el-dialog>
          </div>
        </div>
      </el-scrollbar>
    </el-drawer>
  </div>
</template>

<style scoped>
.empty {
  color: grey;
}
.item {
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 20px;
  /* height: 40px; */
  border-radius: 10px;
  margin-bottom: 20px;
}
.nick {
  padding: 0;
  height: 40px;
}
.txt {
  margin-left: 20px;
  display: inline-block;
}
.inp {
  height: 40px;
}
.content {
  padding: 20px;
}
::v-deep .el-drawer__body {
  padding: 0;
}
/* 需要添加一个根节点 */
::v-deep .modal {
  background-color: transparent !important;
}
.add {
  background-color: #eee;
  width: 40px;
  height: 40px;
  border-radius: 4px;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.name {
  margin: 0 auto;
  font-size: 14px;

  width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.member {
  background-color: white;
  border-radius: 10px;
  padding: 10px 20px;
  margin-bottom: 20px;
}
.mems {
  max-height: 200px;
  /* background-color: aqua; */
  display: flex;
  gap: 5px;
  row-gap: 2px;
  flex-wrap: wrap;
  margin: 20px 0;
}

.mem {
  font-size: 0;
  /* background-color: pink; */
  width: 60px;
  text-align: center;
  padding: 5px 0;
  cursor: pointer;
}
.mem:hover {
  background-color: #eee;
}
.check {
  font-size: 14px;
  color: grey;
}

.tip {
  margin: 7px;
  color: grey;
}

hr {
  margin: 0 auto;
  width: 320px;
  background-color: rgb(236, 230, 230); /* 设置背景颜色 */
  border: 0;
  height: 1px;
}
.set {
  background-color: white;
  margin-bottom: 20px;
  border-radius: 10px;
}

.set .item {
  margin-bottom: 0;
}
.delete {
  justify-content: center;
  color: rgb(248, 84, 55);
}
</style>
