<template>
  <div class="footer">
    <ul>
      <!-- 1行循环简化，无冗余 -->
      <li 
        v-for="(nav, idx) in navs" 
        :key="idx" 
        :class="{ selected: activeNav === idx, collapsed: !showPanels }"
      >
        <p>{{ nav.name }}</p>
        <img :src="nav.img" style="width: 100%;"> <!-- 路径直接用下面的无歧义写法 -->
        <div class="mask" @click="handleNavClick(idx)"></div>
      </li>
    </ul>
    <!-- 底部footer.png也同步改路径 -->
    <img :src="'/src/assets/img/footer.png'" style="display: block; width: 100%;transform: scale(0.8);padding-left: 0.3vw;">
  </div>
</template>

<script setup>
const props = defineProps({
  activeNav: { type: Number, required: true, default: 0 },
  showPanels: { type: Boolean, required: true, default: true }
})

const emit = defineEmits(['nav-change', 'panel-toggle'])
const handleNavClick = (index) => emit('nav-change', index)

// 关键：路径改成「/src/assets/...」（直接指向项目src目录下的assets，无任何相对路径歧义）
const navs = [
  { name: '综合态势', img: '/src/assets/img/icon1.png' },
  { name: '园测数据', img: '/src/assets/img/icon2.png' },
  { name: '安防监控', img: '/src/assets/img/icon3.png' },
  { name: '能源管理', img: '/src/assets/img/icon4.png' }
]
</script>

<style scoped>
* {
  all: unset;
  box-sizing: border-box;
  display: block;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: end;
  width: 100vw;
  z-index: 10;
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
}

.footer ul li.selected:not(.collapsed) {
  transform: translateY(-2vh);
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