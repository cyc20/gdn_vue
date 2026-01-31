<template>
  
<Canvas></Canvas>

<Header
  maintitle="浒墅关先进制造区 数字孪生系统"
  subtitle="「智园新序」"
  thirdtitle="苏州 · 虎丘区"
></Header>

<Panels 
  :show-panels="showPanels" 
  :active-nav="activeNav"
  @nav-change="handleNavChange" 
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

// 全局状态（简化，只保留必要的）
const activeNav = ref(0) // 当前激活的导航索引
const showPanels = ref(true) // 面板显示状态

// 处理底部导航传递的点击事件（简化处理）
const handleNavChange = (index) => {
  // 如果点击的是当前已激活的导航项，则切换面板显示状态
  if (activeNav.value === index) {
    showPanels.value = !showPanels.value
  } else {
    activeNav.value = index
    showPanels.value = true // 点击其他导航项时确保面板显示
  }
}
</script>




<style scoped>
* {
  all: unset;
  box-sizing: border-box;
  display: block;
}
</style>
