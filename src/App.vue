<template>
  <!-- 3D场景容器 -->
  <div id="three-container" class="fullscreen-container"></div>
  
  <!-- header区域 -->
  <div class="header">
      <h1>浒墅关先进制造区 数字孪生系统</h1>
      
      <div class="info" >
        <p class="ZYXX" style="font-size: 3vh">「智园新序」</p>
        <p style="font-size: 1.5vh;margin-bottom: 0.6vh;">苏州 · 虎丘区</p>
      </div>

      <div class="time">
        <p id="time-hour" style="font-size: 3vh;"></p>
        <span style="width: 1px;height: 3.2vh;background: #FFFC;margin: 0 1vh;"/>
        <div style="font-size: 1.5vh;line-height: 1.2;text-align: left;">
          <p id="time-week"></p>
          <p id="time-date"></p>
        </div>
      </div>

  </div>

  <!-- 左侧内容区域 -->
  <div class="content-panel left-panel">
    <div class="panel-content">
      {{ panelContent.left }}
    </div>
  </div>

  <!-- 右侧内容区域 -->
  <div class="content-panel right-panel">
    <div class="panel-content">
      {{ panelContent.right }}
    </div>
  </div>

  <div class="footer">
    <ul>
      <li><p>综合态势</p><img src="./assets/img/icon1.png" style="width: 100%;"><div class="mask" @click="switchNav(0)"></div></li>
      <li><p>园测数据</p><img src="./assets/img/icon2.png" style="width: 100%;"><div class="mask" @click="switchNav(1)"></div></li>
      <li><p>安防监控</p><img src="./assets/img/icon3.png" style="width: 100%;"><div class="mask" @click="switchNav(2)"></div></li>
      <li><p>能源管理</p><img src="./assets/img/icon4.png" style="width: 100%;"><div class="mask" @click="switchNav(3)"></div></li>
    </ul>
    <img src="./assets/img/footer.png" style="width: 100%;transform: scale(0.8);padding-left: 0.3vw;">
  </div>
</template>
<!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
<!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
<!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
<!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
<!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
<style scoped>
* {all:unset;box-sizing: border-box;}
p {display: block;}


