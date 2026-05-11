<template>
    <div id="three-container" class="fullscreen-container">
        <!-- 加载进度条 -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-content">
                <div class="progress-bar-container">
                    <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
                </div>
                <span class="loading-text">{{ loadingText }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { SceneControls } from '../utils/Controls'

// ========== 模型配置 ==========
const CURRENT_MODEL = ref('2')

// 模型配置映射表
const MODEL_CONFIGS = {
  1: {
    path: '/models/海边别墅.glb',
    scale: 0.3,
    position: { x: 1, y: 0, z: 15 }
  },
  2: {
    path: '/models/116.glb',
    scale: 0.2,
    position: { x: -10, y: -0.3, z: -4 }
  }
}

// 获取当前模型配置
const getCurrentModelConfig = () => {
  return MODEL_CONFIGS[CURRENT_MODEL.value] || MODEL_CONFIGS['2']
}

// ========== 场景配置 ==========
const SKY_COLOR = 0xffffff
const GROUND_COLOR = 0xB9CFA9
const GROUND_HEIGHT = -0.5
const GROUND_SIZE = 10000

// ========== 相机配置 ==========
const CAMERA_TARGET = { x: 0, y: 0, z: 0 }
const CAMERA_POSITION = { x: 3, y: 4, z: 8 }






// ========== 组件核心变量 ==========
let scene, camera, renderer
let sceneControls = null
let containerEl = null
let isInitialized = false
let cleanupFunctions = []
let reinitTimer = null

// ========== 加载状态 ==========
const isLoading = ref(true)
const progressPercent = ref(0)
const loadingText = ref('正在加载场景...')

// ========== 强制重新初始化 ==========
const forceReinitialize = () => {
  console.log('Canvas收到强制重载指令')
  
  // 清除之前的定时器
  if (reinitTimer) {
    clearTimeout(reinitTimer)
  }
  
  // 分阶段重初始化
  reinitTimer = setTimeout(() => {
    destroyScene()
  }, 50)
  
  reinitTimer = setTimeout(() => {
    initializeScene()
  }, 200)
}

// ========== 销毁场景 ==========
const destroyScene = () => {
  console.log('销毁Three.js场景')
  
  try {
    // 清理控制类
    if (sceneControls) {
      sceneControls.dispose()
      sceneControls = null
    }
    
    // 清理渲染器
    if (renderer) {
      renderer.dispose()
      // 移除DOM元素
      if (containerEl) {
        try {
          containerEl.removeChild(renderer.domElement)
        } catch (e) {
          console.warn('移除渲染器DOM元素失败:', e)
        }
      }
      renderer = null
    }
    
    // 清理场景
    if (scene) {
      scene.clear()
      scene = null
    }
    
    // 清理相机
    camera = null
    
    isInitialized = false
    console.log('场景销毁完成')
  } catch (error) {
    console.error('场景销毁出错:', error)
  }
}

// ========== 初始化场景 ==========
const initializeScene = () => {
  console.log('初始化Three.js场景')
  
  try {
    // 获取容器
    containerEl = document.getElementById('three-container')
    if (!containerEl) {
      console.error('未找到three-container容器')
      return
    }

    // 创建场景
    scene = new THREE.Scene()
    scene.background = new THREE.Color(SKY_COLOR)

    // 创建相机
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      GROUND_SIZE
    )
    camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z)
    camera.lookAt(CAMERA_TARGET.x, CAMERA_TARGET.y, CAMERA_TARGET.z)

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    updateRendererSize()
    containerEl.appendChild(renderer.domElement)

    // 创建控制类
    sceneControls = new SceneControls(camera, renderer, containerEl)

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    directionalLight.position.set(10, 20, 15)
    scene.add(directionalLight)

    // 添加草地
    const grassGeometry = new THREE.PlaneGeometry(1000, 1000)
    const grassMaterial = new THREE.MeshLambertMaterial({
      color: GROUND_COLOR,
      side: THREE.DoubleSide
    })
    const grassPlane = new THREE.Mesh(grassGeometry, grassMaterial)
    grassPlane.rotation.x = -Math.PI / 2
    grassPlane.position.y = GROUND_HEIGHT
    scene.add(grassPlane)

    // 加载模型
    const loader = new GLTFLoader()
    const modelConfig = getCurrentModelConfig()
    loader.load(
      modelConfig.path,
      (gltf) => {
        try {
          const model = gltf.scene
          model.scale.set(modelConfig.scale, modelConfig.scale, modelConfig.scale)
          model.position.set(modelConfig.position.x, modelConfig.position.y, modelConfig.position.z)
          model.rotation.y = Math.PI / 2
          scene.add(model)
          console.log('glb模型加载成功！')
          
          // 模型加载成功，隐藏加载进度条
          progressPercent.value = 100
          loadingText.value = '加载完成'
          setTimeout(() => {
            isLoading.value = false
          }, 300)
        } catch (error) {
          console.error('模型添加到场景失败:', error)
          loadingText.value = '加载失败，请刷新重试'
        }
      },
      (xhr) => {
        // 加载进度回调
        const percent = Math.round((xhr.loaded / xhr.total) * 100)
        progressPercent.value = percent
        loadingText.value = `正在加载模型... ${percent}%`
      },
      (error) => {
        console.error('模型加载失败：', error)
        loadingText.value = '加载失败，请刷新重试'
      }
    )

    isInitialized = true
    console.log('场景初始化完成')
    
    // 启动渲染循环
    animate()
    
  } catch (error) {
    console.error('场景初始化出错:', error)
  }
}

