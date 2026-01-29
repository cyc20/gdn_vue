<template>
    <!-- 左侧内容区域 -->
    <div class="panel left-p">
        <div class="content">
            {{ panelContent.left }}
        </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="panel right-p">
        <div class="content">
            {{ panelContent.right }}
        </div>
    </div>

    <div class="footer">
        <ul>
            <li :class="{ selected: activeNav === 0, collapsed: !showPanels }">
                <p>综合态势</p>
                <img src="../assets/img/icon1.png" style="width: 100%;">
                <div class="mask" @click="switchNav(0)"></div>
            </li>
            <li :class="{ selected: activeNav === 1, collapsed: !showPanels }">
                <p>园测数据</p>
                <img src="../assets/img/icon2.png" style="width: 100%;">
                <div class="mask" @click="switchNav(1)"></div>
            </li>
            <li :class="{ selected: activeNav === 2, collapsed: !showPanels }">
                <p>安防监控</p>
                <img src="../assets/img/icon3.png" style="width: 100%;">
                <div class="mask" @click="switchNav(2)"></div>
            </li>
            <li :class="{ selected: activeNav === 3, collapsed: !showPanels }">
                <p>能源管理</p>
                <img src="../assets/img/icon4.png" style="width: 100%;">
                <div class="mask" @click="switchNav(3)"></div>
            </li>
        </ul>
        <img src="../assets/img/footer.png" style="display: block; width: 100%;transform: scale(0.8);padding-left: 0.3vw;">
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 导航栏选项配置
const navItems = ref([
    {
        name: '首页',
        left: '### 首页左侧面板\n- 3D场景概览\n- 园区整体数据\n- 实时监控状态',
        right: '### 首页右侧面板\n- 设备在线率：98%\n- 环境温度：25℃\n- 湿度：60%\n- 风速：2m/s'
    },
    {
        name: '数据监控',
        left: '### 数据监控左侧\n- 能耗数据统计\n- 设备运行时长\n- 故障报警记录',
        right: '### 数据监控右侧\n- 今日能耗：1200kWh\n- 本月能耗：35000kWh\n- 故障数量：0'
    },
    {
        name: '设备管理',
        left: '### 设备管理左侧\n1. 照明设备（56台）\n2. 监控设备（32台）\n3. 环境传感器（18台）',
        right: '### 设备管理右侧\n- 在线设备：104台\n- 离线设备：2台\n- 待维护：0台'
    },
    {
        name: '系统设置',
        left: '### 系统设置左侧\n- 用户权限管理\n- 场景参数配置\n- 数据备份设置',
        right: '### 系统设置右侧\n- 当前登录用户：管理员\n- 最后备份时间：2026-01-18\n- 自动备份：开启'
    }
])
// 当前激活的导航项索引(范围0-3)
const activeNav = ref(0)
// 面板显示状态
const showPanels = ref(true)
// 面板内容数据
const panelContent = ref({
    left: navItems.value[0].left,
    right: navItems.value[0].right
})

// 计算左右面板的位置变换
const leftPanelTransform = computed(() => {
    return showPanels.value ? '0' : '-100%'
})

const rightPanelTransform = computed(() => {
    return showPanels.value ? '0' : '100%'
})





// 切换导航项方法
const switchNav = (index) => {
    // 如果点击的是当前已激活的导航项，则切换面板显示状态
    if (activeNav.value === index) {
        showPanels.value = !showPanels.value
    } else {
        activeNav.value = index
        showPanels.value = true // 点击其他导航项时确保面板显示
    }
    panelContent.value.left = navItems.value[index].left
    panelContent.value.right = navItems.value[index].right
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
    /* 修改：避开新标题区域高度 */
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
    /* 修改：直接贴到左边 */
    transform: translateX(v-bind(leftPanelTransform));
    /* 动态控制左侧板位置 */
    text-align: left;
    margin: auto;
}

/* 右侧面板 - 居中靠右 */
.right-p {
    right: 0;
    /* 修改：直接贴到右边 */
    transform: translateX(v-bind(rightPanelTransform));
    /* 动态控制右侧板位置 */
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




/* ////////////////////////////////////////////// 底部导航栏 ////////////////////////////////////////////// */
.footer {
    position: fixed;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: end;
    width: 100vw;
    z-index: 10;
    /* 高于3D场景 */
}

.footer ul {
    display: flex;
    width: fit-content;
    margin: 0 auto;
    gap: 3vw;
}

.footer ul li {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 6vw;
    color: #ffffff;
    font-size: 1vw;
    transition: transform 0.3s ease;
    /* 添加过渡动画 */
}

.footer ul li.selected:not(.collapsed) {
    transform: translateY(-2vh);
    /* 选中时向上移动2vh */
}

.footer ul li .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}
</style>