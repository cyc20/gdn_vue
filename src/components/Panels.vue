<template>
  <!-- 左侧内容区域 -->
  <div class="panel left-p" :style="{transform: `translateX(${leftPanelTransform})`,left: 0 }">
    <div class="content">
      <!-- 左侧第一个卡片 -->
      <PanelCard :title="currentNavItem.cards[0].title">
        <div v-if="currentNavItem.cards[0].chartConfig" style="width: 100%; height: 25vh;">
          <canvas ref="leftChart1"></canvas>
        </div>
        <div v-else>{{ currentNavItem.cards[0].left }}</div>
      </PanelCard>
      
      <!-- 左侧第二个卡片 -->
      <PanelCard :title="currentNavItem.cards[1].title">
        <div v-if="currentNavItem.cards[1].chartConfig" style="width: 100%; height: 25vh;">
          <canvas ref="leftChart2"></canvas>
        </div>
        <div v-else>{{ currentNavItem.cards[1].left }}</div>
      </PanelCard>
    </div>
  </div>

  <!-- 右侧内容区域 -->
  <div class="panel right-p" :style="{ transform: `translateX(${rightPanelTransform})`,right: 0 }">
    <div class="content">
      <!-- 右侧第一个卡片 -->
      <PanelCard :title="currentNavItem.cards[2].title">
        <div v-if="currentNavItem.cards[2].chartConfig" style="width: 100%; height: 25vh;">
          <canvas ref="rightChart1"></canvas>
        </div>
        <div v-else>{{ currentNavItem.cards[2].right }}</div>
      </PanelCard>

      <!-- 右侧第二个卡片 -->
      <PanelCard :title="currentNavItem.cards[3].title">
        <div v-if="currentNavItem.cards[3].chartConfig" style="width: 100%; height: 25vh;">
          <canvas ref="rightChart2"></canvas>
        </div>
        <div v-else>{{ currentNavItem.cards[3].right }}</div>
      </PanelCard>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
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
const leftChart1 = ref(null)
const leftChart2 = ref(null)
const rightChart1 = ref(null)
const rightChart2 = ref(null)
let chartInstances = {
  left1: null,
  left2: null,
  right1: null,
  right2: null
}

// 导航栏选项配置（每个导航项包含4个卡片：左上、左下、右上、右下）
const navItems = ref([
  {
    name: '首页',
    cards: [
      {
        title: '数据趋势图表',
        left: '',
        right: '',
        chartConfig: {
          data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{
              label: '月度访问量',
              data: [1200, 1900, 1500, 2500, 2200, 3000],
              borderColor: '#4fc3f7',
              backgroundColor: 'rgba(79, 195, 247, 0.2)',
              tension: 0.3,
              fill: true
            }]
          }
        }
      },
      {
        title: '园区概览',
        left: '3D场景概览\n园区整体数据\n实时监控状态',
        right: '设备在线率：98%\n环境温度：25℃\n湿度：60%\n风速：2m/s'
      },
      {
        title: '设备状态',
        left: '',
        right: '在线设备：106台\n离线设备：0台\n故障设备：0台',
        chartConfig: {
          data: {
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
        }
      },
      {
        title: '环境监测',
        left: '',
        right: '温度：25℃\n湿度：60%\n风速：2m/s\n气压：1013hPa'
      }
    ]
  },
  {
    name: '数据监控',
    cards: [
      {
        title: '能耗分析',
        left: '',
        right: '',
        chartConfig: {
          data: {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六'],
            datasets: [{
              label: '日能耗(kWh)',
              data: [200, 250, 300, 280, 320, 260],
              borderColor: '#ff9800',
              backgroundColor: 'rgba(255, 152, 0, 0.2)',
              tension: 0.3,
              fill: true
            }]
          }
        }
      },
      {
        title: '运行时长统计',
        left: '设备运行时长\n平均运行时间\n最长运行设备',
        right: '总运行时长：1200小时\n平均时长：12小时\n最长：照明系统'
      },
      {
        title: '报警记录',
        left: '',
        right: '今日报警：0次\n本周报警：3次\n本月报警：12次',
        chartConfig: {
          data: {
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
        }
      },
      {
        title: '历史数据',
        left: '',
        right: '昨日能耗：1180kWh\n上周同期：1250kWh\n上月同期：32000kWh'
      }
    ]
  },
  {
    name: '设备管理',
    cards: [
      {
        title: '设备分布',
        left: '',
        right: '',
        chartConfig: {
          data: {
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
        }
      },
      {
        title: '设备清单',
        left: '1. 照明设备（56台）\n2. 监控设备（32台）\n3. 环境传感器（18台）\n4. 其他设备（10台）',
        right: '总计：116台\n在线：114台\n离线：2台'
      },
      {
        title: '维护计划',
        left: '',
        right: '待维护：3台\n计划维护：8台\n已完成：15台',
        chartConfig: {
          data: {
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
        }
      },
      {
        title: '设备详情',
        left: '',
        right: '最新上线：摄像头007\n最近离线：传感器012\n故障修复：照明023'
      }
    ]
  },
  {
    name: '系统设置',
    cards: [
      {
        title: '性能监控',
        left: '',
        right: '',
        chartConfig: {
          data: {
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
        }
      },
      {
        title: '用户管理',
        left: '管理员账户\n操作员账户\n访客账户\n权限分配',
        right: '在线用户：3人\n总用户数：12人\n活跃用户：8人'
      },
      {
        title: '备份状态',
        left: '',
        right: '上次备份：2026-01-18\n备份大小：2.3GB\n备份状态：成功',
        chartConfig: {
          data: {
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
        }
      },
      {
        title: '系统信息',
        left: '',
        right: '系统版本：v2.1.0\n运行时间：15天\n最后重启：2026-01-03'
      }
    ]
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
  Object.values(chartInstances).forEach(instance => {
    if (instance) {
      instance.destroy()
    }
  })
  chartInstances = { left1: null, left2: null, right1: null, right2: null }
}

// 初始化单个图表
const initChart = (canvasRef, cardIndex) => {
  if (canvasRef.value && currentNavItem.value.cards[cardIndex]?.chartConfig) {
    const ctx = canvasRef.value.getContext('2d')
    return new Chart(ctx, {
      type: 'line',
      data: currentNavItem.value.cards[cardIndex].chartConfig.data,
      options: chartOptions
    })
  }
  return null
}

// 初始化所有图表
const initAllCharts = () => {
  destroyAllCharts()
  setTimeout(() => {
    chartInstances.left1 = initChart(leftChart1, 0)
    chartInstances.left2 = initChart(leftChart2, 1)
    chartInstances.right1 = initChart(rightChart1, 2)
    chartInstances.right2 = initChart(rightChart2, 3)
  }, 100)
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
  text-align: left;
  pointer-events: auto; /* 修正：原有 none 会导致图表无法交互（如提示框），改为 auto */
  transition: transform 0.3s ease;  /* 添加滑动动画 */
}

/* 面板内容样式 */
.content {
  color: #ffffff;
  font-size: 16px;
  line-height: 1.6;
  height: 100%;
  overflow: hidden;  /* 内容超出时不滚动 */
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  white-space: pre-line;
}
</style>