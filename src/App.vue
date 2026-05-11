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
  :activeNav="activeNav" 
  :show-panels="showPanels"
  @nav-change="handleNavChange" 
></Footer>

<!-- 全屏切换按钮 - 全局浮动 -->
<button 
  class="fullscreen-toggle"
  @click="toggleFullscreen"
  :title="isFullscreen ? '全屏' : '全屏'"
>
  {{ isFullscreen ? '❐' : '⛶' }}
</button>

<!-- 音乐控制按钮 -->
<button 
  class="music-toggle"
  @click="toggleMusic"
  :title="isMusicPlaying ? '音乐' : '音乐'"
  style="font-size: 16px;"
>
  {{ isMusicPlaying ? '⏹' : '🎵' }}
</button>

<!-- 自动旋转控制按钮 -->
<button 
  class="autorotate-toggle"
  @click="toggleAutoRotate"
  :title="isAutoRotateEnabled ? '自动旋转' : '自动旋转'"
>
  {{ isAutoRotateEnabled ? '🔄' : '🚫' }}
</button>

<!-- 模型切换按钮 -->
<button 
  class="model-toggle"
  @click="toggleModel"
  :title="currentModel === '1' ? '海边别墅' : '116号建筑'"
>
  {{ currentModel === '1' ? '🏠' : '🏢' }}
</button>

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
const isFullscreen = ref(false) // 全屏状态
const isMusicPlaying = ref(false) // 音乐播放状态
const isAutoRotateEnabled = ref(true) // 自动旋转状态（默认开启）
const currentModel = ref('2') // 当前模型ID（默认模型2）
let audioElement = null // 音频元素引用

// 从localStorage恢复自动旋转状态
const savedAutoRotate = localStorage.getItem('autoRotateEnabled')
if (savedAutoRotate !== null) {
  isAutoRotateEnabled.value = savedAutoRotate === 'true'
}

// 音乐控制功能
const toggleMusic = () => {
  // 创建音频元素（如果不存在）
  if (!audioElement) {
    // 使用public目录下的音乐文件
    audioElement = new Audio('/music/采耳的园林.ogg')
    audioElement.loop = true // 循环播放
    audioElement.volume = 0.3 // 设置音量
  }
  
  if (!isMusicPlaying.value) {
    // 播放音乐
    audioElement.play()
      .then(() => {
        isMusicPlaying.value = true
        console.log('音乐开始播放')
      })
      .catch(error => {
        console.error('音乐播放失败:', error)
        // 可能是用户未交互，尝试静音播放
        audioElement.muted = true
        audioElement.play().then(() => {
          isMusicPlaying.value = true
          console.log('音乐静音播放')
        })
      })
  } else {
    // 暂停音乐
    audioElement.pause()
    isMusicPlaying.value = false
    console.log('音乐暂停')
  }
}

// 自动旋转控制功能
const toggleAutoRotate = () => {
  isAutoRotateEnabled.value = !isAutoRotateEnabled.value
  console.log(`自动旋转状态: ${isAutoRotateEnabled.value ? '开启' : '暂停'}`)
  
  // 保存状态到localStorage
  localStorage.setItem('autoRotateEnabled', String(isAutoRotateEnabled.value))
  
  // 发送事件到Canvas组件
  window.dispatchEvent(new CustomEvent('toggleAutoRotate', { 
    detail: { enabled: isAutoRotateEnabled.value } 
  }))
}

// 模型切换功能
const toggleModel = () => {
  // 切换模型（1和2之间切换）
  currentModel.value = currentModel.value === '1' ? '2' : '1'
  const modelName = currentModel.value === '1' ? '海边别墅' : '116号建筑'
  console.log(`模型切换: ${modelName}`)
  
  // 发送事件到Canvas组件
  window.dispatchEvent(new CustomEvent('switchModel', { 
    detail: { modelId: currentModel.value } 
  }))
}

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

// 监听竖屏状态变化啊
watch(isMobilePortrait, (newVal) => {
  showPortraitOverlay.value = newVal
  console.log(`竖屏状态变化: ${newVal}`)
})

