<script setup lang="ts">
import type{ AdminMenuRule} from "@/mock/adminMenu.ts";
import router from "@/router";


defineProps<{
  menus: AdminMenuRule[]
}>();


function openMenu(item: AdminMenuRule) {
  if(!item.path)
    return
  const path = `/admin/${item.path.replace(':id','8')}`
  router.push(path)
}
</script>

<template>
  <template v-for="item in menus" :key="item.name">
    <el-sub-menu v-if="item.children?.length" :index="item.name">
      <template #title>
        {{item.title}}
      </template>
      <AdminMenuTree :menus="item.children"></AdminMenuTree>
    </el-sub-menu>
    <el-menu-item v-else-if="item.type=='menu'&&item.path" :index="item.name" @click="openMenu(item)">
      {{item.title}}
    </el-menu-item>
  </template>
</template>

<style scoped>

</style>