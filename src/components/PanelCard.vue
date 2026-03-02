<template>
  <div class="panel-card">
    <div class="card-title" v-if="title">{{ title }}</div>
    <div class="card-body">
      <!-- 折线图 -->
      <div v-if="card.lineChart" style="width: 100%; height: 25vh;">
        <canvas :ref="el => setChartRef(el, 'line')"></canvas>
      </div>
      
      <!-- 柱状图 -->
      <div v-if="card.barChart" style="width: 100%; height: 25vh;">
        <canvas :ref="el => setChartRef(el, 'bar')"></canvas>
      </div>
      
      <!-- 仪表盘图表 -->
      <div v-if="card.gaugeChart" style="width: 100%; height: 25vh; display: flex; align-items: center;">
        <!-- 左侧数据面板 -->
        <div style="flex: 1; padding-right: 12px;">
          <div style="background: rgba(79, 195, 247, 0.1); border-radius: 6px; padding: 8px; margin-bottom: 6px;">
            <div style="font-size: 12px; color: #e0e0e0; margin-bottom: 4px;">📊 实时监测</div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #b0b0b0;">当前功率</span>
              <span style="color: #4fc3f7; font-weight: 500;">{{ (gaugeValue * 12.5).toFixed(1) }} kW</span>
            </div>
          </div>
          
          <div style="background: rgba(76, 175, 80, 0.1); border-radius: 6px; padding: 8px; margin-bottom: 6px;">
            <div style="font-size: 12px; color: #e0e0e0; margin-bottom: 4px;">📈 效率分析</div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #b0b0b0;">能效等级</span>
              <span style="color: #4caf50; font-weight: 500;">
                {{ gaugeValue < 30 ? '优秀' : gaugeValue < 60 ? '良好' : '一般' }}
              </span>
            </div>
          </div>
          
          <div style="background: rgba(255, 152, 0, 0.1); border-radius: 6px; padding: 8px;">
            <div style="font-size: 12px; color: #e0e0e0; margin-bottom: 4px;">⚠️ 预警信息</div>
            <div style="font-size: 11px; color: #ff9800;">
              {{ gaugeValue > 80 ? '能耗偏高' : '运行正常' }}
            </div>
          </div>
        </div>
        
        <!-- 右侧仪表盘 -->
        <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
          <div style="position: relative; width: 140px; height: 140px;">
            <!-- 外圈 -->
            <div style="position: absolute; width: 100%; height: 100%; border: 6px solid rgba(255, 255, 255, 0.1); border-radius: 50%;"></div>
            <!-- 内圈背景 -->
            <div style="position: absolute; width: 90%; height: 90%; top: 5%; left: 5%; border: 5px solid rgba(79, 195, 247, 0.3); border-radius: 50%;"></div>
            <!-- 进度弧线 -->
            <div 
              style="position: absolute; width: 90%; height: 90%; top: 5%; left: 5%; border: 5px solid transparent; border-radius: 50%; transform: rotate(-135deg);"
              :style="{
                borderTopColor: gaugeValue > 80 ? '#f44336' : gaugeValue > 60 ? '#ff9800' : '#4fc3f7',
                borderRightColor: gaugeValue > 80 ? '#f44336' : gaugeValue > 60 ? '#ff9800' : '#4fc3f7',
                clipPath: `inset(0 0 0 ${100 - (gaugeValue / (card.gaugeChart.maxValue - card.gaugeChart.minValue)) * 100}%)`
              }"
            ></div>
            <!-- 中心数值 -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <div :style="{
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: gaugeValue > 80 ? '#f44336' : gaugeValue > 60 ? '#ff9800' : '#4fc3f7'
              }">
                {{ gaugeValue.toFixed(1) }}{{ card.gaugeChart.unit }}
              </div>
              <div style="font-size: 10px; color: #b0b0b0; margin-top: 2px;">
                能耗指数
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 监控画面网格布局 -->
      <div v-if="card.gridData" style="width: 100%;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
          <div 
            v-for="(camera, idx) in card.gridData" 
            :key="idx"
            style="background-color: rgba(0, 0, 0, 0.3); border: 1px solid; border-radius: 6px; padding: 8px; aspect-ratio: 4/3; display: flex; flex-direction: column; justify-content: space-between;"
            :style="{
              borderColor: camera.status === '在线' ? '#4caf50' : camera.status === '离线' ? '#f44336' : '#ff9800',
              boxShadow: camera.status === '在线' ? '0 0 8px rgba(76, 175, 80, 0.3)' : 'none'
            }"
          >
            <!-- 摄像头标识和状态 -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 500; color: #e0e0e0;">{{ camera.id }}</span>
              <span 
                :style="{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: camera.status === '在线' ? '#4caf50' : camera.status === '离线' ? '#f44336' : '#ff9800'
                }"
              >
                {{ camera.status }}
              </span>
            </div>
            
            <!-- 位置信息 -->
            <div style="font-size: 11px; color: #b0b0b0; margin: 4px 0; flex: 1; display: flex; align-items: center;">
              📍 {{ camera.location }}
            </div>
            
            <!-- 时间信息 -->
            <div style="font-size: 10px; color: #9e9e9e; text-align: right;">
              {{ camera.time }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 进度条 -->
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
      
      <!-- 列表数据 -->
      <div v-if="card.listData && card.title !== '设备能耗排行'" style="width: 100%;">
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
      
      <!-- 入侵检测统计分析 -->
      <div v-if="card.intrusionData" style="width: 100%;">
        <div v-for="(item, idx) in card.intrusionData" :key="idx"
          style="margin-bottom: 6px; padding: 4px; background-color: rgba(255, 255, 255, 0.03); border-radius: 3px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(79, 195, 247, 0.2);">
          <!-- 左侧：入侵类型（白色） -->
          <div style="font-size: 12px; color: #ffffff; flex: 1;">
            {{ item.type }}
          </div>
          
          <!-- 右侧：数量显示 -->
          <div style="font-size: 13px; color: #4fc3f7; font-weight: 500;">
            {{ item.count }}次
          </div>
        </div>
      </div>
      
      <!-- 环境监测数据 -->
      <div v-if="card.environmentData" style="width: 100%;">
        <div v-for="(item, idx) in card.environmentData" :key="idx" 
             style="margin-bottom: 8px; padding: 6px; background-color: rgba(255, 255, 255, 0.05); border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px; color: #e0e0e0; flex: 1;">{{ item.name }}</div>
          <div style="font-size: 12px; color: #4fc3f7; margin: 0 8px; font-weight: 500;">{{ item.value }}{{ item.unit }}</div>
          <div :style="{ 
            fontSize: '11px', 
            padding: '2px 6px', 
            borderRadius: '3px', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: getEnvironmentLevelColor(item.level)
          }">
            {{ item.level }}
          </div>
        </div>
      </div>
      
      <!-- 园区活动列表 -->
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
      
      <!-- 设备能耗排行 -->
      <div v-if="card.listData && card.title === '设备能耗排行'" style="width: 100%;">
        <!-- 表头 -->
        <div
          style="display: grid; grid-template-columns: 2fr 1.5fr 1fr 1.5fr; gap: 5px; font-size: small; font-weight: bold; margin-bottom: 8px; padding: 5px; background-color: rgba(255, 152, 0, 0.2); border-radius: 4px;">
          <div>设备名称</div>
          <div>位置</div>
          <div>等级</div>
          <div>功率</div>
        </div>
        <!-- 数据行 -->
        <div v-for="(item, idx) in card.listData" :key="idx"
          style="display: grid; grid-template-columns: 2fr 1.5fr 1fr 1.5fr; gap: 5px; font-size: small; margin-bottom: 6px; padding: 4px; background-color: rgba(255, 255, 255, 0.05); border-radius: 4px; border-left: 3px solid;"
          :style="{
            borderLeftColor: getEnergyRankingColor(item.status)
          }">
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ffffff;">{{ item.deviceId }}</div>
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #b0b0b0;">{{ item.location }}</div>
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <span :style="{ 
              color: getEnergyRankingColor(item.status),
              fontWeight: '500',
              fontSize: '11px'
            }">
              {{ item.status.replace('耗能', '') }}
            </span>
          </div>
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ff9800; font-weight: 500;">{{ item.time }}</div>
        </div>
      </div>
      
      <!-- 纯文本内容 -->
      <div v-if="card.content" style="font-size: small;">{{ card.content || '' }}</div>
      
      <!-- 插槽内容（用于向后兼容） -->
      <slot/>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
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
  // 卡片数据对象（包含所有可能的数据类型）
  card: {
    type: Object,
    default: () => ({})
  }
})

