<template>
    <div id="three-container" class="fullscreen-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { SceneControls } from '../utils/Controls'


// ========== 组件专属常量（场景、模型相关）==========
const SKY_COLOR = 0xffffff // 场景背景色
const GROUND_COLOR = 0xffffff // 草地颜色
const GROUND_HEIGHT = -0.35
const GROUND_SIZE = 10000
const MODEL_SCALE = 0.3 // 模型缩放
const MODEL_POSITION = { x: 1, y: 0, z: 15 } // 模型位置
const CAMERA_TARGET = { x: 0, y: 0, z: 0 } // 相机目标点
const CAMERA_POSITION = { x: 6, y: 3, z: 8 } // 相机初始位置

// ========== 组件核心变量（场景、渲染器、控制实例）==========
let scene, camera, renderer
let sceneControls = null // 控制类实例
let containerEl = null

// ========== 初始化Three.js场景（组件专属）==========
const initThree = () => {
    // 1. 获取容器DOM
    containerEl = document.getElementById('three-container')
    if (!containerEl) {
        console.error('未找到three-container容器')
        return
    }

    // 2. 创建场景
    scene = new THREE.Scene()
    scene.background = new THREE.Color(SKY_COLOR)

    // 3. 创建相机
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        GROUND_SIZE
    )
    camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z)
    camera.lookAt(CAMERA_TARGET.x, CAMERA_TARGET.y, CAMERA_TARGET.z)

    // 4. 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerEl.appendChild(renderer.domElement)

    // 5. 实例化封装的控制类（传入相机、渲染器、容器，解耦依赖）
    sceneControls = new SceneControls(camera, renderer, containerEl)

    // 6. 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    // 7. 添加草地（组件专属场景元素）
    const grassGeometry = new THREE.PlaneGeometry(1000, 1000)
    const grassMaterial = new THREE.MeshLambertMaterial({
        color: GROUND_COLOR,
        side: THREE.DoubleSide
    })
    const grassPlane = new THREE.Mesh(grassGeometry, grassMaterial)
    grassPlane.rotation.x = -Math.PI / 2
    grassPlane.position.y = GROUND_HEIGHT
    scene.add(grassPlane)

    // 8. 加载模型（组件专属，不同组件加载不同模型）
    const loader = new GLTFLoader()
    loader.load(
        '/models/garden.glb',
        (gltf) => {
            const model = gltf.scene
            model.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE)
            model.position.set(MODEL_POSITION.x, MODEL_POSITION.y, MODEL_POSITION.z)
            model.rotation.y = Math.PI / 2
            scene.add(model)
            console.log('glb模型加载成功！')
        },
        (xhr) => { },
        (error) => {
            console.error('模型加载失败：', error)
            alert('glb模型加载失败！可能原因：\n1. 文件不存在\n2. 网络问题\n3. 格式错误')
        }
    )

    // 9. 启动渲染循环
    animate()
}

// ========== 渲染循环（只负责场景渲染和控制类的帧更新）==========
const animate = () => {
    requestAnimationFrame(animate)

    // 调用控制类的自动旋转更新
    if (sceneControls) {
        sceneControls.updateAutoRotate()
        sceneControls.updateCameraTransition()
        sceneControls.updateOrbitControls()
    }

    // 渲染场景
    renderer.render(scene, camera)
}

// ========== Vue生命周期管理 ==========
onMounted(() => {
    // 确保DOM加载完成后初始化
    setTimeout(() => {
        initThree()
        // 初始化窗口自适应尺寸
        if (sceneControls) {
            sceneControls.onWindowResize()
        }
    }, 100)
})

onUnmounted(() => {
    // 1. 销毁控制类实例（清除所有监听和定时器）
    if (sceneControls) {
        sceneControls.dispose()
    }

    // 2. 销毁Three.js资源（防止内存泄漏）
    if (renderer) {
        renderer.dispose()
    }
    if (scene) {
        scene.clear()
    }
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
    z-index: 1; /* 低于浮层 */
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