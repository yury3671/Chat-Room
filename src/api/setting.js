import request from '@/utils/request'
//获取当前账号所有好友
export const friendList = () => {
  return request.get('/setting/friend/list')
}
//获取当前账户首页显示的好友和群组列表
export const showList = () => {
  return request.get('/setting/shows')
}
//通过姓名模糊查询好友（好友姓名或昵称）
export const searchFriend = (name) => {
  return request.get(`/setting/friend/name?name=${name}`)
}
//更改给好友的备注昵称或自己在群组中的昵称
export const nicknameUpdate = (relation_id, nick_name) => {
  return request.put('/setting/update/nick_name', { relation_id, nick_name })
}
//更改好友或群组的置顶状态
export const pinUpdate = (relation_id, is_pin) => {
  return request.put('/setting/update/pin', { relation_id, is_pin })
}
//更改好友或群组的置顶状态
export const disturbUpdate = (relation_id, is_not_disturb) => {
  return request.put('/setting/update/disturb', { relation_id, is_not_disturb })
}
//更改好友或群组的显示状态
export const showUpdate = (relation_id, is_show) => {
  return request.put('/setting/update/show', { relation_id, is_show })
}
//删除好友关系（双向删除）
export const friendDelete = (relation_id) => {
  return request.delete('/setting/friend/delete', { data: { relation_id } })
}
//发送文件类消息
export const sendFile = (relation_id, file) => {
  const formData = new FormData()
  formData.append('relation_id', relation_id)
  formData.append('file', file)
  return request.post('/message/file', formData)
}
