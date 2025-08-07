import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore(
  'my-chat',
  () => {
    const chatId = ref('')
    const myId = ref('')
    const setChatId = (value) => {
      chatId.value = value
    }
    const setMyId = (value) => {
      myId.value = value
    }
    //暴露出去
    return {
      myId,
      chatId,
      setChatId,
      setMyId,
    }
  },
  { persist: true }, //pinia持久化
)
