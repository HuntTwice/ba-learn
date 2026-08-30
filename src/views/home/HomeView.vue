<template>
  <div>
    <div class="title">后台首页</div>
    <el-button type="primary" @click="look">查看用户8</el-button>
    <el-button @click="mockLogin">模拟填充用户</el-button>
    <el-button @click="changeNickname">修改昵称</el-button>
    <el-button @click="userStore.clearUser()">清空用户</el-button>
  </div>
</template>


<script setup lang="ts">
import {useRouter} from "vue-router";
import {useUserStore} from "@/stores/user.ts";
const userStore = useUserStore()
function mockLogin(){
  userStore.setUser({
    id:8,
    username: 'hunter',
    nickname: 'hunter',
    token: 'demo-token'
  })
}

function changeNickname() {
  userStore.updateNickname("小明")
}
const router = useRouter()
const look = ()=>{
  router.push({
    name: 'user-detail',
    params: {id:8}
  })
}
</script>