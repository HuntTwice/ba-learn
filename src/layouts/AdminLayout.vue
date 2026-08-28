<template>
  <div class="admin">
    <div class="title">学习后台</div>
    <div class="container">
      <div class="side">
        <RouterLink v-for="item in visibleMenus" :to="getMenuPath(item.path)" class="link" :key="item.name">{{ item.title }}</RouterLink>
      </div>

      <div class="main">
        <RouterView></RouterView>
      </div>

    </div>

  </div>
</template>
<script setup lang="ts">
import {adminMenuRules} from "@/mock/adminMenu";


const visibleMenus = adminMenuRules.filter(
    (item) => item.type === 'menu' && item.menuType === 'tab',
)

function getMenuPath(path: string) {
  return `/admin/${path.replace(':id', '8')}`
}
</script>


<style scoped>
.admin {
  height: 100%;
  flex-direction: column;
  display: flex;
}

.title {
  top: 0;
  width: 100%;
  height: 50px;
  background: lightblue;
}

.container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
}
.side{
  width: 10%;
  height: 100%;
  background: lightgoldenrodyellow;
}

.main{
  width: 90%;
  height: 100%;
  background: coral;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link{
  display: block;
  margin-top: 20px;
}
</style>