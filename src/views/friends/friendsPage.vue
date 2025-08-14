<script setup>
import { ref, onMounted, provide, watch } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { friendList, searchFriend } from '@/api/setting'
import { groupList, groupSearch } from '@/api/group'
import { useRoute } from 'vue-router'
import { infoGet } from '@/api/account'
const route = useRoute()
const isInfo = ref(false)
const isApply = ref(false)
const showApply = () => {
  isApply.value = true
  isInfo.value = !isApply.value
}
//高亮下标
const activeIndex = ref(-1)

//群聊信息
const info = ref({})
const showInfo = () => {
  isInfo.value = true
  isApply.value = !isInfo.value
}
//列表信息
const list = ref([])
const flag = ref(+route.params.flag)

//获取数据
const getInfo = async () => {
  if (flag.value === 1) {
    const res = await friendList()
    console.log(res)
    list.value = res.data.data.list
  } else {
    const res = await groupList()
    console.log(res)
    list.value = res.data.data.List
  }
}
onMounted(() => {
  getInfo()
})

watch(route, () => {
  isApply.value = false
  search.value = 1
  isInfo.value = false
  flag.value = +route.params.flag
  getInfo()
})
const sign = ref('')
const id = ref('')
const nick = ref('')

//切换对话时
const change = async (index) => {
  activeIndex.value = index
  if (flag.value === 1) {
    info.value = list.value[activeIndex.value].friend_info
    const res = await infoGet(info.value.account_id)
    // console.log(res)
    info.value.gender = res.data.data.info.gender
    sign.value = res.data.data.signature
    id.value = res.data.data.relation_id
  } else {
    info.value = list.value[activeIndex.value].group_info
    sign.value = list.value[activeIndex.value].group_info.description
    id.value = info.value.relation_id
  }
  if (list.value[activeIndex.value].nick_name) {
    nick.value = list.value[activeIndex.value].nick_name
  } else {
    nick.value = ''
  }
  showInfo()
}
//跨组件通信
provide('info', info)
//搜索好友
const searchRef = ref(null)
const search = ref(1)
const word = ref('')
const searchAll = async (name) => {
  if (name) {
    if (flag.value === 1) {
      word.value = name
      console.log(name)
      const res = await searchFriend(name)
      console.log(res)
      search.value = 2
      list.value = res.data.data.list
    } else {
      const res = await groupSearch(name)
      console.log(res)
      list.value = res.data.data.List
    }
  } else {
    getInfo()
    search.value = 1
  }
}
const update = () => {
  list.value = []
  getInfo()
}
</script>

<template>
  <page-container @search="searchAll">
    <template #left>
      <div class="box">
        <el-scrollbar>
          <div class="apply" @click="showApply" v-if="flag === 1 && search === 1">
            <span>好友通知</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
          <friends-list
            v-for="(value, index) in list"
            :key="value.relation_id"
            :act="value.relation_id === id"
            :msg="flag === 1 ? 2 : 3"
            :info="value"
            @click="change(index)"
          ></friends-list>
          <div class="apply" @click="searchRef.open(word)" v-show="search === 2">
            <span>全网搜索</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
          <search-name ref="searchRef"></search-name>
        </el-scrollbar>
      </div>
    </template>
    <template #right>
      <friend-info
        v-show="isInfo"
        :sign="sign"
        :flag="flag"
        :id="id"
        :nick="nick"
        @updata="update"
      ></friend-info>
      <friend-apply v-show="isApply" @success="getInfo"></friend-apply>
    </template>
  </page-container>
</template>

<style scoped>
.apply {
  height: 40px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.apply:hover {
  background-color: #eee;
}
.box {
  height: 862px;
}
</style>
