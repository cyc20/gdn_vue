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

// 核心变量
let scene, camera, renderer, controls
// 时间更新定时器
let clockTimer = null
let angle = 0 // 相机旋转角度（初始为0）
let isRotating = true // 旋转开关
let idleTimer = null // 闲置计时器
const IDLE_DELAY = 10000 // 10秒闲置触发旋转
// 初始化Three.js
const initThree = () => {
  const container = document.getElementById('three-container')

  // 1. 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f8ff) // 浅蓝背景

  // 2. 创建相机（透视相机，适配大屏）
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  )
  camera.position.set(6,3, 8);   //相机位置xyz

  // 3. 创建渲染器（抗锯齿）
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  // 4. 鼠标交互控制器（旋转/缩放/平移）
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true // 阻尼效果，更顺滑
  controls.dampingFactor = 0.05
  controls.target = new THREE.Vector3(0, 0, 0); //改变初始观察点




  // 5. 基础光源（保证模型可见）
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambientLight)

// ========== 新增：创建草地平面 ==========
const grassGeometry = new THREE.PlaneGeometry(10000, 10000) // 平面大小（根据模型尺寸调整）
const grassMaterial = new THREE.MeshLambertMaterial({
  color: 0xbdd8b8, // 草绿色
  side: THREE.DoubleSide // 双面可见
})
const grassPlane = new THREE.Mesh(grassGeometry, grassMaterial)
grassPlane.rotation.x = -Math.PI / 2 // 旋转成水平（默认是垂直的）
grassPlane.position.y = 0 // 平面高度（设为模型底部高度，防止穿模）
scene.add(grassPlane)
// ========== 结束 ==========

  // 6. 加载glb模型（核心：单文件，无依赖）
  const loader = new GLTFLoader()
  loader.load(
    '/models/garden.glb', // glb文件路径
    (gltf) => {
      const model = gltf.scene
      model.scale.set(0.3, 0.3, 0.3) // 适配模型原始缩放
      model.position.set(1, 0, 15)    // 模型居中
      model.rotation.y = Math.PI / 2; //模型改变朝向
      scene.add(model)
      console.log('glb模型加载成功！')
    },
    (xhr) => {
      // console.log(`加载进度：${Math.round((xhr.loaded / xhr.total) * 100)}%`)
    },
    (error) => {
      console.error('模型加载失败：', error)
      alert('glb模型加载失败，请检查文件路径！')
    }
  )

  // 7. 窗口自适应
  window.addEventListener('resize', onWindowResize)
  // 8. 渲染循环
  animate()
}

// 渲染循环
const animate = () => {
  requestAnimationFrame(animate)

  // ========== 新增：相机自动旋转逻辑 ==========
  angle -= 0.001 // 旋转速度（值越小越慢，可调整）
  // 保持相机到模型的距离不变（半径=√(6²+8²)=10），只改变水平角度
  const radius = Math.sqrt(6*6 + 8*8) // 相机到模型的水平距离（固定10）
  camera.position.x = Math.cos(angle) * radius // 动态X坐标
  camera.position.z = Math.sin(angle) * radius // 动态Z坐标
  camera.position.y = 3 // 固定高度（保持最佳观赏高度）
  // 始终看向模型中心(0,0,0)
  camera.lookAt(0, 0, 0)
  // ========== 结束 ==========

  controls.update() // 更新控制器

  renderer.render(scene, camera) // 渲染场景
}

// 窗口大小自适应
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 初始化实时时钟（拆分时间/星期/日期）
const initClock = () => {
  // 星期映射表
  const weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  
  // 格式化时间函数
  const updateTime = () => {
    const now = new Date()
    // 1. 24时制时间（HH:MM:SS）
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const second = String(now.getSeconds()).padStart(2, '0')
    const hourText = `${hour}:${minute}:${second}`

    // 2. 星期几
    const weekText = weekMap[now.getDay()]

    // 3. 日期（YYYY-MM-DD）
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const dateText = `${year}-${month}-${day}`

    // 更新DOM
    document.getElementById('time-hour').textContent = hourText
    document.getElementById('time-week').textContent = weekText
    document.getElementById('time-date').textContent = dateText
  }

  // 立即更新一次
  updateTime()
  // 每秒更新
  clockTimer = setInterval(updateTime, 1000)
}

// 组件挂载时初始化
onMounted(() => {
  initThree()
  initClock()
})

// 组件卸载时销毁资源
onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  renderer.dispose()
  scene.clear()
  if (clockTimer) clearInterval(clockTimer)
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