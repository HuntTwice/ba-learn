<script setup lang="ts">

import AdminTabs from "@/layouts/components/AdminTabs.vue";
import {useNavTabsStore} from "@/stores/navTabs.ts";

const navTabs = useNavTabsStore()
</script>

<template>
  <div class="main">
    <AdminTabs />
    <RouterView v-slot="{ Component }">
      <KeepAlive :include="navTabs.cacheNames">
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </div>
</template>

<style scoped>


.main {
  flex-direction: column;
  flex: 1;
  min-width: 0;
  display: flex;
  overflow: auto;
}
</style>