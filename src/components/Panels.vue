<template>
  <!-- 左侧内容区域 -->
  <div class="panel left-p" :style="{ transform: `translateX(${leftPanelTransform})` }">
    <div class="content">
      <PanelCard :title="currentNavItem.name">
        <div>{{ panelContent.left }}</div>
      </PanelCard>
    </div>
  </div>

  <!-- 右侧内容区域 -->
  <div class="panel right-p" :style="{ transform: `translateX(${rightPanelTransform})` }">
    <div class="content">
      <!-- 复用 PanelCard 组件，放入 Chart.js 图表 -->
      <PanelCard title="数据趋势图表（Chart.js 示范）">
        <!-- 折线图容器，必须指定宽高（Chart.js 要求） -->
        <div style="width: 100%; height: 25vh;">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </PanelCard>

      <!-- 原有右侧面板文本内容（保留，不破坏原有逻辑） -->
      <PanelCard :title="currentNavItem.name">
        <div>{{ panelContent.right }}</div>
      </PanelCard>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
// 1. 导入自定义 Card 组件
import PanelCard from './PanelCard.vue'
// 2. 导入 Chart.js 核心及相关插件
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController, Filler } from 'chart.js'

// 3. 注册 Chart.js 所需的组件（包括 Filler 插件）
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController, Filler)

// 接收父组件传递的Props
const props = defineProps({
  // 面板显示状态（控制显隐动画）
  showPanels: {
    type: Boolean,
    required: true,
    default: true
  },
  // 当前激活的导航索引
  activeNav: {
    type: Number,
    required: true,
    default: 0
  }
})

// 定义 emit 用于向父组件传递事件
const emit = defineEmits(['nav-change'])

// 获取 canvas 引用
const chartCanvas = ref(null)
let chartInstance = null

// 导航栏选项配置（移至此处统一管理）
const navItems = ref([
  {
    name: '首页',
    left: '3D场景概览\n园区整体数据\n实时监控状态',
    right: '设备在线率：98%\n环境温度：25℃\n湿度：60%\n风速：2m/s'
  },
  {
    name: '数据监控',
    left: '能耗数据统计\n设备运行时长\n故障报警记录',
    right: '今日能耗：1200kWh\n本月能耗：35000kWh\n故障数量：0'
  },
  {
    name: '设备管理',
    left: '1. 照明设备（56台）\n2. 监控设备（32台）\n3. 环境传感器（18台）',
    right: '在线设备：104台\n离线设备：2台\n待维护：0台'
  },
  {
    name: '系统设置',
    left: '用户权限管理\n场景参数配置\n数据备份设置',
    right: '当前登录用户：管理员\n最后备份时间：2026-01-18\n自动备份：开启'
  }
])

// 获取当前导航项
const currentNavItem = computed(() => {
  return navItems.value[props.activeNav] || navItems.value[0]
})

// 面板内容数据（基于当前导航项计算）
const panelContent = computed(() => ({
  left: currentNavItem.value.left,
  right: currentNavItem.value.right
}))

// 计算左右面板的位置变换（和原来逻辑一致，基于Props中的showPanels）
const leftPanelTransform = computed(() => {
  return props.showPanels ? '0' : '-100%'
})

const rightPanelTransform = computed(() => {
  return props.showPanels ? '0' : '100%'
})

// 4. 定义 Chart.js 图表数据（折线图示例）
const chartData = {
  // X 轴分类标签
  labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
  // 数据集（可多组，实现多折线）
  datasets: [
    {
      label: '月度访问量',
      data: [1200, 1900, 1500, 2500, 2200, 3000],
      borderColor: '#4fc3f7', // 折线颜色
      backgroundColor: 'rgba(79, 195, 247, 0.2)', // 填充颜色
      tension: 0.3, // 折线平滑度
      fill: true // 是否填充折线下方区域
    },
    {
      label: '月度注册量',
      data: [500, 800, 600, 1200, 1000, 1800],
      borderColor: '#9ccc65',
      backgroundColor: 'rgba(156, 204, 101, 0.2)',
      tension: 0.3,
      fill: true
    }
  ]
}

// 5. 定义 Chart.js 图表配置项
const chartOptions = {
  responsive: true, // 响应式（适配容器宽高）
  maintainAspectRatio: false, // 不保持宽高比（允许自定义高度）
  plugins: {
    legend: {
      position: 'top', // 图例位置
      labels: {
        color: '#ffffff' // 图例文字颜色（适配面板样式）
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // 提示框背景
      titleColor: '#ffffff',
      bodyColor: '#e0e0e0'
    }
  },
  scales: {
    // X 轴配置
    x: {
      ticks: {
        color: '#e0e0e0' // X 轴文字颜色
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)' // X 轴网格线颜色
      }
    },
    // Y 轴配置
    y: {
      ticks: {
        color: '#e0e0e0' // Y 轴文字颜色
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)' // Y 轴网格线颜色
      },
      beginAtZero: true // Y 轴从 0 开始
    }
  }
}

// 6. 初始化图表函数
const initChart = () => {
  if (chartCanvas.value && !chartInstance) {
    const ctx = chartCanvas.value.getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions
    })
  }
}

// 7. 在组件挂载后初始化图表
onMounted(() => {
  // 等待 DOM 更新后再初始化图表
  setTimeout(() => {
    initChart()
  }, 100)
})

// 8. 组件卸载时销毁图表实例
// onUnmounted(() => {
//   if (chartInstance) {
//     chartInstance.destroy()
//     chartInstance = null
//   }
// })
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
  bottom: 3vh;
  width: 25vw;
  padding: 20px;
  box-sizing: border-box;
  z-index: 10;
  pointer-events: auto; /* 修正：原有 none 会导致图表无法交互（如提示框），改为 auto */
  transition: transform 0.3s ease;  /* 添加滑动动画 */
}

/* 左侧面板 - 居中靠左 */
.left-p {
  left: 0;
  text-align: left;
  margin: auto;
}

/* 右侧面板 - 居中靠右 */
.right-p {
  right: 0;
  text-align: left;
  margin: auto;
}

/* 面板内容样式 */
.content {
  color: #ffffff;
  font-size: 16px;
  line-height: 1.6;
  height: 100%;
  overflow-y: auto;  /* 内容超出时滚动 */
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  white-space: pre-line;
}
</style>