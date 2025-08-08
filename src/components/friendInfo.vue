<script setup>
import { ref, nextTick, inject, onMounted, watch } from 'vue'
import { MoreFilled, ChatDotRound, Delete } from '@element-plus/icons-vue'
import { nicknameUpdate, showUpdate } from '@/api/setting'
import { useChatStore } from '@/stores'
import { useRouter } from 'vue-router'
const router = useRouter()
const chatStore = useChatStore()
const props = defineProps({
  sign: String,
  flag: Number,
  id: String,
  nick: String,
})
//备注框显示
const inpRef = ref()
const textRef = ref()
const show = ref(false)
const emit = defineEmits(['updata'])

const remark = props.nick !== ' ' && props.nick ? ref(props.nick) : ref('点击添加备注')
watch(
  () => props.nick,
  (newNick) => {
    remark.value = newNick != ' ' && newNick ? newNick : '点击添加备注'
  },
)
// const nickName = ref('')
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
      await nicknameUpdate(props.id, ' ')
      remark.value = '点击添加备注'
    } else {
      await nicknameUpdate(props.id, remark.value)
    }
    emit('updata')
  })
}

//发消息
const sendMes = async () => {
  chatStore.setChatId(props.id)
  router.push('/')
}
</script>

<template>
  <div class="box">
    <person-info :flag="props.flag === 1 ? 1 : 2"></person-info>

    <div class="remark">
      <span class="label" v-if="props.flag === 1">备注</span>
      <span class="label" v-else>我的本群昵称</span>
      <span
        @click="focus"
        v-show="!show"
        ref="textRef"
        class="content"
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

    <div class="remark">
      <span class="label" v-if="props.flag === 1"> 个性签名</span>
      <span class="label" v-else>群介绍</span>
      <span class="content">{{ props.sign }}</span>
    </div>

    <div class="bottom">
      <el-button class="send" :icon="ChatDotRound" @click="sendMes">发消息</el-button>
    </div>
  </div>
</template>

<style scoped>
.empty {
  color: grey;
}
.content {
  display: inline-block;

  width: 500px;
}
.box {
  width: 700px;
  margin: 100px auto;
  position: relative;
}

.extra {
  position: absolute;
  right: 50px;
  top: 30px;
}

.remark {
  /* background-color: aqua; */
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #e6dddd;
}
.inp {
  width: 500px;
}

.label {
  margin-right: 30px;
  display: inline-block;
  width: 120px;
}
.bottom {
  padding: 20px 0;
  text-align: center;
}
.send,
.delete {
  width: 150px;
  border: 0;
  margin: 0 35px;
  color: white;
  height: 50px;
  font-size: 17px;
}
.send {
  background-color: skyblue;
}
.send:hover {
  background-color: rgb(105, 160, 182);
}
.delete {
  background-color: rgb(248, 84, 55);
  color: white;
}
.delete:hover {
  background-color: rgb(180, 76, 76);
}
</style>
