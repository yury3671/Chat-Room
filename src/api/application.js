import request from '@/utils/request'

//获取申请接口
export const applicationGet = (page, page_size) => {
  return request.get(`/application/list?page=${page}&page_size=${page_size}`)
}
//创建申请接口
export const applicationCreate = (account_id, application_msg) => {
  return request.post('/application/create', { account_id, application_msg })
}
//删除申请接口
export const applicationDelete = (account_id, create_at) => {
  return request.delete('/application/delete', {
    data: { account_id, create_at },
  })
}
//拒绝申请接口
export const applicationRefuse = (account_id, refuse_msg, create_at) => {
  return request.put('/application/refuse', {
    account_id,
    refuse_msg,
    create_at,
  })
}
//同意申请接口
export const applicationAgree = (account_id, create_at) => {
  return request.put('/application/accept', { account_id, create_at })
}
