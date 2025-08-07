<script setup>
import { ref, watch } from 'vue'
import { messageList } from '@/api/message'
import { useAccountStore } from '@/stores'

const userAccount = useAccountStore()

//确定是否选中
const props = defineProps({
  act: Boolean,
  msg: Number,
  info: Object,
})
const name = ref('')
const avatar = ref('')
const message = ref('')
const time = ref('')
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
const initMes = (list) => {
  if (list.create_at) {
    time.value = getTime(list.create_at)
  }

  if (list.is_revoke || list.msg_type === 'revoke') {
    if (userAccount.id === list.account_id) {
      message.value = '你撤回了一条消息'
    } else {
      message.value =
        list.nick_name && list.nick_name !== ' '
          ? `"${list.nick_name}"撤回了一条消息`
          : `"${list.account_name}"撤回了一条消息`
    }
  } else {
    if (props.msg === 1) {
      message.value =
        list.msg_type === 'text'
          ? list.msg_content
          : list.file_name.substring(list.file_name.lastIndexOf('.') + 1) === 'png' ||
              list.file_name.substring(list.file_name.lastIndexOf('.') + 1) === 'jpg'
            ? '[图片]'
            : '[文件]'
    } else {
      if (userAccount.id === list.account_id) {
        message.value =
          list.msg_type === 'text'
            ? list.msg_content
            : list.file_name.substring(list.file_name.lastIndexOf('.') + 1) === 'png' ||
                list.file_name.substring(list.file_name.lastIndexOf('.') + 1) === 'jpg'
              ? '[图片]'
              : '[文件]'
      } else {
        message.value =
          list.nick_name && list.nick_name !== ' '
            ? `${list.nick_name}: ${
                list.msg_type === 'text'
                  ? list.msg_content
                  : list.file_name.substring(list.file_name.lastIndexOf('.') + 1) === 'png' ||
                      list.file_name.substring(list.file_name.lastIndexOf('.') + 1) === 'jpg'
                    ? '[图片]'
                    : '[文件]'
              }`
            : `${list.account_name}: ${
                list.msg_type === 'text'
                  ? list.msg_content
                  : list.file_name.substring(list.file_name.lastIndexOf('.') + 1) === 'png' ||
                      list.file_name.substring(list.file_name.lastIndexOf('.') + 1) === 'jpg'
                    ? '[图片]'
                    : '[文件]'
              }`
      }
    }
  }
}
const getMes = async () => {
  const res = await messageList(props.info.relation_id, Date.now(), 1, 2)

  if (res.data.data.list.length) {
    initMes(res.data.data.list[0])
  }
}
if (props.msg === 1 || props.msg === 2) {
  if (props.info.nick_name !== ' ' && props.info.nick_name) {
    name.value = props.info.nick_name
  } else {
    name.value = props.info.friend_info.name
  }
  avatar.value = props.info.friend_info.avatar
} else {
  name.value = props.info.group_info.name
  avatar.value = props.info.group_info.avatar
}
if (props.msg === 1 || props.msg === 4) {
  getMes()
}
watch(
  () => props.info.newMsg,
  () => {
    if (props.info.newMsg) {
      initMes(props.info.newMsg)
    }
  },
  {
    deep: true, // 深度监听：监听对象/数组内部属性变化
  },
)
</script>

<template>
  <div class="msg" :class="{ active: props.act }">
    <div class="left">
      <el-badge
        :value="props.info.msgNum"
        :hidden="!((props.msg === 1 || props.msg === 4) && props.info.msgNum)"
      >
        <el-avatar shape="square" :src="avatar" />
      </el-badge>
    </div>
    <div class="right">
      <div class="head">
        <div class="name">{{ name }}</div>
        <div class="time" v-if="props.msg === 1 || props.msg === 4">
          {{ time }}
        </div>
      </div>
      <div class="chat" v-if="props.msg === 1 || props.msg === 4">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<style scoped>
::v-deep .el-badge__content {
  width: 15px;
  height: 14px;
  line-height: 14px;

  padding: 0;
  padding-bottom: 1px;
}
.msg {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  display: flex;

  align-items: center;
  cursor: pointer;
}
.msg:hover {
  background-color: #eee;
}
.left {
  width: 20%;
  line-height: 0;
  display: flex;
  align-items: center;
}
.right {
  width: 80%;
}
.head {
  display: flex;
  justify-content: space-between;
}
.time {
  font-size: 13px;
  color: grey;
}
.chat {
  font-size: 12px;
  color: grey;
  /* background-color: aqua; */
  overflow: hidden;
  /* 超出部分显示省略号 */
  text-overflow: ellipsis;
  white-space: nowrap;
}
.active {
  background-color: #eee;
}
</style>
