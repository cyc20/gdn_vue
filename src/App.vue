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

<!-- 竖屏遮罩提示层 -->
<div v-if="showPortraitOverlay" class="portrait-overlay">
  <div class="overlay-content">
    <div class="rotate-icon">📱</div>
    <h2>请将设备横置</h2>
    <p>为了获得最佳浏览体验<br>请将您的设备旋转至横向模式</p>
  </div>
</div>

</template>


<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import Canvas from './components/Canvas.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Panels from './components/Panels.vue';

// 全局状态
const activeNav = ref(0)
const showPanels = ref(true)
const isMobilePortrait = ref(false)
const showPortraitOverlay = ref(false) // 竖屏遮罩显示状态
const isPageVisible = ref(true)
const isInitializing = ref(true) // 初始化状态

// 检测是否为移动设备
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 检测设备方向
const checkOrientation = () => {
  const isMobile = isMobileDevice()
  const isPortrait = window.innerHeight > window.innerWidth
  
  isMobilePortrait.value = isMobile && isPortrait
  showPortraitOverlay.value = isMobilePortrait.value
  
  console.log(`设备检测: 移动=${isMobile}, 竖屏=${isPortrait}, 显示遮罩=${showPortraitOverlay.value}`)
  
  return { isMobile, isPortrait }
}

// 强制页面重载机制
const forcePageReload = () => {
  console.log('执行强制页面重载...')
  
  // 方法1: 重新设置视口meta标签
  let viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
  } else {
    viewport = document.createElement('meta')
    viewport.name = 'viewport'
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    document.head.appendChild(viewport)
  }
  
  // 方法2: 强制重置body样式
  document.body.style.cssText = `
    margin: 0;
    padding: 0;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
  `
  
  // 方法3: 触发resize事件
  window.dispatchEvent(new Event('resize'))
  
  // 方法4: 通知Canvas组件重新初始化
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('forceCanvasReinit'))
  }, 150)
  
  // 方法5: 重新检测方向
  setTimeout(() => {
    checkOrientation()
  }, 300)
}

// 处理页面可见性变化
const handleVisibilityChange = () => {
  isPageVisible.value = !document.hidden
  console.log(`页面可见性变化: ${isPageVisible.value}`)
  
  if (!document.hidden && !isInitializing.value) {
    // 页面变为可见时，延迟执行重载检测
    setTimeout(() => {
      const { isMobile, isPortrait } = checkOrientation()
      const wasPortrait = isMobilePortrait.value
      
      // 如果是移动设备且方向发生了变化，强制重载
      if (isMobile && 
          ((wasPortrait && !isPortrait) || (!wasPortrait && isPortrait))) {
        console.log('检测到方向变化，执行强制重载')
        forcePageReload()
      } else {
        // 即使方向未变，也重新检测一次
        checkOrientation()
      }
    }, 500) // 增加延迟确保旋转完成
  }
}

// 处理方向变化
const handleOrientationChange = () => {
  console.log('方向变化事件触发')
  
  // 立即检测
  checkOrientation()
  
  // 延迟多次检测确保稳定
  setTimeout(checkOrientation, 100)
  setTimeout(checkOrientation, 300)
  setTimeout(checkOrientation, 600)
  
  // 如果是移动设备，执行强制重载
  if (isMobileDevice()) {
    setTimeout(forcePageReload, 300)
  }
}

// 处理窗口大小变化
const handleResize = () => {
  console.log('窗口大小变化')
  checkOrientation()
}

// 处理导航变化
const handleNavChange = (index) => {
  if (activeNav.value === index) {
    showPanels.value = !showPanels.value
  } else {
    activeNav.value = index
    showPanels.value = true
  }
}

// 监听竖屏状态变化
watch(isMobilePortrait, (newVal) => {
  showPortraitOverlay.value = newVal
  console.log(`竖屏状态变化: ${newVal}`)
})

// 生命周期钩子
onMounted(() => {
  console.log('App组件挂载')
  
  // 初始检测
  setTimeout(() => {
    checkOrientation()
    isInitializing.value = false
  }, 1000)
  
  // 添加各种事件监听器
  window.addEventListener('resize', handleResize, { passive: true })
  window.addEventListener('orientationchange', handleOrientationChange, { passive: true })
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 添加页面加载完成后的额外检测
  setTimeout(checkOrientation, 500)
  setTimeout(checkOrientation, 1500)
  setTimeout(checkOrientation, 3000)
  
  // 监听强制重载事件
  window.addEventListener('forceAppReload', forcePageReload)
})

onUnmounted(() => {
  console.log('App组件卸载')
  
  // 清理所有事件监听器
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('orientationchange', handleOrientationChange)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('forceAppReload', forcePageReload)
})
</script>




<style scoped>
* {
  all: unset;
  box-sizing: border-box;
  display: block;
}

/* 强制横屏显示 - 稳定版本 */
@media screen and (max-aspect-ratio: 1/1) {
  /* 竖屏状态 */
  html, body {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
  }
  
  #app {
    width: 100vh;
    height: 100vw;
    transform: rotate(90deg) translateY(-100%);
    transform-origin: top left;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
    will-change: transform;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }
}

/* 横屏状态 */
@media screen and (min-aspect-ratio: 1/1) {
  html, body {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }
  
  #app {
    width: 100%;
    height: 100%;
    transform: none;
    will-change: auto;
  }
}

/* 竖屏遮罩样式 */
.portrait-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #2d2e32 0%, #232126 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.5s ease-out;
}

.overlay-content {
  text-align: center;
  color: white;
  padding: 40px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 320px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.rotate-icon {
  font-size: 64px;
  margin-bottom: 25px;
  animation: rotatePulse 2s infinite;
}

.overlay-content h2 {
  font-size: 28px;
  margin-bottom: 20px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.overlay-content p {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 30px;
  opacity: 0.9;
}



@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes rotatePulse {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(10deg) scale(1.1); }
  50% { transform: rotate(0deg) scale(1); }
  75% { transform: rotate(-10deg) scale(1.1); }
  100% { transform: rotate(0deg) scale(1); }
}

/* Canvas容器样式 */
.fullscreen-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>
