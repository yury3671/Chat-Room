import axios from 'axios'
// import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores'

const baseURL = 'http://8.137.23.88:8080/api'
const instance = axios.create({
  baseURL, //基地址
  timeout: 10000, //超时时间
})

// 请求拦截器
instance.interceptors.request.use(
  function (config) {
    // 携带token
    const userStore = useUserStore()

    if (userStore.token2) {
      //在请求头携带token
      config.headers.Authorization = 'Bearer ' + userStore.token2
    } else if (userStore.token1) {
      //在请求头携带token
      config.headers.Authorization = 'Bearer ' + userStore.token1
    }

    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  function (res) {
    //处理业务成功
    if (res.data.code) {
      ElMessage.error(res.data.msg.split('错误信息：')[1].split('，')[0])
    } else {
      return res
    }

    // console.log(res)

    // return Promise.reject(res.data)
  },
  function (err) {
    //特殊（401） => 权限不足或token过期
    if (err.response?.status === 401) {
      router.push('/login')
    }
    //默认错误提示
    ElMessage.error(err.response.data.msg || '服务器异常')
    return Promise.reject(err)
  },
)
export default instance //默认导出
export { baseURL } //按需导出
