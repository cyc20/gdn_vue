<template>
    <div id="three-container" class="fullscreen-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'



// ========== 全局常量==========
// 颜色常量（放在一起）
const SKY_COLOR = 0xffffff // 场景背景色
const GROUND_COLOR = 0xffffff     // 草地颜色
const GROUND_HEIGHT = -0.35
const GROUND_SIZE =10000

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


// ============================



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
        GROUND_SIZE
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
        (xhr) => { },
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

// 挂载/卸载
onMounted(() => {
    initThree()

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

<style scoped>
.fullscreen-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: 1;
    /* 低于浮层 */
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