/* ////////////////////////////////////////////// 全屏3D容器 ////////////////////////////////////////////// */
.fullscreen-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 1; /* 低于浮层 */
}
.fullscreen-container::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 70%, rgba(0,0,0,0.2) 100%);
  pointer-events: none;
  z-index: 1;
}
/* ////////////////////////////////////////////// 顶部标题 ////////////////////////////////////////////// */
.header {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: flex-start;/* 垂直居中 */
  width: 100vw;
  height: 11vh;
  color: #127BD6;
  padding-bottom: 5vh;
  background: url(./assets/img/header.png) center repeat-x;
  mask-image: linear-gradient(to bottom,black 65%,transparent 100%);
  z-index: 10; /* 高于3D场景 */
  /*pointer-events: none; /* 不拦截3D交互 */
}
/* 标题 */
.header h1 {
  font-size: 3.6vh;
  font-weight: bold;
  color: transparent;
  margin: 0 auto;
  letter-spacing: 2px;
  background: linear-gradient(to bottom,#ffffff,hsl(209, 100%, 50%));
  background-clip: text;
  -webkit-background-clip: text;
}

/* 副标题 */
.header .info { 
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: flex-end;
  font-weight: bold;
  margin: 0.8vh 0 0 2vh;
}

.header .info .ZYXX { 
  font-family: "宋体", SimSun, "Songti SC", "Noto Serif CJK SC", "WenQuanYi Song", Arial, serif;
  color: transparent;
  background: linear-gradient(to bottom,#ffffff,hsl(209, 100%, 50%));
  background-clip: text;
  -webkit-background-clip: text;
}

/* 时间 */
.header .time {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  margin: 0.8vh 2vh 0 0;
}


/* ////////////////////////////////////////////// 左右面板 ////////////////////////////////////////////// */
.content-panel {
  position: fixed;
  top: 7vh; /* 修改：避开新标题区域高度 */
  bottom: 3vh; /* 避开底部导航栏 */
  width: 20vw; /* 面板宽度 */
  background: rgba(18, 123, 214, 0.5);
  border-radius: 8px 0 0 8px; /* 左侧面板：右下和右上无圆角 */
  padding: 20px;
  box-sizing: border-box;
  z-index: 10; /* 高于3D场景 */
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  pointer-events: auto; /* 开启交互 */
  transition: transform 0.3s ease; /* 添加滑动动画 */
}

/* 左侧面板 - 居中靠左 */
.left-panel {
  left: 0; /* 修改：直接贴到左边 */
  border-radius: 0 8px 8px 0; /* 左侧面板：左边框无圆角 */
  transform: translateX(v-bind(leftPanelTransform)); /* 动态控制左侧板位置 */
}

/* 右侧面板 - 居中靠右 */
.right-panel {
  right: 0; /* 修改：直接贴到右边 */
  border-radius: 8px 0 0 8px; /* 右侧面板：右边框无圆角 */
  transform: translateX(v-bind(rightPanelTransform)); /* 动态控制右侧板位置 */
}

/* 面板内容样式 */
.panel-content {
  color: #ffffff;
  font-size: 16px;
  line-height: 1.6;
  height: 100%;
  overflow-y: auto; /* 内容超出时滚动 */
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}




/* ////////////////////////////////////////////// 底部导航栏 ////////////////////////////////////////////// */
.footer{
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: end;
  width: 100vw;
  z-index: 10; /* 高于3D场景 */
}

.footer ul{ 
  display: flex;
  width: fit-content;
  margin: 0 auto;
  gap: 3vw;
}
.footer ul li{
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 6vw;
  color: #ffffff;
  font-size: 1vw;  
}
.footer ul li .mask{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

</style>
<!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
<!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
<!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
<!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
<!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// ========== 导航栏和面板相关 ==========
// 导航栏选项配置
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

// 当前激活的导航项索引(范围0-3)
const activeNav = ref(0)

// 面板显示状态
const showPanels = ref(true)

// 切换导航项方法
const switchNav = (index) => {
  // 如果点击的是当前已激活的导航项，则切换面板显示状态
  if (activeNav.value === index) {
    showPanels.value = !showPanels.value
  } else {
    activeNav.value = index
    showPanels.value = true // 点击其他导航项时确保面板显示
  }
  panelContent.value.left = navItems.value[index].left
  panelContent.value.right = navItems.value[index].right
}

// 面板内容数据
const panelContent = ref({
  left: navItems.value[0].left,
  right: navItems.value[0].right
})

// 计算左右面板的位置变换
const leftPanelTransform = computed(() => {
  return showPanels.value ? '0' : '-100%'
})

const rightPanelTransform = computed(() => {
  return showPanels.value ? '0' : '100%'
})









// ========== 全局常量（仅保留你指定的项） ==========
// 颜色常量（放在一起）
const SKY_COLOR = 0x1a1a2e // 场景背景色
const GROUND_COLOR = 0xbdd8b8     // 草地颜色
const GROUND_HEIGHT = -0.35

// 核心位置/缩放常量
const MODEL_SCALE = 0.3 // 添加模型缩放常量
const MODEL_POSITION = { x: 1, y: 0, z: 15 } // 模型位置（组合常量）
const CAMERA_TARGET = { x: 0, y: 0, z: 0 } // 添加相机目标点常量
const CAMERA_POSITION = { x: 6, y: 3, z: 8 } // 相机位置

// 旋转参数常量
const ROTATE_SPEED = 0.001
const IDLE_DELAY = 3000
const ROTATE_INITIAL_ANGLE = 0










// ========== 核心变量 ==========
let scene, camera, renderer, controls
let clockTimer = null
let angle = ROTATE_INITIAL_ANGLE
let containerEl = null

// 视角过渡相关变量
let isTransitioning = false
let transitionStartTime = null
let startPosition = null
let endPosition = null
let startTarget = null
let endTarget = null

// 交互变量
let isRotating = true // 默认开启旋转
let isInteracting = false
let idleTimer = null

// 初始化Three.js
const initThree = () => {
  containerEl = document.getElementById('three-container')

  // 1. 创建场景（使用全局背景色）
  scene = new THREE.Scene()
  scene.background = new THREE.Color(SKY_COLOR)

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
  // 设置控制器的目标点
  controls.target.set(CAMERA_TARGET.x, CAMERA_TARGET.y, CAMERA_TARGET.z)
  
  // 设置视角限制，禁止视角的下半圆角度
  controls.minPolarAngle = 0 // 最小极角，0为正上方
  controls.maxPolarAngle = Math.PI / 2 // 最大极角，Math.PI/2为水平方向

  // 限制相机目标点Y坐标不低于0
  controls.addEventListener('change', () => {
    if (controls.target.y < 0) {
      controls.target.y = 0
    }
  })

  // 启用触摸控制
  controls.enableTouch = true

  // 5. 光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambientLight)

  // 草地（尺寸/位置硬编码，仅颜色用全局常量）
  const grassGeometry = new THREE.PlaneGeometry(1000, 1000)
  const grassMaterial = new THREE.MeshLambertMaterial({
    color: GROUND_COLOR,
    side: THREE.DoubleSide
  })
  const grassPlane = new THREE.Mesh(grassGeometry, grassMaterial)
  grassPlane.rotation.x = -Math.PI / 2
  grassPlane.position.y = GROUND_HEIGHT
  scene.add(grassPlane)

  // 加载模型（使用全局缩放/位置，旋转Y轴硬编码）
  const loader = new GLTFLoader()
  loader.load(
    '/models/garden.glb',
    (gltf) => {
      const model = gltf.scene
      // 设置模型缩放
      model.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE) // 全局缩放常量
      // 设置模型位置
      model.position.set(MODEL_POSITION.x, MODEL_POSITION.y, MODEL_POSITION.z) // 全局位置常量
      // 旋转Y轴
      model.rotation.y = Math.PI / 2; // 旋转Y轴硬编码（按你要求移除全局配置）
      
      // 添加模型到场景
      scene.add(model)
      console.log('glb模型加载成功！')
    },
    (xhr) => {},
    (error) => {
      console.error('模型加载失败：', error)
      alert('glb模型加载失败！可能原因：\n1. 文件不存在\n2. 网络\n3. 格式错误')
    }
  )

  // ========== 鼠标交互逻辑 ==========

  
  const resetIdleTimer = () => {
    isRotating = false
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      isRotating = true
    
      // 启动视角过渡动画
      startCameraTransition()
    }, IDLE_DELAY)
  }

  // 添加交互开始处理函数
  const handleInteractionStart = () => {
    isInteracting = true
    resetIdleTimer()
  }

  // 添加交互结束处理函数
  const handleInteractionEnd = () => {
    isInteracting = false
    resetIdleTimer()
  }

  
  // 添加鼠标移动和释放事件监听
  containerEl.addEventListener('mousedown', handleInteractionStart)
  containerEl.addEventListener('mouseup', handleInteractionEnd)
  containerEl.addEventListener('wheel', resetIdleTimer)
  // 为移动端添加触摸事件监听
  containerEl.addEventListener('touchstart', handleInteractionStart)
  containerEl.addEventListener('touchmove', handleInteractionStart)
  containerEl.addEventListener('touchend', handleInteractionEnd)

  // 窗口自适应
  window.addEventListener('resize', onWindowResize)
  // 渲染循环
  animate()
}

