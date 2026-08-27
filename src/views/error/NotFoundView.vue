<template>
  <div class="not-found">
    <h1>404</h1>
    <div>页面不存在</div>
    <RouterLink to="/login">返回登录页</RouterLink>
  </div>
</template>

<style scoped>
.not-found{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>