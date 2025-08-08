<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { infoGet } from '@/api/account'
import { useAccountStore } from '@/stores'
import { Document, Download } from '@element-plus/icons-vue'
const emit = defineEmits(['showMenu', 'showPanel', 'jump'])
const userAccount = useAccountStore()

const props = defineProps({
  info: Object,
})

onMounted(async () => {
  await getInfo()
})
const name = ref('')
const getInfo = async () => {
  if (props.info.nick_name && props.info.nick_name !== ' ') {
    name.value = props.info.nick_name
  } else {
    const res = await infoGet(props.info.account_id)
    name.value = res.data.data.info.name
  }
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
  popoverVisible.value = false
}
const popoverVisible = ref(false)
const clickX = ref(0)
const clickY = ref(0)
const handleContextMenu = (event) => {
  // 判断点击的目标是否在预览图浮层内（通过 Element Plus 预览图的固定类名）
  const isPreviewImage = event.target.closest('.el-image-viewer__wrapper')

  if (!isPreviewImage) {
    // 不是预览图：触发 showMenu 事件
    emit('showMenu', event, 2, props.info)
  } else {
    // 获取点击位置相对于视口的坐标（clientX/clientY）
    clickX.value = event.clientX + 140 > window.innerWidth ? event.clientX - 140 : event.clientX
    clickY.value = event.clientY + 60 > window.innerHeight ? event.clientY - 60 : event.clientY
    // 显示弹窗
    popoverVisible.value = true
    // 是预览图：不触发事件（或执行预览图自身的右键逻辑）
    console.log('预览图右键，不触发菜单')
  }
}
</script>

