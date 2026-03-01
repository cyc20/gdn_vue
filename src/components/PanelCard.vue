<template>
  <div class="panel-card">
    <div class="card-title" v-if="title">{{ title }}</div>
    <div class="card-body">
      <slot/>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, LineController, BarController } from 'chart.js'

// 注册Chart.js组件
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, LineController, BarController)

// 定义组件Props
const props = defineProps({
  // 卡片标题
  title: {
    type: String,
    default: ''
  },
  // 图表数据（统一的数据结构）
  chartData: {
    type: Object,
    default: null
  },
  // 进度条数据
  progressBarData: {
    type: Array,
    default: null
  },
  // 列表数据
  listData: {
    type: Array,
    default: null
  },
  // 活动数据
  activitiesData: {
    type: Array,
    default: null
  },
  // 纯文本内容
  content: {
    type: String,
    default: ''
  }
})

// 图表引用
const chartRefs = ref({})

// 设置图表引用
const setChartRef = (el, type) => {
  if (el) {
    chartRefs.value[type] = el
    initChart(el, type)
  }
}

// 图表配置
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: { color: '#ffffff' }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      titleColor: '#ffffff',
      bodyColor: '#e0e0e0'
    }
  },
  scales: {
    x: {
      ticks: { color: '#e0e0e0' },
      grid: { color: 'rgba(255, 255, 255, 0.1)' }
    },
    y: {
      ticks: { color: '#e0e0e0' },
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
      beginAtZero: true
    }
  }
}

// 初始化图表
const initChart = (canvasRef, type) => {
  if (canvasRef && props.chartData) {
    const ctx = canvasRef.getContext('2d')
    const chartType = type === 'line' ? 'line' : 'bar'
    
    return new Chart(ctx, {
      type: chartType,
      data: props.chartData.data,
      options: chartOptions
    })
  }
  return null
}

// 监听数据变化
watch(() => props.chartData, () => {
  // 重新初始化图表的逻辑可以在这里添加
})
</script>

<style scoped>
.panel-card {
  width: 100%;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  margin-bottom: 2vh;
  overflow: hidden;
}

.card-title {
  padding: 1vh 1vw;
  font-size: 17px;
  font-weight: 500;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.card-body {
  padding: 1vh 1vw;
}
</style>