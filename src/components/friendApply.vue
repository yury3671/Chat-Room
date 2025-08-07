<script setup>
import { ref } from 'vue'
import { CircleClose } from '@element-plus/icons-vue'
import {
  applicationGet,
  applicationDelete,
  applicationRefuse,
  applicationAgree,
} from '@/api/application'
import emitter from '@/assets/eventBus'
const emit = defineEmits(['success'])
//申请信息
const list = ref([])
const pageInfo = ref({
  page: 1,
  page_size: 6,
  total: 0,
})
//获取所有申请
const applyGet = async () => {
  const res = await applicationGet(pageInfo.value.page, pageInfo.value.page_size)
  console.log(res)
  list.value = res.data.data.list

  pageInfo.value.total = res.data.data.total
}
applyGet()
emitter.on('success', () => {
  applyGet()
})

//填写拒绝申请留言
const open = (id, create) => {
  ElMessageBox.prompt('填写留言信息', '拒绝申请', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    draggable: true,
  }).then(async ({ value }) => {
    console.log(value)
    console.log(id)
    const res = await applicationRefuse(id, value, create)
    console.log(res)
  })
}
//删除申请
const del = async (id, create) => {
  await applicationDelete(id, create)
  applyGet()
}
//同意申请
const add = async (id, create) => {
  const res = await applicationAgree(id, create)
  emit('success')
  console.log(res)
  applyGet()
}
//页码改变
const pageChange = (num) => {
  console.log(num)
  pageInfo.value.page = num
  applyGet()
}
</script>

<template>
  <div>
    <header>好友通知</header>
    <div v-if="list">
      <div class="req" v-for="item in list" :key="item.account_id_2">
        <div class="left">
          <el-avatar shape="square" :src="item.avatar" />
          <div class="mid">
            <div class="name">{{ item.name }}</div>
            <div class="note">
              <span class="me" v-show="item.status === '已申请'">我：</span>
              <span>{{ item.apply_msg }}</span>
            </div>
          </div>
        </div>
        <div class="right">
          <el-button
            class="add"
            @click="add(item.account_id_1, item.create_at)"
            v-if="item.status === '等待验证'"
            >添加</el-button
          >
          <div class="extra" v-else-if="item.status === '已申请'">等待验证</div>
          <div class="extra" v-else-if="item.status === '已同意'">已同意</div>
          <div class="extra" v-else>已拒绝</div>
          <el-popconfirm
            width="100"
            confirm-button-text="确认"
            cancel-button-text="取消"
            title="确定拒绝好友申请"
            hide-icon="true"
            @confirm="open(item.account_id_1, item.create_at)"
          >
            <template #reference>
              <div>
                <el-tooltip
                  class="box-item"
                  effect="light"
                  content="拒绝申请"
                  placement="right-start"
                  :show-arrow="false"
                >
                  <el-icon class="quit" color="grey" v-show="item.status === '等待验证'"
                    ><CircleClose
                  /></el-icon>
                </el-tooltip>
              </div>
            </template>
          </el-popconfirm>
          <el-popconfirm
            width="100"
            confirm-button-text="确认"
            cancel-button-text="取消"
            title="确定删除好友申请"
            hide-icon="true"
            @confirm="del(item.account_id_2, item.create_at)"
          >
            <template #reference>
              <div>
                <el-tooltip
                  class="box-item"
                  effect="light"
                  content="删除申请"
                  placement="right-start"
                  :show-arrow="false"
                >
                  <el-icon class="quit" color="grey" v-show="item.status === '已申请'"
                    ><CircleClose
                  /></el-icon>
                </el-tooltip>
              </div>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </div>
    <div class="empty" v-else>暂无好友通知</div>
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
  </div>
</template>

<style scoped>
.empty {
  font-size: 25px;
  color: grey;
  text-align: center;
  padding: 100px 0;
}
header {
  font-weight: 450;
  font-size: larger;
  margin: 20px;
}
.req {
  margin: 20px auto;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  width: 500px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.left,
.right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.note {
  font-size: 13px;
  color: grey;
}
.add {
  color: white;
  background-color: skyblue;
  border: 0;
}
.add:hover {
  background-color: rgb(105, 160, 182);
}
.extra {
  color: grey;
}
.quit:hover {
  color: red;
}
.bottom {
  display: flex;
  justify-content: center;
}
</style>