// 图表引用
const chartRefs = ref({})

// 仪表盘动态数值
const gaugeValue = ref(props.card.gaugeChart?.currentValue || 68.5)

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
      bodyColor: '#e0e0e0',
      callbacks: {
        label: function(context) {
          // 根据图表标题判断显示不同的单位
          const chartTitle = context.chart.config._config.data.datasets[0].label;
          if (chartTitle.includes('降雨量')) {
            return context.dataset.label + ': ' + context.parsed.y + 'mm';
          } else if (chartTitle.includes('月度访问量')) {
            return context.dataset.label + ': ' + context.parsed.y + '人';
          } else {
            // 默认情况不显示单位
            return context.dataset.label + ': ' + context.parsed.y;
          }
        }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#e0e0e0' },
      grid: { color: 'rgba(255, 255, 255, 0.1)' }
    },
    y: {
      ticks: { 
        color: '#e0e0e0',
        callback: function(value) {
          if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'k';
          }
          return value;
        }
      },
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
      beginAtZero: true
    }
  }
}

// 为barChart专门优化的配置
const barChartOptions = {
  ...chartOptions,
  scales: {
    ...chartOptions.scales,
    x: {
      ...chartOptions.scales.x,
      // 柱状图特有配置
      barPercentage: 0.6,  // 单个柱子宽度占比
      categoryPercentage: 0.8  // 类别组整体占比
    }
  }
}

// 初始化图表
const initChart = (canvasRef, type) => {
  if (canvasRef && (props.card.lineChart || props.card.barChart)) {
    const ctx = canvasRef.getContext('2d')
    const chartType = props.card.barChart ? 'bar' : 'line'
    const chartData = props.card.barChart || props.card.lineChart
    // 根据图表类型选择配置
    const options = props.card.barChart ? barChartOptions : chartOptions
    
    return new Chart(ctx, {
      type: chartType,
      data: chartData,
      options: options
    })
  }
  return null
}

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

// 获取能耗等级对应的颜色
const getEnergyRankingColor = (level) => {
  const colorMap = {
    '高': '#f44336',
    '中': '#ff9800',
    '低': '#4caf50'
  }
  return colorMap[level.replace('耗能', '')] || '#9e9e9e'
}

// 监听仪表盘数据变化
watch(() => props.card.gaugeChart?.currentValue, (newValue) => {
  if (newValue !== undefined) {
    gaugeValue.value = newValue
  }
}, { immediate: true })

// 监听数据变化
watch(() => props.card, () => {
  // 重新初始化图表的逻辑可以在这里添加
}, { deep: true })
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