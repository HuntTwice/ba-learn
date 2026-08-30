<template>
  <div class="side" :style="{ width: sidebarWidth }">
    <el-button @click="appStore.toggleSidebar()">{{ sidebarActionText }}</el-button>
    <el-menu :collapse="sidebarCollapsed" :collapse-transition="false" :default-active="activeMenu">
    <AdminMenuTree :menus="adminMenuRules"></AdminMenuTree>
    </el-menu>
  </div>
</template>


<script setup lang="ts">
import {adminMenuRules} from "@/mock/adminMenu.ts";
import {storeToRefs} from "pinia";
import {useAppStore} from "@/stores/app.ts";
import AdminMenuTree from "@/layouts/components/AdminMenuTree.vue";
import {useRoute} from "vue-router";
import {computed} from "vue";
const appStore = useAppStore()
const {
  sidebarCollapsed,
  sidebarWidth,
  sidebarActionText,
} = storeToRefs(appStore)
const route = useRoute()
const activeMenu = computed(
    () => String(route.name ?? ''),
)




</script>

<style scoped>
.side {
  height: 100%;
  background: lightgoldenrodyellow;
  transition: width 0.2s;
}

</style>