<template>
  <div>
    <el-popover
      v-model:visible="popoverVisible"
      width="120"
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
      <div class="menu">
        <div class="opt" @click="openFile(props.info.msg_content)">
          <el-icon><Download /></el-icon>

          <span>下载</span>
        </div>
      </div>
    </el-popover>

    <div class="revoke" v-if="props.info.is_revoke">
      {{
        props.info.account_id === userAccount.id
          ? '你'
          : `"${
              props.info.nick_name && props.info.nick_name !== ' '
                ? props.info.nick_name
                : props.info.account_name
            }"`
      }}撤回了一条消息
    </div>
    <div class="msg" :class="{ me: props.info.account_id === userAccount.id }" v-else>
      <div class="box box1" v-if="props.info.account_id === userAccount.id">
        <div
          class="content"
          @contextmenu.prevent="emit('showMenu', $event, 2, props.info)"
          v-if="props.info.msg_type === 'text'"
        >
          {{ props.info.msg_content }}
        </div>
        <el-image
          class="img"
          :zoom-rate="1.2"
          :max-scale="7"
          :min-scale="0.2"
          :preview-src-list="[props.info.msg_content]"
          :initial-index="0"
          :src="props.info.msg_content"
          alt=""
          v-else-if="
            fileName(props.info.file_name, 2) === 'png' ||
            fileName(props.info.file_name, 2) === 'jpg'
          "
          @contextmenu.prevent="handleContextMenu"
        />
        <div
          class="file"
          :style="{
            width: `140px`,
            height: `140px`,
          }"
          @contextmenu.prevent="emit('showMenu', $event, 2, props.info)"
          @click="openFile(props.info.msg_content)"
          v-else
        >
          <el-icon :size="80" color="grey"><Document /></el-icon>
          <div>
            <span class="fileName">{{ fileName(props.info.file_name, 1) }}</span
            >.{{ fileName(props.info.file_name, 2) }}
          </div>
          <div style="color: grey; font-size: 13px">
            {{ fileSize(props.info.file_size) }}
          </div>
        </div>
        <div
          class="rly"
          v-if="props.info.rly_msg && !props.info.rly_msg.is_revoked"
          @click="emit('jump', props.info.rly_msg.msg_id)"
        >
          <span class="rlyName"
            >{{
              props.info.rly_msg.nick_name && props.info.rly_msg.nick_name !== ' '
                ? props.info.rly_msg.nick_name
                : props.info.rly_msg.account_name
            }}:
          </span>
          <span v-if="props.info.rly_msg.msg_type === 'text'">{{
            props.info.rly_msg.msg_content
          }}</span>

          <img
            class="rlyImg"
            :src="props.info.rly_msg.msg_content"
            alt=""
            v-else-if="
              fileName(props.info.rly_msg.file_name, 2) === 'png' ||
              fileName(props.info.rly_msg.file_name, 2) === 'jpg'
            "
          />
          <div
            class="file"
            :style="{
              width: `100px`,
              height: `100px`,
              display: 'inline-block',
            }"
            v-else
          >
            <el-icon :size="50" color="grey"><Document /></el-icon>
            <div>
              <span class="fileName">{{ fileName(props.info.rly_msg.file_name, 1) }}</span
              >.{{ fileName(props.info.rly_msg.file_name, 2) }}
            </div>
            <div style="color: grey; font-size: 13px">
              {{ fileSize(props.info.rly_msg.file_size) }}
            </div>
          </div>
        </div>
      </div>

      <el-avatar
        shape="square"
        :src="props.info.account_avatar"
        @click="
          emit('showPanel', $event, props.info.account_id, props.info.account_id === userAccount.id)
        "
      />
      <div class="box" v-if="props.info.account_id !== userAccount.id">
        <div class="name">
          {{
            props.info.nick_name && props.info.nick_name !== ' '
              ? props.info.nick_name
              : props.info.account_name
          }}
        </div>
        <div
          class="content"
          @contextmenu.prevent="emit('showMenu', $event, 2, props.info)"
          v-if="props.info.msg_type === 'text'"
        >
          {{ props.info.msg_content }}
        </div>

        <el-image
          class="img"
          :zoom-rate="1.2"
          :max-scale="7"
          :min-scale="0.2"
          :preview-src-list="[props.info.msg_content]"
          :initial-index="0"
          :src="props.info.msg_content"
          alt=""
          v-else-if="
            fileName(props.info.file_name, 2) === 'png' ||
            fileName(props.info.file_name, 2) === 'jpg'
          "
          @contextmenu.prevent="handleContextMenu"
        />

        <div
          class="file"
          :style="{
            width: `140px`,
            height: `140px`,
          }"
          @contextmenu.prevent="emit('showMenu', $event, 2, props.info)"
          @click="openFile(props.info.msg_content)"
          v-else
        >
          <el-icon :size="80" color="grey"><Document /></el-icon>
          <div>
            <span class="fileName">{{ fileName(props.info.file_name, 1) }}</span
            >.{{ fileName(props.info.file_name, 2) }}
          </div>
          <div style="color: grey; font-size: 13px">
            {{ fileSize(props.info.file_size) }}
          </div>
        </div>
        <div
          class="rly"
          v-if="props.info.rly_msg && !props.info.rly_msg.is_revoked"
          @click="emit('jump', props.info.rly_msg.msg_id)"
        >
          <span class="rlyName"
            >{{
              props.info.rly_msg.nick_name && props.info.rly_msg.nick_name !== ' '
                ? props.info.rly_msg.nick_name
                : props.info.rly_msg.account_name
            }}:
          </span>
          <span v-if="props.info.rly_msg.msg_type === 'text'">{{
            props.info.rly_msg.msg_content
          }}</span>
          <img
            class="rlyImg"
            :src="props.info.rly_msg.msg_content"
            alt=""
            v-else-if="
              fileName(props.info.rly_msg.file_name, 2) === 'png' ||
              fileName(props.info.rly_msg.file_name, 2) === 'jpg'
            "
          />
          <div
            class="file"
            :style="{
              width: `100px`,
              height: `100px`,
              display: 'inline-block',
            }"
            v-else
          >
            <el-icon :size="50" color="grey"><Document /></el-icon>
            <div>
              <span class="fileName">{{ fileName(props.info.rly_msg.file_name, 1) }}</span
              >.{{ fileName(props.info.rly_msg.file_name, 2) }}
            </div>
            <div style="color: grey; font-size: 13px">
              {{ fileSize(props.info.rly_msg.file_size) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
.rlyName {
  vertical-align: top;
}
.box1 {
  text-align: end;
}
.img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 5px;
}
.imgView {
  max-width: 200px;
  max-height: 200px;
}
.rlyImg {
  max-width: 100px;
  max-height: 100px;
  border-radius: 5px;
}
.rly {
  text-align: left;
  /* display: flex; */
  font-size: 14px;
  border-radius: 5px;
  padding: 5px 10px;
  color: grey;
  background-color: rgba(0, 0, 0, 0.1);
  max-width: 800px;
  /* 自动换行 */
  word-wrap: break-word;
  /* 长单词断行 */
  word-break: break-all;
  margin-top: 5px;
}
.revoke {
  font-size: 15px;
  text-align: center;
  color: grey;
  margin: 30px 0;
}
.me {
  justify-content: flex-end;
}
.msg {
  display: flex;
  gap: 10px;
  margin: 20px 30px;
}
.name {
  font-size: 14px;
  color: grey;
  margin-bottom: 5px;
}
.content {
  display: inline-block;
  text-align: left;
  background-color: white;
  border-radius: 10px;
  padding: 7px 10px;
  max-width: 800px;
  white-space: pre-line;
  /* 自动换行 */
  word-wrap: break-word;
  /* 长单词断行 */
  word-break: break-all;
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
</style>
