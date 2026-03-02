<template>
  <!-- 左侧内容区域 -->
  <div class="panel" :style="{ transform: `translateX(${leftPanelTransform})`, left: 0 }">
    <PanelCard 
      v-for="(card, index) in leftCards" 
      :key="`left-${index}`" 
      :title="card.title || ''"
      :card="card"
    />
  </div>

  <!-- 右侧内容区域 -->
  <div class="panel" :style="{ transform: `translateX(${rightPanelTransform})`, right: 0 }">
    <PanelCard 
      v-for="(card, index) in rightCards" 
      :key="`right-${index}`" 
      :title="card.title || ''"
      :card="card"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
// 1. 导入自定义 Card 组件
import PanelCard from './PanelCard.vue'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController } from 'chart.js'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController)

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

// 图表引用数组
const leftChartRefs = ref([])
const rightChartRefs = ref([])
let chartInstances = []

// 导航栏选项配置（从后端API获取）
const navItems = ref([])

// API基础URL - 使用用户提供的云端地址
const API_BASE_URL = 'http://106.14.133.236:8000'

// 获取导航数据
const fetchNavItems = async () => {
  try {
    console.log('正在请求导航数据...')
    const response = await fetch(`${API_BASE_URL}/api/nav-items/`)
    console.log('响应状态:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('获取到的数据:', data)
      navItems.value = data
      console.log('导航数据加载成功')
    } else {
      console.error('获取导航数据失败:', response.status)
    }
  } catch (error) {
    console.error('网络请求错误:', error)
  }
}

// 获取当前导航项
const currentNavItem = computed(() => {
  const item = navItems.value[props.activeNav] || navItems.value[0] || { cards: [] }
  // 确保cards数组存在
  if (!item.cards) {
    item.cards = []
  }
  return item
})

// 计算左侧卡片（position为'left'的卡片）
const leftCards = computed(() => {
  if (!currentNavItem.value || !currentNavItem.value.cards) {
    return []
  }
  return currentNavItem.value.cards.filter(card => card.position === 'left')
})

// 计算右侧卡片（position为'right'的卡片）
const rightCards = computed(() => {
  if (!currentNavItem.value || !currentNavItem.value.cards) {
    return []
  }
  return currentNavItem.value.cards.filter(card => card.position === 'right')
})


// 计算左右面板的位置变换（和原来逻辑一致，基于Props中的showPanels）
const leftPanelTransform = computed(() => {
  return props.showPanels ? '0' : '-100%'
})

const rightPanelTransform = computed(() => {
  return props.showPanels ? '0' : '100%'
})




// 获取环境等级对应的颜色
const getEnvironmentLevelColor = (level) => {
  const colorMap = {
    '优': '#4caf50',
    '良': '#ff9800',
    '轻度污染': '#f44336',
    '中度污染': '#e91e63',
    '重度污染': '#9c27b0',
    '严重污染': '#673ab7',
    '舒适': '#4caf50',
    '一般': '#ff9800',
    '较差': '#f44336',
    '充足': '#4caf50',
    '适中': '#ff9800',
    '不足': '#f44336'
  }
  return colorMap[level] || '#9e9e9e'
}

// 实时时间相关
const activeTab = ref(0)
const leftCharts = ref([])
const rightCharts = ref([])

// 实时时间相关
const currentTime = ref(new Date())
const timeInterval = ref(null)

// 格式化时间显示
const formatTime = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 为监控设备生成时间（正常设备同步，异常设备显示固定时间或延后时间）
const getDeviceTime = (status, includeDate = false, includeSeconds = false) => {
  if (status === '在线') {
    // 在线设备时间与系统时间同步
    const timeStr = formatTime(currentTime.value)
    if (includeDate) {
      // 包含日期格式：MM-DD HH:MM（去掉年份，不包含秒）
      return timeStr.substring(5, 16)
    } else {
      // 不包含日期格式
      if (includeSeconds) {
        // 显示秒：HH:MM:SS
        return timeStr.split(' ')[1]
      } else {
        // 不显示秒：HH:MM
        return timeStr.split(' ')[1].substring(0, 5)
      }
    }
  } else if (status === '离线') {
    // 离线设备显示固定时间或延后几天
    const offlineTime = new Date(currentTime.value)
    offlineTime.setDate(offlineTime.getDate() - 2) // 往前推2天
    const timeStr = formatTime(offlineTime)
    if (includeDate) {
      // 包含日期格式：MM-DD HH:MM（去掉年份，不包含秒）
      return timeStr.substring(5, 16)
    } else {
      // 不包含日期格式
      if (includeSeconds) {
        // 显示秒：HH:MM:SS
        return timeStr.split(' ')[1]
      } else {
        // 不显示秒：HH:MM
        return timeStr.split(' ')[1].substring(0, 5)
      }
    }
  } else {
    // 维护中或其他状态显示"N/A"
    return 'N/A'
  }
}

// 更新时间
const updateTime = () => {
  currentTime.value = new Date()
}

// 组件挂载时启动定时器和获取数据
onMounted(() => {
  updateTime()
  timeInterval.value = setInterval(updateTime, 1000)
  // 获取导航数据
  fetchNavItems()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }
})

// 获取当前时间字符串
const getCurrentTimeString = () => {
  return formatTime(currentTime.value)
}

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
  margin: auto;
  color: #fff;
  white-space: pre-line;
  /* 使/n生效 */
  text-align: left;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  pointer-events: auto;
  /* 修正：原有 none 会导致图表无法交互（如提示框），改为 auto */
  transition: transform 0.3s ease;
  /* 添加滑动动画 */
}


</style>