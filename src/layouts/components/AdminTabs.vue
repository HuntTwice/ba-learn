<script setup lang="ts">
import {useNavTabsStore} from "@/stores/navTabs.ts";
import {useRoute} from "vue-router";
import {watch} from "vue";
import {storeToRefs} from "pinia";
import type {TabPaneName, TabsPaneContext} from "element-plus";
import router from "@/router";

const navTabs = useNavTabsStore()
const route = useRoute()
const {tabs} = storeToRefs(navTabs)
watch(() => route.fullPath, () => {
  if (route.meta.tab !== true)
    return
  if (typeof route.meta.title !== 'string')
    return
  navTabs.addTab({
    title: route.meta.title,
    fullPath: route.fullPath,
    fixed: false,
    cacheName: typeof route.meta.cacheName === 'string'
        ? route.meta.cacheName
        : '',
  })
}, {immediate: true})

const handleClick = (tab: TabsPaneContext, event: Event) => {
  const path = tab.props.name as string
  // if (typeof path !== "string")
  //   return
  console.log('标签点击：', {
    path,
    type: typeof path,
  })


  router.push(path)

}
const handleRemove = async (name: TabPaneName) => {
  if (typeof name !== 'string') return
  const index = tabs.value.findIndex((item) => item.fullPath === name)
  if (index === -1 || tabs.value[index]!.fixed)
    return
  if (name === route.fullPath) {
    const nextTab = tabs.value[index + 1] ?? tabs.value[index - 1]
    const targetPath = nextTab?.fullPath ?? '/admin/home'
    const failure = await router.push(targetPath)
    if (failure) return
  }
  navTabs.removeTab(name)
  // 1. 在 tabs.value 中找到目标标签的位置
  // 2. 找不到或目标是固定标签，就返回
  // 3. 如果 name === route.fullPath，先导航到保留的标签
  // 4. 最后调用 navTabs.removeTab(name)
}
</script>

<template>
  <el-tabs :model-value="route.fullPath" class="demo-tabs" @tab-click="handleClick" type="card"
           @tab-remove="handleRemove">
    <el-tab-pane v-for="tab in navTabs.tabs" :key="tab.fullPath" :label="tab.title" :name="tab.fullPath"
                 :closable="!tab.fixed"></el-tab-pane>

  </el-tabs>
</template>

<style scoped>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>