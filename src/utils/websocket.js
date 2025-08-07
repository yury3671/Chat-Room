import io from 'socket.io-client'
import { useUserStore } from '@/stores'

//全局变量
let socket = null //websocket实例
let isConnected = false //连接状态
let messageCallback = null //消息回调函数
let reconnectTimer = null //重连计时器

//服务器连接地址
const wsUrl = 'ws://8.137.23.88:8080/chat'
// const wsUrl = 'ws://192.168.0.160:8080/chat'

//初始化Websocket连接
const initWebsocket = () => {
  //清除之前的连接
  closeConnection()

  try {
    //获取用户token
    const token = useUserStore().token2
    console.log(token)
    //创建连接
    socket = io(wsUrl, {
      query: { EIO: 2 },
    })
    //监听连接成功事件
    socket.on('connect', () => {
      console.log('websocket连接成功')
      isConnected = true
      //发送认证消息
      socket.emit('auth', token)
    })
    //监听发送消息事件
    socket.on('send_msg', (data) => {
      console.log('收到消息：', data)
      if (messageCallback) {
        messageCallback(data)
      }
    })
    //监听撤回消息
    socket.on('update_msg_state', (data) => {
      console.log('撤回消息：', data)
      if (messageCallback) {
        messageCallback(data)
      }
    })
    //监听登录事件
    socket.on('account_login', (data) => {
      console.log('账号登录事件', data)
    })
    //监听断开连接事件
    socket.on('disconnect', (reason) => {
      console.log('连接已断开', reason)
      isConnected = false
      //5秒后尝试重连
      reconnectTimer = setTimeout(initWebsocket, 5000)
    })
  } catch (error) {
    console.error('连接失败', error)
    //尝试重连
    reconnectTimer = setTimeout(initWebsocket, 5000)
  }
}

//发送消息
const sendMessage = (msg, callback) => {
  if (!isConnected) {
    console.warn('未连接到服务器，无法发送消息')
    callback(false)
    return
  }

  //记录是否3m秒内发送
  let isSend = false
  //发送消息并等待响应
  socket.emit('send_msg', msg, (res) => {
    isSend = true
    console.log('服务器响应', res)
    callback(true)
  })

  //3秒后检测是否发送成功
  setTimeout(() => {
    if (isSend) return
    console.log('消息发送超时')
    callback(false)
  }, 3000)
}

//设置消息处理回调
const setMessageHandler = (callback) => {
  messageCallback = callback
}

//关闭连接
const closeConnection = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    isConnected = false
    if (reconnectTimer) clearTimeout(reconnectTimer)
    console.log('已手动关闭连接')
  }
}
export {
  initWebsocket, //初始化连接
  sendMessage, //发送消息
  setMessageHandler, //设置消息处理函数
  closeConnection, //关闭连接
}
