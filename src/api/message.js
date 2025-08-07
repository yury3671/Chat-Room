import request from '@/utils/request'
//获取指定关系指定时间戳之前的消息
export const messageList = (relation_id, last_time, page, page_size) => {
  return request.post(`/message/list/time?page=${page}&page_size=${page_size}`, {
    relation_id,
    last_time,
  })
}
//通过内容模糊查找指定或所有关系中的信息
export const messageSearch = (relation_id, content, page, page_size) => {
  return request.get(
    `/message/list/content?relation_id=${relation_id}&content=${content}&page=${page}&page_size=${page_size}`,
  )
}
//删除信息
export const messageDelete = (id) => {
  return request.put('/message/update/delete', { id })
}
//撤回消息
export const messageRevoke = (id) => {
  return request.put('/message/update/revoke', { id })
}
