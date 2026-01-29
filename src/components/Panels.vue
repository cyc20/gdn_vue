<template>
  <!-- 左侧内容区域 -->
  <div class="panel left-p" :style="{ transform: `translateX(${leftPanelTransform})` }">
    <div class="content">
      {{ panelContent.left }}
    </div>
  </div>

  <!-- 右侧内容区域 -->
  <div class="panel right-p" :style="{ transform: `translateX(${rightPanelTransform})` }">
    <div class="content">
      {{ panelContent.right }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 接收父组件（后续的父组件/页面）传递的Props
const props = defineProps({
  // 面板显示状态（控制显隐动画）
  showPanels: {
    type: Boolean,
    required: true,
    default: true
  },
  // 面板内容数据（左右面板的具体内容）
  panelContent: {
    type: Object,
    required: true,
    default: () => ({ left: '', right: '' })
  }
})

// 计算左右面板的位置变换（和原来逻辑一致，基于Props中的showPanels）
const leftPanelTransform = computed(() => {
  return props.showPanels ? '0' : '-100%'
})

const rightPanelTransform = computed(() => {
  return props.showPanels ? '0' : '100%'
})
</script>

<style scoped>
* {
  all: unset;
  box-sizing: border-box;
  display: block;
}

/* ////////////////////////////////////////////// 左右面板 ////////////////////////////////////////////// */
.panel {
  position: fixed;
  top: 7vh;
  /* 避开新标题区域高度 */
  bottom: 3vh;
  /* 避开底部导航栏 */
  width: 25vw;
  /* 面板宽度 */
  padding: 20px;
  box-sizing: border-box;
  z-index: 10;
  /* 高于3D场景 */
  pointer-events: auto;
  /* 开启交互 */
  transition: transform 0.3s ease;
  /* 添加滑动动画 */
}

/* 左侧面板 - 居中靠左 */
.left-p {
  left: 0;
  /* 直接贴到左边 */
  text-align: left;
  margin: auto;
}

/* 右侧面板 - 居中靠右 */
.right-p {
  right: 0;
  /* 直接贴到右边 */
  text-align: left;
  margin: auto;
}

/* 面板内容样式 */
.content {
  color: #ffffff;
  font-size: 16px;
  line-height: 1.6;
  height: 100%;
  overflow-y: auto;
  /* 内容超出时滚动 */
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  white-space: pre-line;
}
</style>