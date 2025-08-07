import request from '@/utils/request'

//发送验证码接口
export const userCode = (email) => {
  return request.post('/email/send', { email })
}
//注册接口
export const userRegister = ({ email, password, code }) => {
  return request.post('/user/register', { email, password, code })
}
//登录接口
export const userLogin = ({ email, password }) => {
  return request.post('/user/login', { email, password })
}
//修改邮箱
export const emailAlert = ({ email, code }) => {
  return request.post('/user/update/email', { email, code })
}
// 1396155877@qq.com
//修改邮箱
export const passwordAlert = (code, newPassword) => {
  return request.post('/user/update/pwd', { code, newPassword })
}
//删除用户
export const userDelete = () => {
  return request.delete('user/deleteUser')
}
