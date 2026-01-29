// ../utils/Controls.js
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// ========== 控制相关常量（和视角/交互强绑定）==========
export const ROTATE_SPEED = 0.001
export const IDLE_DELAY = 3000
export const ROTATE_INITIAL_ANGLE = 0

// ========== 核心控制类（封装所有交互/视角逻辑）==========
export class SceneControls {
  // 构造函数：接收相机、渲染器、容器DOM（从Canvas.vue传入，解耦依赖）
  constructor(camera, renderer, containerEl) {
    // 外部传入的核心对象（只读，不重新创建）
    this.camera = camera
    this.renderer = renderer
    this.containerEl = containerEl

    // 初始化OrbitControls
    this.orbitControls = new OrbitControls(camera, renderer.domElement)
    this.initOrbitControls()

    // 视角/交互状态变量（内部维护）
    this.angle = ROTATE_INITIAL_ANGLE
    this.isRotating = true // 默认开启旋转
    this.isInteracting = false
    this.isTransitioning = false
    this.idleTimer = null
    this.transitionStartTime = null
    this.startPosition = null
    this.endPosition = null
    this.startTarget = null
    this.endTarget = null

    // 相机基础配置（从外部传入相机的位置/目标，缓存起来用于旋转计算）
    this.cameraBasePosition = camera.position.clone()
    this.cameraBaseTarget = this.orbitControls.target.clone()

    // 初始化事件监听（鼠标、触摸、窗口自适应）
    this.initEventListeners()
  }

  // 1. 初始化OrbitControls配置
  initOrbitControls() {
    this.orbitControls.enableDamping = true
    this.orbitControls.dampingFactor = 0.05
    // 视角限制：禁止下半圆
    this.orbitControls.minPolarAngle = 0
    this.orbitControls.maxPolarAngle = Math.PI / 2
    // 限制目标点Y坐标不低于0
    this.orbitControls.addEventListener('change', () => {
      if (this.orbitControls.target.y < 0) {
        this.orbitControls.target.y = 0
      }
    })
  }

  // 2. 初始化所有事件监听
  initEventListeners() {
    // 鼠标/触摸事件
    this.containerEl.addEventListener('mousedown', this.handleInteractionStart.bind(this))
    this.containerEl.addEventListener('mouseup', this.handleInteractionEnd.bind(this))
    this.containerEl.addEventListener('wheel', this.resetIdleTimer.bind(this))
    this.containerEl.addEventListener('touchstart', this.handleInteractionStart.bind(this))
    this.containerEl.addEventListener('touchmove', this.handleInteractionStart.bind(this))
    this.containerEl.addEventListener('touchend', this.handleInteractionEnd.bind(this))

    // 窗口自适应事件
    window.addEventListener('resize', this.onWindowResize.bind(this))
  }

  // 3. 重置空闲计时器（自动旋转前置逻辑）
  resetIdleTimer() {
    this.isRotating = false
    clearTimeout(this.idleTimer)
    this.idleTimer = setTimeout(() => {
      this.isRotating = true
      this.startCameraTransition() // 启动视角过渡
    }, IDLE_DELAY)
  }

  // 4. 交互开始处理
  handleInteractionStart() {
    this.isInteracting = true
    this.resetIdleTimer()
  }

  // 5. 交互结束处理
  handleInteractionEnd() {
    this.isInteracting = false
    this.resetIdleTimer()
  }

  // 6. 启动相机视角过渡动画
  startCameraTransition() {
    if (this.isTransitioning) return

    this.isTransitioning = true
    this.transitionStartTime = Date.now()

    // 保存当前相机位置和目标
    this.startPosition = this.camera.position.clone()
    this.startTarget = this.orbitControls.target.clone()

    // 计算目标位置（基于缓存的基础相机位置）
    this.angle = ROTATE_INITIAL_ANGLE
    const radius = Math.sqrt(
      this.cameraBasePosition.x * this.cameraBasePosition.x +
      this.cameraBasePosition.z * this.cameraBasePosition.z
    )
    this.endPosition = new THREE.Vector3(
      Math.cos(this.angle) * radius,
      this.cameraBasePosition.y,
      Math.sin(this.angle) * radius
    )
    this.endTarget = this.cameraBaseTarget.clone()
  }

  // 7. 执行相机视角过渡（每一帧更新）
  updateCameraTransition() {
    if (!this.isTransitioning) return

    const elapsed = Date.now() - this.transitionStartTime
    const progress = Math.min(elapsed / 2000, 1)
    // 缓动函数
    const easedProgress = progress < 0.5 
      ? 4 * progress * progress * progress 
      : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1

    // 插值计算当前位置和目标
    this.camera.position.lerpVectors(this.startPosition, this.endPosition, easedProgress)
    this.orbitControls.target.lerpVectors(this.startTarget, this.endTarget, easedProgress)

    // 过渡完成
    if (progress >= 1) {
      this.isTransitioning = false
    }
  }

  // 8. 自动旋转更新（每一帧调用）
  updateAutoRotate() {
    if (this.isRotating && !this.isTransitioning && !this.isInteracting) {
      this.angle -= ROTATE_SPEED
      const radius = Math.sqrt(
        this.cameraBasePosition.x * this.cameraBasePosition.x +
        this.cameraBasePosition.z * this.cameraBasePosition.z
      )
      this.camera.position.x = Math.cos(this.angle) * radius
      this.camera.position.z = Math.sin(this.angle) * radius
      this.camera.position.y = this.cameraBasePosition.y
      this.camera.lookAt(this.cameraBaseTarget)
    }
  }

  // 9. 窗口自适应
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  // 10. 更新OrbitControls（渲染循环中调用）
  updateOrbitControls() {
    this.orbitControls.update()
  }

  // 11. 销毁所有监听和定时器（供Vue卸载时调用）
  dispose() {
    // 清除定时器
    clearTimeout(this.idleTimer)

    // 移除鼠标/触摸事件
    this.containerEl.removeEventListener('mousedown', this.handleInteractionStart.bind(this))
    this.containerEl.removeEventListener('mouseup', this.handleInteractionEnd.bind(this))
    this.containerEl.removeEventListener('wheel', this.resetIdleTimer.bind(this))
    this.containerEl.removeEventListener('touchstart', this.handleInteractionStart.bind(this))
    this.containerEl.removeEventListener('touchmove', this.handleInteractionStart.bind(this))
    this.containerEl.removeEventListener('touchend', this.handleInteractionEnd.bind(this))

    // 移除窗口自适应事件
    window.removeEventListener('resize', this.onWindowResize.bind(this))
  }
}