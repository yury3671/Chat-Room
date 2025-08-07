<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { infoGet } from '@/api/account'
import { useAccountStore } from '@/stores'
import { Document } from '@element-plus/icons-vue'
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
}
</script>

<template>
  <div>
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
        <img
          class="img"
          :src="props.info.msg_content"
          alt=""
          v-else-if="
            fileName(props.info.file_name, 2) === 'png' ||
            fileName(props.info.file_name, 2) === 'jpg'
          "
          @contextmenu.prevent="emit('showMenu', $event, 2, props.info)"
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
        <img
          class="img"
          :src="props.info.msg_content"
          alt=""
          v-else-if="
            fileName(props.info.file_name, 2) === 'png' ||
            fileName(props.info.file_name, 2) === 'jpg'
          "
          @contextmenu.prevent="emit('showMenu', $event, 2, props.info)"
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
