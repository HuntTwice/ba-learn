<template>
  <div>
    <div>当前路由id:{{route.params.id}}</div>
    <RouterLink to="/admin/home">首页</RouterLink>
    <el-input v-model="note" placeholder="输入未提交的备注"></el-input>
  </div>

</template>


<script setup lang="ts">
import {useRoute} from "vue-router";
import { ref } from 'vue'



defineOptions({ name: 'UserDetailView' })
const route = useRoute()


const note = ref('')
// const id = route.params.id;
</script>