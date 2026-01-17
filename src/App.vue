<template>
  <!-- 3D场景容器 -->
  <div id="three-container" class="fullscreen-container"></div>
  
  <!-- 透明标题+时间浮层 -->
  <div class="title-overlay">
    <!-- 左侧标题 -->
    <div class="page-title">浒墅 Twin</div>
    <!-- 右上角时间区域 -->
    <div class="time-wrapper">
      <!-- 左侧24时制时间 -->
      <div class="time-hour" id="time-hour"></div>
      <!-- 分隔竖线 -->
      <div class="time-divider"></div>
      <!-- 右侧星期+日期 -->
      <div class="time-info">
        <div class="time-week" id="time-week"></div>
        <div class="time-date" id="time-date"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// ========== 全局常量（仅保留你指定的项） ==========
// 颜色常量（放在一起）
const SCENE_BACKGROUND = 0xf0f8ff // 场景背景色
const GRASS_COLOR = 0xbdd8b8     // 草地颜色

// 核心位置/缩放常量
const CAMERA_POSITION = { x: 6, y: 3, z: 8 } // 相机位置
const MODEL_SCALE = 0.3                     // 模型缩放（单值常量）
const MODEL_POSITION = { x: 1, y: 0, z: 15 } // 模型位置（组合常量）

// 旋转参数常量
const ROTATE_SPEED = 0.001
const ROTATE_IDLE_DELAY = 10000
const ROTATE_INITIAL_ANGLE = 0

// ========== 核心变量 ==========
let scene, camera, renderer, controls
let clockTimer = null
let angle = ROTATE_INITIAL_ANGLE
let isRotating = true // 默认开启旋转
let idleTimer = null
let containerEl = null
let resetIdleTimer = null

// 初始化Three.js
const initThree = () => {
  containerEl = document.getElementById('three-container')

  // 1. 创建场景（使用全局背景色）
  scene = new THREE.Scene()
  scene.background = new THREE.Color(SCENE_BACKGROUND)

  // 2. 创建相机（使用全局相机位置）
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  )
  camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z)

  // 3. 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  containerEl.appendChild(renderer.domElement)

  // 4. 控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.target = new THREE.Vector3(0, 0, 0)

  // 5. 光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambientLight)

  // 草地（尺寸/位置硬编码，仅颜色用全局常量）
  const grassGeometry = new THREE.PlaneGeometry(10000, 10000)
  const grassMaterial = new THREE.MeshLambertMaterial({
    color: GRASS_COLOR,
    side: THREE.DoubleSide
  })
  const grassPlane = new THREE.Mesh(grassGeometry, grassMaterial)
  grassPlane.rotation.x = -Math.PI / 2
  grassPlane.position.y = 0
  scene.add(grassPlane)

  // 加载模型（使用全局缩放/位置，旋转Y轴硬编码）
  const loader = new GLTFLoader()
  loader.load(
    '/models/garden.glb',
    (gltf) => {
      const model = gltf.scene
      model.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE) // 全局缩放常量
      model.position.set(MODEL_POSITION.x, MODEL_POSITION.y, MODEL_POSITION.z) // 全局位置常量
      model.rotation.y = Math.PI / 2; // 旋转Y轴硬编码（按你要求移除全局配置）
      scene.add(model)
      console.log('glb模型加载成功！')
    },
    (xhr) => {},
    (error) => {
      console.error('模型加载失败：', error)
      alert('glb模型加载失败，请检查文件路径！')
    }
  )

  // ========== 鼠标交互逻辑 ==========
  resetIdleTimer = () => {
    isRotating = false
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      isRotating = true
      // 如需恢复初始点位，取消注释：
      // angle = ROTATE_INITIAL_ANGLE
    }, ROTATE_IDLE_DELAY)
  }

  containerEl.addEventListener('mousedown', resetIdleTimer)

  // 窗口自适应
  window.addEventListener('resize', onWindowResize)
  // 渲染循环
  animate()
}

// 渲染循环
const animate = () => {
  requestAnimationFrame(animate)

  if (isRotating) {
    angle -= ROTATE_SPEED
    const radius = Math.sqrt(CAMERA_POSITION.x * CAMERA_POSITION.x + CAMERA_POSITION.z * CAMERA_POSITION.z)
    camera.position.x = Math.cos(angle) * radius
    camera.position.z = Math.sin(angle) * radius
    camera.position.y = CAMERA_POSITION.y
    camera.lookAt(0, 0, 0)
  }

  controls.update()
  renderer.render(scene, camera)
}

// 窗口自适应
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 时钟逻辑
const initClock = () => {
  const weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const updateTime = () => {
    const now = new Date()
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const second = String(now.getSeconds()).padStart(2, '0')
    const hourText = `${hour}:${minute}:${second}`
    const weekText = weekMap[now.getDay()]
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const dateText = `${year}-${month}-${day}`

    document.getElementById('time-hour').textContent = hourText
    document.getElementById('time-week').textContent = weekText
    document.getElementById('time-date').textContent = dateText
  }
  updateTime()
  clockTimer = setInterval(updateTime, 1000)
}

// 挂载/卸载
onMounted(() => {
  initThree()
  initClock()
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  clearTimeout(idleTimer)
  if (clockTimer) clearInterval(clockTimer)
  if (containerEl && resetIdleTimer) {
    containerEl.removeEventListener('mousedown', resetIdleTimer)
  }
  renderer.dispose()
  scene.clear()
})
</script>

<style scoped>
/* 全屏3D容器 */
.fullscreen-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  z-index: 1; /* 低于浮层 */
}

/* 透明标题浮层 */
.title-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  padding: 20px 40px;
  box-sizing: border-box;
  z-index: 10; /* 高于3D场景 */
  pointer-events: none; /* 不拦截3D交互 */
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), transparent);
  display: flex;
  align-items: center;
}

/* 左侧标题样式 */
.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
  margin-right: auto; /* 标题靠左，时间区域靠右 */
}

/* 右上角时间容器（核心：垂直居中对齐） */
.time-wrapper {
  display: flex;
  align-items: center;
  gap: 10px; /* 元素间间距 */
  height: 48px; /* 总高度，匹配右侧两个元素的总高度 */
}

/* 左侧24时制时间 */
.time-hour {
  font-size: 36px; /* 字体高度匹配右侧两个元素总高度 */
  color: #ffffff;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.8);
  line-height: 48px; /* 行高等于容器高度，垂直居中 */
}

/* 分隔竖线 */
.time-divider {
  width: 2px;
  height: 48px; /* 竖线高度等于时间容器高度 */
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 1px;
}

/* 右侧星期+日期容器 */
.time-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 40px; /* 总高度与左侧时间行高一致 */
}

/* 星期样式 */
.time-week {
  font-size: 18px;
  color: #ffffff;text-align: left;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
}

/* 日期样式 */
.time-date {
  font-size: 16px;
  color: #ffffff;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }
  .time-hour {
    font-size: 20px;
  }
  .time-week {
    font-size: 14px;
  }
  .time-date {
    font-size: 12px;
  }
  .time-wrapper {
    height: 36px;
  }
  .time-divider {
    height: 36px;
  }
}
</style>