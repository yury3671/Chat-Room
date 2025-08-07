import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/login/loginPage.vue'),
    },
    {
      path: '/register',
      component: () => import('@/views/login/registerPage.vue'),
    },
    {
      path: '/account',
      component: () => import('@/views/login/accountPage.vue'),
    },
    {
      path: '/',
      component: () => import('@/views/home/homePage.vue'),
      //重定向
      redirect: '/chat',
      //二级路由
      children: [
        {
          path: '/chat',
          component: () => import('@/views/chat/chatPage.vue'),
        },
        {
          path: '/friends/:flag',
          component: () => import('@/views/friends/friendsPage.vue'),
        },
      ],
    },
  ],
})

//登录访问拦截
//根据返回值决定方形还是拦截
// undeifned/true直接放行 false拦回from的地址页面
//具体路径或具体对象 拦截到对应的地址 '/login' {name:'login'}
router.beforeEach((to) => {
  //如果没有token，且访问的是非登录页，拦截到登录，其他情况正常放行
  const userStore = useUserStore()

  if (!userStore.token1 && to.path !== '/login' && to.path !== '/register') {
    return '/login'
  }
  if (
    !userStore.token2 &&
    to.path !== '/login' &&
    to.path !== '/account' &&
    to.path !== '/register'
  ) {
    return '/account'
  }
})

export default router
