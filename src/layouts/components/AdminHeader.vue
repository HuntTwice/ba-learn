<script setup lang="ts">
import {useUserStore} from "@/stores/user.ts";
import {storeToRefs} from "pinia";

const userStore = useUserStore()
const {displayName} = storeToRefs(userStore)
</script>

<template>
  <div class="title">
    学习后台
    <span>当前用户：{{ displayName }}</span>

  </div>
</template>

<style scoped>
.title {
  width: 100%;
  flex: 0 0 50px;
  background: lightblue;
}
</style>