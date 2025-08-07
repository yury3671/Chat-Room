<script setup>
import { Female, Male } from '@element-plus/icons-vue'
import { useAccountStore } from '@/stores'

import { ref, inject, computed } from 'vue'

const accountStore = useAccountStore()
const props = defineProps({ flag: Number })

const injectedInfo = inject('info')

const info = computed(() => {
  // 如果有注入的 info，则使用注入值；否则使用 accountStore 的当前值
  return injectedInfo
    ? injectedInfo.value
    : {
        name: accountStore.name,
        gender: accountStore.gender,
        avatar: accountStore.avatar,
      }
})
</script>

<template>
  <div class="head">
    <div class="left">
      <el-avatar shape="square" :src="info.avatar" :size="80" />
    </div>
    <div class="right">
      <div class="top">
        <div class="name">{{ info.name }}</div>
        <div v-if="props.flag === 1">
          <el-icon size="20" color="#fb7373" v-if="info.gender === '女'"><Female /></el-icon>
          <el-icon size="20" color="#10aeff" v-if="info.gender === '男'" e><Male /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.head {
  /* background-color: aqua; */
  display: flex;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #e6dddd;
  align-items: center;
}
.left {
  display: flex;
  align-items: center;
}
.name {
  font-size: 25px;
}
.id,
.area {
  font-size: 14px;
  color: grey;
}
</style>
