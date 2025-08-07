import request from '@/utils/request'
//创建群聊
export const groupCreate = ({ name, description }) => {
  return request.post('/group/create', { name, description })
}
//解散群聊
export const groupDissolve = (relation_id) => {
  return request.post('/group/dissolve', { relation_id })
}
//邀请好友加入群聊
export const groupInvite = (account_id, relation_id) => {
  return request.post('/group/invite', { account_id, relation_id })
}
//获取该账号所有的群聊信息
export const groupList = () => {
  return request.get('/group/list')
}
//退出群聊
export const groupQuit = (relation_id) => {
  return request.post('/group/quit', { relation_id })
}
//获取群聊所有成员信息
export const groupMembers = (relation_id) => {
  return request.get(`/group/members?relation_id=${relation_id}`)
}
//修改群聊信息
export const groupUpdate = (relation_id, file, { name, description }) => {
  const formData = new FormData()
  formData.append('relation_id', relation_id)
  if (name) formData.append('name', name)
  if (description) formData.append('description', description)

  if (file) {
    console.log(file)
    formData.append('avatar', file)
  }
  return request.post('/group/update', formData)
}
//根据名称模糊查找本账号加入的群聊
export const groupSearch = (name) => {
  return request.post('/group/name', { name })
}
