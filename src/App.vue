<template>
  
<Canvas></Canvas>

<Header
  maintitle="浒墅关先进制造区 数字孪生系统"
  subtitle="「智园新序」"
  thirdtitle="苏州 · 虎丘区"
></Header>

<Panels 
  :show-panels="showPanels" 
  :panel-content="panelContent" 
></Panels>

<Footer 
  :active-nav="activeNav" 
  :show-panels="showPanels" 
  @nav-change="handleNavChange" 
></Footer>

</template>


<script setup>
import { ref } from 'vue'
import Canvas from './components/Canvas.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Panels from './components/Panels.vue';

// 导航栏选项配置（移到父组件，统一管理数据）
const navItems = ref([
  {
    name: '首页',
    left: '### 首页左侧面板\n- 3D场景概览\n- 园区整体数据\n- 实时监控状态',
    right: '### 首页右侧面板\n- 设备在线率：98%\n- 环境温度：25℃\n- 湿度：60%\n- 风速：2m/s'
  },
  {
    name: '数据监控',
    left: '### 数据监控左侧\n- 能耗数据统计\n- 设备运行时长\n- 故障报警记录',
    right: '### 数据监控右侧\n- 今日能耗：1200kWh\n- 本月能耗：35000kWh\n- 故障数量：0'
  },
  {
    name: '设备管理',
    left: '### 设备管理左侧\n1. 照明设备（56台）\n2. 监控设备（32台）\n3. 环境传感器（18台）',
    right: '### 设备管理右侧\n- 在线设备：104台\n- 离线设备：2台\n- 待维护：0台'
  },
  {
    name: '系统设置',
    left: '### 系统设置左侧\n- 用户权限管理\n- 场景参数配置\n- 数据备份设置',
    right: '### 系统设置右侧\n- 当前登录用户：管理员\n- 最后备份时间：2026-01-18\n- 自动备份：开启'
  }
])

// 全局状态（统一管理，传递给子组件）
const activeNav = ref(0) // 当前激活的导航索引
const showPanels = ref(true) // 面板显示状态
const panelContent = ref({
  left: navItems.value[0].left,
  right: navItems.value[0].right
})

// 处理底部导航传递的点击事件（核心逻辑，和原来的switchNav一致）
const handleNavChange = (index) => {
  // 如果点击的是当前已激活的导航项，则切换面板显示状态
  if (activeNav.value === index) {
    showPanels.value = !showPanels.value
  } else {
    activeNav.value = index
    showPanels.value = true // 点击其他导航项时确保面板显示
  }
  // 更新面板内容
  panelContent.value.left = navItems.value[index].left
  panelContent.value.right = navItems.value[index].right
}



</script>




<style scoped>
* {
  all: unset;
  box-sizing: border-box;
  display: block;
}
</style>
