<template>
  <div>
    <div>当前路由id:{{route.params.id}}</div>
    <RouterLink to="/admin/home">首页</RouterLink>
  </div>
</template>


<script setup lang="ts">
import {useRoute} from "vue-router";

const route = useRoute()
// const id = route.params.id;
</script>