// ========== 更新渲染器尺寸 ==========
const updateRendererSize = () => {
  if (renderer && containerEl) {
    try {
      // 多种方法获取尺寸
      let width, height
      
      // 方法1: getBoundingClientRect
      const rect = containerEl.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        width = rect.width
        height = rect.height
      } 
      // 方法2: offset
      else if (containerEl.offsetWidth > 0 && containerEl.offsetHeight > 0) {
        width = containerEl.offsetWidth
        height = containerEl.offsetHeight
      }
      // 方法3: 视口
      else {
        width = window.innerWidth
        height = window.innerHeight
      }
      
      // 验证尺寸合理性
      width = Math.max(100, Math.min(width, window.screen.width * 2))
      height = Math.max(100, Math.min(height, window.screen.height * 2))
      
      renderer.setSize(width, height)
      
      if (camera) {
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
      
      console.log(`渲染器尺寸更新: ${width}x${height}`)
    } catch (error) {
      console.warn('尺寸更新失败，使用默认值:', error)
      // 安全回退
      const safeWidth = Math.min(window.innerWidth, 1920)
      const safeHeight = Math.min(window.innerHeight, 1080)
      renderer.setSize(safeWidth, safeHeight)
      if (camera) {
        camera.aspect = safeWidth / safeHeight
        camera.updateProjectionMatrix()
      }
    }
  }
}

// ========== 渲染循环 ==========
const animate = () => {
  if (!isInitialized) return
  
  requestAnimationFrame(animate)

  try {
    if (sceneControls) {
      sceneControls.updateAutoRotate()
      sceneControls.updateCameraTransition()
      sceneControls.updateOrbitControls()
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  } catch (error) {
    console.warn('渲染循环出错:', error)
  }
}

// ========== 事件处理函数 ==========
const handleResize = () => {
  // 防抖动处理
  if (window.resizeDebounceTimer) {
    clearTimeout(window.resizeDebounceTimer)
  }
  
  window.resizeDebounceTimer = setTimeout(() => {
    updateRendererSize()
    if (sceneControls) {
      sceneControls.onWindowResize()
    }
  }, 100)
}

const handleForceReinit = () => {
  forceReinitialize()
}

const handleToggleAutoRotate = (event) => {
  if (sceneControls) {
    sceneControls.setAutoRotate(event.detail.enabled)
    console.log(`Canvas收到自动旋转控制: ${event.detail.enabled ? '开启' : '暂停'}`)
  }
}

const handleSwitchModel = (event) => {
  const modelId = event.detail.modelId
  if (MODEL_CONFIGS[modelId]) {
    CURRENT_MODEL.value = modelId
    console.log(`Canvas收到模型切换指令: 切换到模型 ${modelId}`)
    forceReinitialize()
  } else {
    console.warn(`模型 ${modelId} 不存在`)
  }
}

// ========== Vue生命周期 ==========
onMounted(() => {
  console.log('Canvas组件挂载')
  
  nextTick(() => {
    // 延迟初始化确保DOM准备就绪
    setTimeout(() => {
      initializeScene()
      
      // 添加事件监听器
      window.addEventListener('resize', handleResize, { passive: true })
      window.addEventListener('forceCanvasReinit', handleForceReinit)
      window.addEventListener('toggleAutoRotate', handleToggleAutoRotate)
      window.addEventListener('switchModel', handleSwitchModel)
      
      // 存储清理函数
      cleanupFunctions.push(() => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('forceCanvasReinit', handleForceReinit)
        window.removeEventListener('toggleAutoRotate', handleToggleAutoRotate)
        window.removeEventListener('switchModel', handleSwitchModel)
        
        if (window.resizeDebounceTimer) {
          clearTimeout(window.resizeDebounceTimer)
        }
      })
      
    }, 300) // 增加延迟确保App.vue完成初始化
  })
})

onUnmounted(() => {
  console.log('Canvas组件卸载')
  
  // 执行所有清理函数
  cleanupFunctions.forEach(cleanup => {
    try {
      cleanup()
    } catch (error) {
      console.warn('清理函数执行出错:', error)
    }
  })
  cleanupFunctions = []
  
  // 销毁场景
  destroyScene()
  
  // 清理定时器
  if (reinitTimer) {
    clearTimeout(reinitTimer)
  }
})
</script>




<style scoped>
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
  perspective: 1000px;
  transform-style: preserve-3d;
}

.fullscreen-container::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.7) 100%);
  pointer-events: none;
  z-index: 1;
}

/* 加载进度条样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a1628 0%, #1a365d 50%, #0d1b2a 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  transition: opacity 0.3s ease;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 60px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.progress-bar-container {
  width: 300px;
  height: 8px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #06b6d4, #3b82f6);
  background-size: 200% 100%;
  border-radius: 4px;
  transition: width 0.2s ease;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.loading-text {
  color: #e0f2fe;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}
</style>