<template>
  <div class="panel-card">
    <!-- 卡片标题（可选） -->
    <div class="card-title" v-if="title">
      {{ title }}
    </div>
    <!-- 卡片主体内容（默认插槽，用于放置图表、文本等内容） -->
    <div class="card-body">
      <slot></slot>
    </div>
    <!-- 卡片底部（可选，插槽） -->
    <div class="card-footer" v-if="showFooter">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
// 定义组件Props，支持自定义配置
const props = defineProps({
  // 卡片标题
  title: {
    type: String,
    default: ''
  },
  // 是否显示底部区域
  showFooter: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.panel-card {
  width: 100%;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1); /* 半透明背景，适配面板深色风格 */
  backdrop-filter: blur(8px); /* 毛玻璃效果，提升视觉质感 */
  margin-bottom: 16px;
  overflow: hidden;
}

.card-title {
  padding: 12px 16px;
  font-size: 17px;
  font-weight: 500;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.card-body {
  padding: 16px;
}

.card-footer {
  padding: 12px 16px;
  font-size: 14px;
  color: #e0e0e0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}
</style>