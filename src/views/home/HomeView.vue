<template>
  <div>
    <div class="title">后台首页</div>
    <el-button type="primary" @click="look">查看用户8</el-button>
  </div>
</template>


<script setup lang="ts">
import {useRouter} from "vue-router";

const router = useRouter()
const look = ()=>{
  router.push({
    name: 'user-detail',
    params: {id:8}
  })
}
</script>