// 生命周期钩子
onMounted(() => {
  console.log('=== APP组件挂载开始 ===')
  detectEnvironment()
  
  // 检测按钮元素是否存在
  setTimeout(() => {
    const fullscreenBtn = document.querySelector('.fullscreen-toggle')
    const musicBtn = document.querySelector('.music-toggle')
    
    console.log('=== 按钮元素检测 ===')
    console.log('全屏按钮存在:', !!fullscreenBtn)
    console.log('音乐按钮存在:', !!musicBtn)
    
    if (fullscreenBtn) {
      console.log('全屏按钮样式:', getComputedStyle(fullscreenBtn))
      console.log('全屏按钮位置:', fullscreenBtn.getBoundingClientRect())
      console.log('全屏按钮HTML:', fullscreenBtn.outerHTML)
    }
    
    if (musicBtn) {
      console.log('音乐按钮样式:', getComputedStyle(musicBtn))
      console.log('音乐按钮位置:', musicBtn.getBoundingClientRect())
      console.log('音乐按钮HTML:', musicBtn.outerHTML)
    }
    
    // 检测所有fixed定位元素
    const fixedElements = document.querySelectorAll('[style*="fixed"], *[class*="fixed"]')
    console.log('=== Fixed定位元素检测 ===')
    console.log('找到fixed元素数量:', fixedElements.length)
    fixedElements.forEach((el, index) => {
      console.log(`Fixed元素${index}:`, {
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        style: el.style.cssText,
        computedStyle: getComputedStyle(el).position
      })
    })
    
    // 检测CSS规则
    console.log('=== CSS规则检测 ===')
    console.log('样式表数量:', document.styleSheets.length)
    Array.from(document.styleSheets).forEach((sheet, index) => {
      try {
        console.log(`样式表${index}:`, sheet.href || '内联样式')
        if (sheet.cssRules) {
          const fullscreenRules = Array.from(sheet.cssRules).filter(rule => 
            rule.selectorText && (rule.selectorText.includes('fullscreen') || rule.selectorText.includes('music'))
          )
          if (fullscreenRules.length > 0) {
            console.log(`包含目标选择器的规则:`, fullscreenRules)
          }
        }
      } catch (e) {
        console.log(`样式表${index}无法访问:`, e.message)
      }
    })
    
    // 检测z-index情况
    console.log('=== Z-index层级检测 ===')
    const allElements = document.querySelectorAll('*')
    const zIndexElements = Array.from(allElements).filter(el => {
      const style = getComputedStyle(el)
      return style.zIndex !== 'auto' && parseInt(style.zIndex) > 1000
    })
    
    console.log('高z-index元素数量:', zIndexElements.length)
    zIndexElements.slice(0, 10).forEach((el, index) => {
      console.log(`高z-index元素${index}:`, {
        tagName: el.tagName,
        className: el.className,
        zIndex: getComputedStyle(el).zIndex,
        position: getComputedStyle(el).position
      })
    })
    
  }, 1000)
  
  // 初始检测
  setTimeout(() => {
    checkOrientation()
    isInitializing.value = false
    
    // 同步初始自动旋转状态到Canvas组件
    window.dispatchEvent(new CustomEvent('toggleAutoRotate', { 
      detail: { enabled: isAutoRotateEnabled.value } 
    }))
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
  
  // 定期检测按钮状态
  setInterval(() => {
    const fullscreenBtn = document.querySelector('.fullscreen-toggle')
    const musicBtn = document.querySelector('.music-toggle')
    console.log('=== 定期状态检查 ===', new Date().toLocaleTimeString())
    console.log('全屏按钮:', fullscreenBtn ? '存在' : '缺失')
    console.log('音乐按钮:', musicBtn ? '存在' : '缺失')
    
    if (fullscreenBtn) {
      const rect = fullscreenBtn.getBoundingClientRect()
      console.log('全屏按钮可见性:', {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        isVisible: rect.width > 0 && rect.height > 0
      })
    }
  }, 5000)
})

onUnmounted(() => {
  console.log('=== APP组件卸载 ===')
  console.log('清理所有事件监听器')
  
  // 清理所有事件监听器
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('orientationchange', handleOrientationChange)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('forceAppReload', forcePageReload)
})

// 全屏切换功能
const toggleFullscreen = () => {
  if (isFullscreen.value) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}

// 监听全屏状态变化
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = document.fullscreenElement !== null
  console.log(`全屏状态变化: ${isFullscreen.value}`)
})

// 网络和环境检测
const detectEnvironment = () => {
  console.log('=== 环境检测 ===')
  
  // 检测是否为本地环境
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === ''
  
  console.log('运行环境:', {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port,
    pathname: window.location.pathname,
    isLocalhost: isLocalhost
  })
  
  // 检测网络状态
  console.log('网络状态:', {
    onLine: navigator.onLine,
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : '不支持'
  })
  
  // 检测浏览器特性支持
  console.log('浏览器支持检测:', {
    requestFullscreen: !!document.documentElement.requestFullscreen,
    webkitRequestFullscreen: !!document.documentElement.webkitRequestFullscreen,
    msRequestFullscreen: !!document.documentElement.msRequestFullscreen,
    fullscreenEnabled: !!document.fullscreenEnabled,
    webkitFullscreenEnabled: !!document.webkitFullscreenEnabled
  })
  
  // 检测CSS支持
  console.log('CSS支持检测:', {
    backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
    supportsMethod: !!CSS.supports
  })
  
  // 检测Vue版本和构建信息
  console.log('Vue信息:', {
    version: typeof Vue !== 'undefined' ? Vue.version : '未知',
    devMode: typeof process !== 'undefined' ? process.env.NODE_ENV : '未知'
  })
}

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

/* 全屏切换按钮样式 */
.fullscreen-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  cursor: pointer;
  z-index: 10001;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.fullscreen-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.fullscreen-toggle:active {
  transform: scale(0.95);
}

/* 音乐控制按钮样式 */
.music-toggle {
  position: fixed;
  bottom: 20px;
  right: 70px; /* 距离右边70px，紧贴全屏按钮左侧（全屏按钮40px宽 + 10px间距） */
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  cursor: pointer;
  z-index: 10001;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.music-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.music-toggle:active {
  transform: scale(0.95);
}

/* 自动旋转控制按钮样式 */
.autorotate-toggle {
  position: fixed;
  bottom: 20px;
  right: 120px; /* 距离右边120px，在音乐按钮左侧 */
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  cursor: pointer;
  z-index: 10001;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.autorotate-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.autorotate-toggle:active {
  transform: scale(0.95);
}

/* 模型切换按钮样式 */
.model-toggle {
  position: fixed;
  bottom: 20px;
  right: 170px; /* 距离右边170px，在自动旋转按钮左侧 */
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  cursor: pointer;
  z-index: 10001;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.model-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.model-toggle:active {
  transform: scale(0.95);
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
