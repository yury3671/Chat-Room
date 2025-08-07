import { createPinia } from 'pinia'
import presist from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(presist)

export default pinia

//统一导出
export * from './modules/user' //接收user模块的所有按需导出
export * from './modules/account'
export * from './modules/chat'
