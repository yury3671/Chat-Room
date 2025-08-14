<script setup>
import { Search, Plus, CirclePlus, ChatDotSquare } from '@element-plus/icons-vue'
import { ref } from 'vue'
const name = ref('')
//搜索函数
const emit = defineEmits(['search'])
const popoverRef = ref(null)
const searchRef = ref()
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    //清除之前定时器
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
const search = debounce(() => {
  emit('search', name.value)
}, 100)
const groupRef = ref()
const create = () => {
  popoverRef.value.hide()
  groupRef.value.open(1)
}

const searchALL = () => {
  popoverRef.value.hide()

  searchRef.value.open()
}
const clear = () => {
  name.value = ''
}
defineExpose({ clear })
</script>

<template>
  <el-container>
    <el-aside width="300px">
      <header>
        <el-input
          :prefix-icon="Search"
          placeholder="请输入关键字"
          v-model="name"
          clearable
          @input="search"
        >
        </el-input>
        <search-name ref="searchRef"></search-name>
        <el-popover
          placement="top-start"
          trigger="click"
          :show-arrow="false"
          popper-style="padding:5px;"
          ref="popoverRef"
        >
          <template #reference>
            <el-button :icon="Plus"></el-button>
          </template>
          <div class="item" @click="create">
            <el-icon size="17"><CirclePlus /></el-icon>
            <span>创建群聊</span>
          </div>

          <div class="item" @click="searchALL">
            <el-icon size="17"><ChatDotSquare /></el-icon>
            <span>添加好友</span>
          </div>
        </el-popover>
        <group-create ref="groupRef"></group-create>
      </header>

      <slot name="left"></slot>
    </el-aside>
    <el-main>
      <slot name="right"></slot>
    </el-main>
  </el-container>
</template>

<style scoped>
.el-aside {
  height: 100vh;
}
.el-main {
  background-image: linear-gradient(
    to top left,
    rgba(255, 169, 159, 0.3),
    #eee,
    rgba(135, 206, 235, 0.3)
  );
  padding: 0;
}
header {
  box-sizing: border-box;
  height: 70px;
  padding-bottom: 15px;
  padding-top: 30px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}
.el-input {
  width: 200px;
}
.el-button {
  width: 20px;
}
.item {
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
}
.item:hover {
  background-color: #eee;
}
</style>
