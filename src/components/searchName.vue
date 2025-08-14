<script setup>
import { ref, nextTick } from 'vue'
import { Search, Female, Male } from '@element-plus/icons-vue'
import { nameSearch } from '@/api/account'
const dialogVisible = ref(false)
//页数信息
const pageInfo = ref({
  page: 1,
  page_size: 6,
  total: 0,
})
const list = ref([])
const name = ref('')
const inpRef = ref(null)
const open = (newName) => {
  dialogVisible.value = true
  nextTick(() => {
    // 第二重延迟：确保对话框完全插入到 body 中
    setTimeout(() => {
      inpRef.value.focus()
    }, 100) // 可根据实际情况调整延迟时间
  })

  name.value = newName
  searchInfo()
  // console.log(name.value)
}
const searchInfo = async () => {
  if (name.value) {
    const res = await nameSearch(name.value, pageInfo.value.page, pageInfo.value.page_size)
    console.log(res)
    list.value = res.data.data.list

    pageInfo.value.total = res.data.data.total
    console.log(res)
  }
}
defineExpose({ open })

//添加朋友
const friendRef = ref()

//搜索函数
const search = () => {
  if (name.value) {
    pageInfo.value.page = 1
    searchInfo()
  }
}
//页码改变
const pageChange = (num) => {
  console.log(num)
  pageInfo.value.page = num
  searchInfo()
}
</script>

<template>
  <el-dialog v-model="dialogVisible" width="30%" draggable :modal="false" title="搜索" center>
    <header>
      <el-input
        ref="inpRef"
        :prefix-icon="Search"
        v-model="name"
        clearable
        placeholder="请输入关键字"
        @keyup.enter="search"
      ></el-input>
    </header>
    <div class="content" v-if="list">
      <div class="item" v-for="item in list" :key="item.id">
        <div class="left">
          <el-avatar shape="square" :src="item.avatar" />
          <div class="name">{{ item.name }}</div>
          <el-icon size="17" color="#fb7373" v-if="item.gender === '女'"><Female /></el-icon>
          <el-icon size="17" color="#10aeff" v-if="item.gender === '男'"><Male /></el-icon>
        </div>
        <div class="right">
          <div v-if="item.relation_id">已添加</div>
          <el-button @click="friendRef.open(item.id)" v-else>添加</el-button>
        </div>
      </div>
      <add-friend ref="friendRef"></add-friend>
    </div>
    <div class="empty" v-else>暂未找到任何信息</div>
    <div class="bottom">
      <el-pagination
        v-if="list"
        layout="prev, pager, next"
        :total="pageInfo.total * 10"
        v-model:current-page="pageInfo.page"
        @current-change="pageChange"
        :hide-on-single-page="true"
      />
    </div>
  </el-dialog>
</template>

<style scoped>
.empty {
  text-align: center;
  padding: 20px 0;
}
header {
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.item {
  margin: 20px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.bottom {
  display: flex;
  justify-content: center;
}
</style>
