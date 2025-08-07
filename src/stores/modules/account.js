import { defineStore } from 'pinia'
import { ref } from 'vue'
//账号模块 account setAccount removeAccount
export const useAccountStore = defineStore(
  'my-account',
  () => {
    const id = ref('')
    const name = ref('')
    const gender = ref('')
    const signature = ref('')
    const avatar = ref('')
    const setId = (newId) => {
      id.value = newId
    }
    const removeAll = () => {
      id.value = ''
      name.value = ''
      gender.value = ''
      signature.value = ''
      avatar.value = ''
    }
    const setName = (newName) => {
      name.value = newName
    }
    const setGender = (newGender) => {
      gender.value = newGender
    }
    const setSignature = (newSignature) => {
      signature.value = newSignature
    }
    const setAvatar = (newAvatar) => {
      avatar.value = newAvatar
    }
    //暴露出去
    return {
      id,
      setId,
      removeAll,
      name,
      setName,
      gender,
      setGender,
      signature,
      setSignature,
      avatar,
      setAvatar,
    }
  },
  { persist: true }, //pinia持久化
)
