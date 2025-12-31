<template>
  <!-- 全屏容器，承载Three.js场景 -->
  <div id="three-container" class="fullscreen-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// 声明核心变量
let scene, camera, renderer, controls, loader

// 初始化Three.js场景
const initThree = () => {
  // 1. 获取全屏容器
  const container = document.getElementById('three-container')
  
  // 2. 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f8ff) // 背景色

  // 3. 创建相机（透视相机）
  camera = new THREE.PerspectiveCamera(
    75, // 视角
    window.innerWidth / window.innerHeight, // 宽高比
    0.1, // 近裁切面
    1000 // 远裁切面
  )
  camera.position.z = 5 // 相机位置

  // 4. 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true }) // 抗锯齿
  renderer.setSize(window.innerWidth, window.innerHeight) // 全屏尺寸
  renderer.shadowMap.enabled = true // 开启阴影
  container.appendChild(renderer.domElement)

  // 5. 添加轨道控制器（支持鼠标交互：旋转/缩放/平移）
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true // 阻尼效果，更顺滑
  controls.dampingFactor = 0.05

  // 6. 添加光源（让模型可见）
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8) // 环境光
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6) // 平行光
  directionalLight.position.set(5, 5, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // 7. 加载3D模型（替换为你的模型路径）
  loader = new GLTFLoader()
  // 示例：加载 glb/gltf 模型，替换路径为你自己的模型文件
  loader.load(
    // 模型路径（建议放在public/models目录下，比如public/models/garden.glb）
    '/models/garden.glb', 
    (gltf) => {
      // 模型加载成功后添加到场景
      const model = gltf.scene
      // 调整模型大小和位置（根据实际模型适配）
      model.scale.set(1, 1, 1) 
      model.position.set(0, 0, 0)
      scene.add(model)
      console.log('模型加载成功')
    },
    (xhr) => {
      // 加载进度
      console.log(`模型加载中：${(xhr.loaded / xhr.total) * 100}%`)
    },
    (error) => {
      // 加载失败处理
      console.error('模型加载失败：', error)
    }
  )

  // 8. 监听窗口大小变化，自适应调整
  window.addEventListener('resize', onWindowResize)

  // 9. 开始渲染循环
  animate()
}

// 渲染循环
const animate = () => {
  requestAnimationFrame(animate)
  controls.update() // 更新控制器
  renderer.render(scene, camera) // 渲染场景
}

// 窗口大小自适应
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 组件挂载时初始化
onMounted(() => {
  initThree()
})

// 组件卸载时销毁资源（防止内存泄漏）
onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  renderer.dispose()
  scene.clear()
})
</script>

<style scoped>
/* 全屏容器样式 */
.fullscreen-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>