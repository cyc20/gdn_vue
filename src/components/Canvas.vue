<template>
    <div id="three-container" class="fullscreen-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { SceneControls } from '../utils/Controls'


// ========== 组件专属常量 ==========
const SKY_COLOR = 0xffffff
const GROUND_COLOR = 0xffffff
const GROUND_HEIGHT = -0.35
const GROUND_SIZE = 10000
const MODEL_SCALE = 0.3
const MODEL_POSITION = { x: 1, y: 0, z: 15 }
const CAMERA_TARGET = { x: 0, y: 0, z: 0 }
const CAMERA_POSITION = { x: 6, y: 8, z: 8 }

// ========== 组件核心变量 ==========
let scene, camera, renderer
let sceneControls = null
let containerEl = null
let isInitialized = false
let cleanupFunctions = []
let reinitTimer = null

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
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
    loader.load(
      '/models/garden.glb',
      (gltf) => {
        try {
          const model = gltf.scene
          model.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE)
          model.position.set(MODEL_POSITION.x, MODEL_POSITION.y, MODEL_POSITION.z)
          model.rotation.y = Math.PI / 2
          scene.add(model)
          console.log('glb模型加载成功！')
        } catch (error) {
          console.error('模型添加到场景失败:', error)
        }
      },
      undefined,
      (error) => {
        console.error('模型加载失败：', error)
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
      
      // 存储清理函数
      cleanupFunctions.push(() => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('forceCanvasReinit', handleForceReinit)
        
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
</style>