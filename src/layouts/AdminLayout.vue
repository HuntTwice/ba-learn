<template>
  <div class="admin">
    <AdminHeader></AdminHeader>
    <div class="container">
      <AdminAside></AdminAside>
      <AdminMain></AdminMain>
    </div>

  </div>
</template>
<script setup lang="ts">

import AdminAside from "@/layouts/components/AdminAside.vue";
import AdminHeader from "@/layouts/components/AdminHeader.vue";
import AdminMain from "@/layouts/components/AdminMain.vue";
</script>


<style scoped>
.admin {
  height: 100%;
  flex-direction: column;
  display: flex;
  overflow: hidden;
}



.container {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
}





</style>