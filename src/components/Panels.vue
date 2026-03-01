<template>
  <!-- 左侧内容区域 -->
  <div class="panel" :style="{ transform: `translateX(${leftPanelTransform})`, left: 0 }">

    <PanelCard v-for="(card, index) in leftCards" :key="`left-${index}`" :title="card.title || ''">
      <div v-if="card.lineChart" style="width: 100%; height: 25vh;">
        <canvas :ref="el => setLeftChartRef(el, index)"></canvas>
      </div>
      <div v-if="card.barChart" style="width: 100%; height: 25vh;">
        <canvas :ref="el => setLeftChartRef(el, index)"></canvas>
      </div>
      <div v-if="card.progressBar" style="width: 100%;">
        <div v-for="(item, idx) in card.progressBar" :key="idx" style="margin-bottom: 12px;">
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <span
              style="font-size: small; color: #e0e0e0; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{
              item.label }}</span>
            <div
              style="flex: 2; margin: 0 10px; height: 8px; background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden;">
              <div :style="{
                width: item.value + '%',
                height: '100%',
                backgroundColor: '#ff9800',
                transition: 'width 0.3s ease'
              }">
              </div>
            </div>
            <span style="font-size: small; color: #4fc3f7; min-width: 30px; text-align: right;">{{ item.value }}</span>
          </div>
        </div>
      </div>
      <div v-if="card.listData" style="width: 100%;">
        <!-- 表头 -->
        <div
          style="display: grid; grid-template-columns: 1.3fr 1.3fr 1fr 1.8fr; gap: 5px; font-size: small; font-weight: bold; margin-bottom: 8px; padding: 5px; background-color: rgba(79, 195, 247, 0.2); border-radius: 4px;">
          <div>设备号</div>
          <div>位置</div>
          <div>状态</div>
          <div>时间</div>
        </div>
        <!-- 数据行 -->
        <div v-for="(item, idx) in card.listData" :key="idx"
          style="display: grid; grid-template-columns: 1.3fr 1.3fr 1fr 1.8fr; gap: 5px; font-size: small; margin-bottom: 6px; padding: 4px; background-color: rgba(255, 255, 255, 0.05); border-radius: 4px;">
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.deviceId }}</div>
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.location }}</div>
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <span :style="{ color: item.status === '在线' ? '#4caf50' : item.status === '离线' ? '#f44336' : '#ff9800' }">
              {{ item.status }}
            </span>
          </div>
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.time }}</div>
        </div>
      </div>
      <!-- 园区活动列表 - 优化双行布局 -->
      <div v-if="card.activities" style="width: 100%;">
        <div v-for="(activity, idx) in card.activities" :key="idx"
          style="margin-bottom: 6px; padding: 5px; background-color: rgba(255, 255, 255, 0.05); border-radius: 4px; border-left: 2px solid #4fc3f7;">
          <!-- 主容器：左右布局 -->
          <div style="display: flex; align-items: center;">
            <!-- 左侧：图标区域（垂直居中） -->
            <div
              style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; margin-right: 8px;">
              <span v-if="activity.type === 'meeting'" style="color: #4fc3f7; font-size: 16px;">📅</span>
              <span v-else-if="activity.type === 'maintenance'" style="color: #ff9800; font-size: 16px;">🔧</span>
              <span v-else-if="activity.type === 'inspection'" style="color: #8bc34a; font-size: 16px;">🔍</span>
              <span v-else-if="activity.type === 'training'" style="color: #9c27b0; font-size: 16px;">🎓</span>
              <span v-else style="color: #e0e0e0; font-size: 16px;">📋</span>
            </div>

            <!-- 中间：内容区域 -->
            <div style="flex: 1;">
              <!-- 第一行：标题 -->
              <div
                style="font-size: 13px; color: #ffffff; font-weight: 500; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ activity.title }}
              </div>
              <!-- 第二行：时间 + 地点 -->
              <div style="display: flex; align-items: center; font-size: 12px; color: #b0b0b0;">
                <span style="margin-right: 12px;">
                  {{ activity.time }}
                </span>
                <span v-if="activity.location" style="color: #9e9e9e; display: flex; align-items: center;">
                  📍 {{ activity.location }}
                </span>
              </div>
            </div>

            <!-- 右侧：状态标签（垂直居中并放大） -->
            <div style="display: flex; align-items: center; margin-left: 8px;">
              <span :style="{
                color: activity.status === '进行中' ? '#4caf50' :
                  activity.status === '待开始' ? '#ff9800' :
                    activity.status === '已完成' ? '#8bc34a' : '#f44336',
                fontSize: '12px',
                fontWeight: '500',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                whiteSpace: 'nowrap'
              }">
                {{ activity.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="card.content" style="font-size: small;">{{ card.content || '' }}</div>

    </PanelCard>

  </div>

  <!-- 右侧内容区域 -->
  <div class="panel" :style="{ transform: `translateX(${rightPanelTransform})`, right: 0 }">

    <PanelCard v-for="(card, index) in rightCards" :key="`right-${index}`" :title="card.title || ''">
      <div v-if="card.lineChart" style="width: 100%; height: 25vh;">
        <canvas :ref="el => setRightChartRef(el, index)"></canvas>
      </div>
      <div v-if="card.barChart" style="width: 100%; height: 25vh;">
        <canvas :ref="el => setRightChartRef(el, index)"></canvas>
      </div>
      <div v-if="card.progressBar" style="width: 100%;">
        <div v-for="(item, idx) in card.progressBar" :key="idx" style="margin-bottom: 12px;">
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <span
              style="font-size: small; color: #e0e0e0; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{
              item.label }}</span>
            <div
              style="flex: 2; margin: 0 10px; height: 8px; background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden;">
              <div :style="{
                width: item.value + '%',
                height: '100%',
                backgroundColor: '#ff9800',
                transition: 'width 0.3s ease'
              }">
              </div>
            </div>
            <span style="font-size: small; color: #4fc3f7; min-width: 30px; text-align: right;">{{ item.value }}</span>
          </div>
        </div>
      </div>
      <div v-if="card.listData" style="width: 100%;">
        <!-- 表头 -->
        <div
          style="display: grid; grid-template-columns: 1.3fr 1.3fr 1fr 1.8fr; gap: 5px; font-size: small; font-weight: bold; margin-bottom: 8px; padding: 5px; background-color: rgba(79, 195, 247, 0.2); border-radius: 4px;">
          <div>设备号</div>
          <div>位置</div>
          <div>状态</div>
          <div>时间</div>
        </div>
        <!-- 数据行 -->
        <div v-for="(item, idx) in card.listData" :key="idx"
          style="display: grid; grid-template-columns: 1.3fr 1.3fr 1fr 1.8fr; gap: 5px; font-size: small; margin-bottom: 6px; padding: 4px; background-color: rgba(255, 255, 255, 0.05); border-radius: 4px;">
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.deviceId }}</div>
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.location }}</div>
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <span :style="{ color: item.status === '在线' ? '#4caf50' : item.status === '离线' ? '#f44336' : '#ff9800' }">
              {{ item.status }}
            </span>
          </div>
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.time }}</div>
        </div>
      </div>
      <!-- 园区活动列表 - 优化双行布局 -->
      <div v-if="card.activities" style="width: 100%;">
        <div v-for="(activity, idx) in card.activities" :key="idx"
          style="margin-bottom: 6px; padding: 5px; background-color: rgba(255, 255, 255, 0.05); border-radius: 4px; border-left: 2px solid #4fc3f7;">
          <!-- 主容器：左右布局 -->
          <div style="display: flex; align-items: center;">
            <!-- 左侧：图标区域（垂直居中） -->
            <div
              style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; margin-right: 8px;">
              <span v-if="activity.type === 'meeting'" style="color: #4fc3f7; font-size: 16px;">📅</span>
              <span v-else-if="activity.type === 'maintenance'" style="color: #ff9800; font-size: 16px;">🔧</span>
              <span v-else-if="activity.type === 'inspection'" style="color: #8bc34a; font-size: 16px;">🔍</span>
              <span v-else-if="activity.type === 'training'" style="color: #9c27b0; font-size: 16px;">🎓</span>
              <span v-else style="color: #e0e0e0; font-size: 16px;">📋</span>
            </div>

            <!-- 中间：内容区域 -->
            <div style="flex: 1;">
              <!-- 第一行：标题 -->
              <div
                style="font-size: 13px; color: #ffffff; font-weight: 500; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ activity.title }}
              </div>
              <!-- 第二行：时间 + 地点 -->
              <div style="display: flex; align-items: center; font-size: 12px; color: #b0b0b0;">
                <span style="margin-right: 12px;">
                  {{ activity.time }}
                </span>
                <span v-if="activity.location" style="color: #9e9e9e; display: flex; align-items: center;">
                  📍 {{ activity.location }}
                </span>
              </div>
            </div>

            <!-- 右侧：状态标签（垂直居中并放大） -->
            <div style="display: flex; align-items: center; margin-left: 8px;">
              <span :style="{
                color: activity.status === '进行中' ? '#4caf50' :
                  activity.status === '待开始' ? '#ff9800' :
                    activity.status === '已完成' ? '#8bc34a' : '#f44336',
                fontSize: '12px',
                fontWeight: '500',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                whiteSpace: 'nowrap'
              }">
                {{ activity.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="card.content" style="font-size: small;">{{ card.content || '' }}</div>
    </PanelCard>

  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, nextTick } from 'vue'
// 1. 导入自定义 Card 组件
import PanelCard from './PanelCard.vue'
// 2. 导入 Chart.js 核心及相关插件
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController } from 'chart.js'

