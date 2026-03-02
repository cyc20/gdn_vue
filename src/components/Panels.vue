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

// 导航栏选项配置（每个导航项包含根据position属性分布的卡片）
const navItems = ref([
  {
    name: '综合态势',
    cards: [
      {
        title: '游客态势',
        position: 'left',
        barChart: {
          labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          datasets: [{
            label: '月度访问量',
            data: [1300, 1850, 1350, 1900, 2400, 2100, 3100, 3600, 2900, 1800, 1600, 950],
            borderColor: '#4fc3f7',
            backgroundColor: 'rgba(79, 195, 247, 0.6)',
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false
          }]
        }
      },
      {
        title: '园区概览',
        position: 'right',
        content: '入驻企业：128家\n就业人数：8,500人\n年产值：15.6亿\n绿化覆盖率：42%'
      },
      {
        title: '交通态势',
        position: 'left',
        lineChart: {
          labels: ['早高峰', '平峰期', '晚高峰', '夜间'],
          datasets: [{
            label: '平均车速(km/h)',
            data: [35, 45, 30, 55],
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            tension: 0.3,
            fill: true
          }]
        }
      },
      {
        title: '园区活动',
        position: 'right',
        activities: [
          { title: '月度安全会议', time: '今天 14:00', status: '待开始', location: '会议室A', type: 'meeting' },
          { title: '设备例行维护', time: '明天 09:00', status: '待开始', location: 'B区机房', type: 'maintenance' },
          { title: '园区安全巡检', time: '02-29 10:30', status: '进行中', location: '全园区', type: 'inspection' },
          { title: '新员工培训', time: '03-01 15:00', status: '待开始', location: '培训中心', type: 'training' },
          { title: '消防设施检查', time: '03-02 11:00', status: '待开始', location: '各楼层', type: 'inspection' }
        ]
      }
    ]
  },
  {
    name: '园测数据',
    cards: [
      {
        title: '风控要素',
        position: 'left',
        progressBar: [
          { label: '安全风险评估', value: 78 },
          { label: '威胁检测准备', value: 92 },
          { label: '应急响应速度', value: 85 },
          { label: '系统防护强度', value: 88 },
          { label: '合规性检查', value: 95 }
        ]
      },
      {
        title: '环境监测数据',
        position: 'left',
        environmentData: [
          { name: '空气质量指数', value: 45, level: '优', unit: 'AQI' },
          { name: 'PM2.5浓度', value: 25, level: '良', unit: 'μg/m³' },
          { name: '噪声水平', value: 55, level: '良', unit: 'dB' },
          { name: '温湿度', value: '26℃/65%', level: '舒适', unit: '' },
          { name: '光照强度', value: 850, level: '充足', unit: 'lux' }
        ]
      },
      {
        title: '传感器状态',
        position: 'right',
        listData: [
          { deviceId: 'SN-001', location: '园区东门', status: '正常', time: '15:30:22' },
          { deviceId: 'SN-002', location: '主楼大厅', status: '预警', time: '15:28:15' },
          { deviceId: 'SN-003', location: '停车场A区', status: '正常', time: '15:25:40' },
          { deviceId: 'SN-004', location: '园区西门', status: '故障', time: '15:22:18' },
          { deviceId: 'SN-005', location: '绿化带区域', status: '正常', time: '15:20:33' },
          { deviceId: 'SN-006', location: '餐厅门口', status: '正常', time: '15:18:45' }
        ]
      },
      {
        title: '雨水监测',
        position: 'right',
        barChart: {
          labels: computed(() => {
            const today = new Date()
            const labels = []
            // 生成最近7天的日期标签
            for (let i = 6; i >= 0; i--) {
              const date = new Date(today)
              date.setDate(today.getDate() - i)
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              labels.push(`${month}-${day}`)
            }
            return labels
          }),
          datasets: [{
            label: '降雨量(mm)',
            data: computed(() => {
              const today = new Date()
              const data = [0, 0, 0, 0, 0, 0, 0]
              // 设置特定日期的降雨数据（基于当前日期动态计算）
              // 假设前天和昨天有降雨
              data[2] = 3  // 前天
              data[3] = 18  // 昨天
              return data
            }),
            backgroundColor: computed(() => {
              // 根据数据动态设置颜色深浅
              const data = [0, 0, 0, 0, 18, 25, 0]
              return data.map(value => 
                value > 0 
                  ? `rgba(33, 150, 243, ${0.6 + (value / 30) * 0.3})`  // 有雨：0.6-0.9透明度
                  : 'rgba(33, 150, 243, 0.3)'  // 无雨：浅色
              )
            }),
            borderColor: '#2196f3',
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
            hoverBackgroundColor: 'rgba(33, 150, 243, 0.9)',
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 2
          }]
        }
      }
    ]
  },
  {
    name: '安防监控',
    cards: [
      {
        title: '监控画面',
        position: 'right',
        gridData: [
          { id: 'CAM-001', location: '东门入口', status: '在线', time: computed(() => getDeviceTime('在线', false, true)) },
          { id: 'CAM-002', location: '西门出口', status: '在线', time: computed(() => getDeviceTime('在线', false, true)) },
          { id: 'CAM-003', location: '北区停车场', status: '离线', time: computed(() => getDeviceTime('离线', false, true)) },
          { id: 'CAM-004', location: '南区花园', status: '在线', time: computed(() => getDeviceTime('在线', false, true)) },
          { id: 'CAM-005', location: '中央大厅', status: '维护中', time: computed(() => getDeviceTime('维护中', false, true)) },
          { id: 'CAM-006', location: '办公区走廊', status: '在线', time: computed(() => getDeviceTime('在线', false, true)) },
          { id: 'CAM-007', location: '餐厅区域', status: '在线', time: computed(() => getDeviceTime('在线', false, true)) },
          { id: 'CAM-008', location: '健身房入口', status: '在线', time: computed(() => getDeviceTime('在线', false, true)) }
        ]
      },
      {
        title: '入侵检测统计',
        position: 'left',
        intrusionData: [
          { type: '人员入侵', count: 12, trend: '上升', level: 'warning' },
          { type: '车辆闯入', count: 3, trend: '稳定', level: 'normal' },
          { type: '周界突破', count: 1, trend: '下降', level: 'critical' },
          { type: '异常行为', count: 8, trend: '上升', level: 'warning' },
          { type: '非法停留', count: 5, trend: '稳定', level: 'normal' }
        ]
      },
      {
        title: '园区监控',
        position: 'left',
        listData: [
          { deviceId: 'CAM-001', location: '东门入口', status: '在线', time: computed(() => getDeviceTime('在线', true)) },
          { deviceId: 'CAM-002', location: '西门出口', status: '在线', time: computed(() => getDeviceTime('在线', true)) },
          { deviceId: 'CAM-003', location: '北区停车场', status: '离线', time: computed(() => getDeviceTime('离线', true)) },
          { deviceId: 'CAM-004', location: '南区花园', status: '在线', time: computed(() => getDeviceTime('在线', true)) },
          { deviceId: 'CAM-005', location: '中央大厅', status: '维护中', time: computed(() => getDeviceTime('维护中', true)) },
          { deviceId: 'CAM-007', location: '餐厅区域', status: '在线', time: computed(() => getDeviceTime('在线', true)) },
          { deviceId: 'CAM-008', location: '健身房入口', status: '在线', time: computed(() => getDeviceTime('在线', true)) }
        ]
      },
    ]
  },
  {
    name: '能源管理',
    cards: [
      {
        title: '能耗分析',
        position: 'left',
        gaugeChart: {
          minValue: 0,
          maxValue: 100,
          currentValue: 68.5,
          unit: '%'
        }
      },
      {
        title: '电力负荷',
        position: 'right',
        lineChart: {
          labels: ['峰时', '平时', '谷时'],
          datasets: [{
            label: '用电负荷(kW)',
            data: [850, 620, 380],
            borderColor: '#ff9800',
            backgroundColor: 'rgba(255, 152, 0, 0.2)',
            tension: 0.3,
            fill: true
          }]
        }
      }
    ]
  },
  {
    name: '传感器监测',
    cards: [
      {
        title: '传感器监测',
        position: 'right',
        listData: [
          { deviceId: 'SN-001', location: '园区东门', status: '正常', time: '15:30:22' },
          { deviceId: 'SN-002', location: '主楼大厅', status: '预警', time: '15:28:15' },
          { deviceId: 'SN-003', location: '停车场A区', status: '正常', time: '15:25:40' },
          { deviceId: 'SN-004', location: '园区西门', status: '故障', time: '15:22:18' },
          { deviceId: 'SN-005', location: '绿化带区域', status: '正常', time: '15:20:33' },
          { deviceId: 'SN-006', location: '餐厅门口', status: '正常', time: '15:18:45' }
        ]
      },
    ]
  }
])

// 获取当前导航项
const currentNavItem = computed(() => {
  const item = navItems.value[props.activeNav] || navItems.value[0]
  // 确保cards数组存在
  if (!item.cards) {
    item.cards = []
  }
  return item
})

// 计算左侧卡片（position为'left'的卡片）
const leftCards = computed(() => {
  return currentNavItem.value.cards.filter(card => card.position === 'left')
})

// 计算右侧卡片（position为'right'的卡片）
const rightCards = computed(() => {
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

// 组件挂载时启动定时器
onMounted(() => {
  updateTime()
  timeInterval.value = setInterval(updateTime, 1000)
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