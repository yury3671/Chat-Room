import { defineStore } from 'pinia'
import { ref } from 'vue'
//用户模块 token setToken removeToken
export const useUserStore = defineStore(
  'my-user',
  () => {
    //登录token
    const token1 = ref('')
    //账号token
    const token2 = ref('')
    const setToken1 = (newToken) => {
      token1.value = newToken
    }
    const removeToken1 = () => {
      token1.value = ''
    }
    const setToken2 = (newToken) => {
      token2.value = newToken
    }
    const removeToken2 = () => {
      token2.value = ''
    }
    //暴露出去
    return {
      token1,
      token2,
      setToken1,
      removeToken1,
      setToken2,
      removeToken2
    }
  },
  { persist: true } //pinia持久化
)
