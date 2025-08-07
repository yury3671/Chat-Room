import request from '@/utils/request'

//创建账号接口
export const accountCreate = ({ name, gender, signature }) => {
  return request.post('/account/create', { name, gender, signature })
}

//获取用户所有账号的接口
export const accountGet = () => {
  return request.get('/account/infos/account')
}

//获取账号的token
export const tokenGet = (account_id) => {
  return request.post('/account/token', { account_id })
}

//删除账号
export const accountDelete = (account_id) => {
  return request.delete('/account/delete', { data: { account_id } })
}
//获取账号信息
export const infoGet = (account_id) => {
  return request.post('/account/info', { account_id })
}
//更新账号信息
export const accountAlert = ({ name, gender, signature }) => {
  return request.put('/account/update', { name, gender, signature })
}
//根据名称查找用户
export const nameSearch = (name, page, page_size) => {
  return request.post(`/account/infos/name?page=${page}&page_size=${page_size}`, { name })
}
//更改账户头像
export const alterAvator = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.put('/file/avatar/account', formData)
}