// 启动相机视角过渡动画
const startCameraTransition = () => {
  if (isTransitioning) return // 如果已经在过渡中，则返回
  
  isTransitioning = true
  transitionStartTime = Date.now()
  
  // 保存当前相机位置和目标
  startPosition = camera.position.clone()
  startTarget = controls.target.clone()
  
  // 计算目标位置
  angle = ROTATE_INITIAL_ANGLE
  const radius = Math.sqrt(CAMERA_POSITION.x * CAMERA_POSITION.x + CAMERA_POSITION.z * CAMERA_POSITION.z)
  endPosition = new THREE.Vector3(
    Math.cos(angle) * radius,
    CAMERA_POSITION.y,
    Math.sin(angle) * radius
  )
  endTarget = new THREE.Vector3(CAMERA_TARGET.x, CAMERA_TARGET.y, CAMERA_TARGET.z)
}

// 执行相机视角过渡
const updateCameraTransition = () => {
  if (!isTransitioning) return
  
  const elapsed = Date.now() - transitionStartTime
  const progress = Math.min(elapsed / 2000, 1)
  // 缓动函数的计算逻辑
  const easedProgress = progress < 0.5 ? 4 * progress * progress * progress : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1
  // 插值计算当前位置和目标
  camera.position.lerpVectors(startPosition, endPosition, easedProgress)
  controls.target.lerpVectors(startTarget, endTarget, easedProgress)
  
  // 如果过渡完成，停止过渡
  if (progress >= 1) {
    isTransitioning = false
  }
}

// 渲染循环
const animate = () => {
  requestAnimationFrame(animate)

  if (isRotating && !isTransitioning && !isInteracting) {
    angle -= ROTATE_SPEED
    const radius = Math.sqrt(CAMERA_POSITION.x * CAMERA_POSITION.x + CAMERA_POSITION.z * CAMERA_POSITION.z)
    camera.position.x = Math.cos(angle) * radius
    camera.position.z = Math.sin(angle) * radius
    camera.position.y = CAMERA_POSITION.y
    camera.lookAt(0, 0, 0)
  }
  
  // 更新相机过渡动画
  updateCameraTransition()

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
  
  // 确保DOM完全加载后初始化
  setTimeout(() => {
    onWindowResize()
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  clearTimeout(idleTimer)
  if (clockTimer) clearInterval(clockTimer)
  if (containerEl) {
    // 移除鼠标事件监听
    containerEl.removeEventListener('mousedown', handleInteractionStart)
    containerEl.removeEventListener('mousemove', handleInteractionStart)
    containerEl.removeEventListener('mouseup', handleInteractionEnd)
    containerEl.removeEventListener('wheel', resetIdleTimer)
    // 移除触摸事件监听
    containerEl.removeEventListener('touchstart', handleInteractionStart)
    containerEl.removeEventListener('touchmove', handleInteractionStart)
    containerEl.removeEventListener('touchend', handleInteractionEnd)
  }
  renderer.dispose()
  scene.clear()
})
</script>