// 3. 注册 Chart.js 所需的组件
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
        lineChart: {
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          datasets: [{
            label: '月度访问量',
            data: [1200, 1900, 1500, 2500, 2200, 2500],
            borderColor: '#4fc3f7',
            backgroundColor: 'rgba(79, 195, 247, 0.2)',
            tension: 0.3,
            fill: true
          }]
        }
      },
      {
        title: '园区概览',
        position: 'right',
        content: '设备在线率：98%\n环境温度：25℃\n湿度：60%\n风速：2m/s'
      },
      {
        title: '设备状态',
        position: 'left',
        lineChart: {
          labels: ['照明', '监控', '传感器', '其他'],
          datasets: [{
            label: '设备数量',
            data: [56, 32, 18, 10],
            borderColor: '#9ccc65',
            backgroundColor: 'rgba(156, 204, 101, 0.2)',
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
        title: '能耗分析',
        position: 'left',
        gaugeChart: {
          minValue: 0,
          maxValue: 100,
          currentValue: 46.3,
          unit: '%'
        }
      },
      {
        title: '运行时长统计',
        position: 'left',
        content: '总运行时长：1200小时\n平均时长：12小时\n最长：照明系统'
      },
      {
        title: '报警记录',
        position: 'right',
        lineChart: {
          labels: ['紧急', '重要', '一般', '提示'],
          datasets: [{
            label: '报警次数',
            data: [0, 1, 5, 6],
            borderColor: '#f44336',
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
            tension: 0.3,
            fill: true
          }]
        }
      },
      {
        title: '历史数据',
        position: 'right',
        content: '昨日能耗：1180kWh\n上周同期：1250kWh\n上月同期：32000kWh'
      }
    ]
  },
  {
    name: '安防监控',
    cards: [
      {
        title: '设备分布',
        position: 'left',
        lineChart: {
          labels: ['A区', 'B区', 'C区', 'D区'],
          datasets: [{
            label: '设备密度',
            data: [28, 35, 22, 21],
            borderColor: '#9c27b0',
            backgroundColor: 'rgba(156, 39, 176, 0.2)',
            tension: 0.3,
            fill: true
          }]
        }
      },
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
        title: '维护计划',
        position: 'right',
        lineChart: {
          labels: ['待处理', '处理中', '已完成'],
          datasets: [{
            label: '维护任务',
            data: [3, 8, 15],
            borderColor: '#00bcd4',
            backgroundColor: 'rgba(0, 188, 212, 0.2)',
            tension: 0.3,
            fill: true
          }]
        }
      },
      {
        title: '园区监控',
        position: 'right',
        listData: [
          { deviceId: 'CAM-001', location: '东门入口', status: '在线', time: '02-28 18:00' },
          { deviceId: 'CAM-002', location: '西门出口', status: '在线', time: '02-28 18:00' },
          { deviceId: 'CAM-003', location: '北区停车场', status: '离线', time: '02-28 17:45' },
          { deviceId: 'CAM-004', location: '南区花园', status: '在线', time: '02-28 18:00' },
          { deviceId: 'CAM-005', location: '中央大厅', status: '维护中', time: '02-28 17:30' }
        ]
      },
    ]
  },
  {
    name: '能源管理',
    cards: [
      {
        title: '性能监控',
        position: 'left',
        lineChart: {
          labels: ['CPU', '内存', '磁盘', '网络'],
          datasets: [{
            label: '使用率(%)',
            data: [45, 65, 30, 75],
            borderColor: '#e91e63',
            backgroundColor: 'rgba(233, 30, 99, 0.2)',
            tension: 0.3,
            fill: true
          }]
        }
      },
      {
        title: '用户管理',
        position: 'left',
        content: '在线用户：3人\n总用户数：12人\n活跃用户：8人'
      },
      {
        title: '备份状态',
        position: 'right',
        lineChart: {
          labels: ['成功', '失败', '进行中'],
          datasets: [{
            label: '备份次数',
            data: [15, 2, 1],
            borderColor: '#8bc34a',
            backgroundColor: 'rgba(139, 195, 74, 0.2)',
            tension: 0.3,
            fill: true
          }]
        }
      },
      {
        title: '系统信息',
        position: 'right',
        content: '系统版本：v2.1.0\n运行时间：15天\n最后重启：2026-01-03'
      }
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

// 设置左侧图表引用
const setLeftChartRef = (el, index) => {
  if (el) {
    leftChartRefs.value[index] = el
  }
}

// 设置右侧图表引用
const setRightChartRef = (el, index) => {
  if (el) {
    rightChartRefs.value[index] = el
  }
}

// 计算左右面板的位置变换（和原来逻辑一致，基于Props中的showPanels）
const leftPanelTransform = computed(() => {
  return props.showPanels ? '0' : '-100%'
})

const rightPanelTransform = computed(() => {
  return props.showPanels ? '0' : '100%'
})

// 通用图表配置
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

// 销毁所有图表实例
const destroyAllCharts = () => {
  chartInstances.forEach(instance => {
    if (instance) {
      instance.destroy()
    }
  })
  chartInstances = []
}

// 初始化单个图表
const initChart = (canvasRef, cardData) => {
  if (canvasRef && cardData?.lineChart) {
    const ctx = canvasRef.getContext('2d')
    return new Chart(ctx, {
      type: 'line',
      data: cardData.lineChart,
      options: chartOptions
    })
  }
  return null
}

// 初始化所有图表
const initAllCharts = async () => {
  destroyAllCharts()

  // 等待DOM更新完成
  await nextTick()

  // 初始化左侧图表
  leftCards.value.forEach((card, index) => {
    if (leftChartRefs.value[index]) {
      const instance = initChart(leftChartRefs.value[index], card)
      if (instance) {
        chartInstances.push(instance)
      }
    }
  })

  // 初始化右侧图表
  rightCards.value.forEach((card, index) => {
    if (rightChartRefs.value[index]) {
      const instance = initChart(rightChartRefs.value[index], card)
      if (instance) {
        chartInstances.push(instance)
      }
    }
  })
}

// 在组件挂载后初始化图表
onMounted(() => {
  initAllCharts()
})

// 监听导航变化
watch(
  () => props.activeNav,
  () => {
    initAllCharts()
  }
)

// 监听当前导航项变化
watch(
  () => currentNavItem.value,
  () => {
    initAllCharts()
  },
  { deep: true }
)

// 组件卸载时销毁图表实例
// onUnmounted(() => {
//   destroyAllCharts()
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