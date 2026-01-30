<template>

    <div class="header">

        <h1>{{ maintitle }}</h1>

        <div class="info">
            <p class="ZYXX" style="font-size: 3vh">{{ subtitle }}</p>
            <p style="font-size: 1.5vh;margin-bottom: 0.6vh;">{{ thirdtitle }}</p>
        </div>

        <div class="time">
            <p id="time-hour" style="font-size: 3vh;"></p>
            <span style="width: 1px;height: 3.2vh;background: #FFFC;margin: 0 1vh;" />
            <div style="font-size: 1.5vh;line-height: 1.2;text-align: left;">
                <p id="time-week"></p>
                <p id="time-date"></p>
            </div>
        </div>
    </div>

</template>


<script setup>
import { onMounted } from 'vue'


defineProps({
    "maintitle": String,
    "subtitle": String,
    "thirdtitle": String
})

let clockTimer = null
// 时钟逻辑
const initClock = () => {
  const weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const updateTime = () => {
    const now = new Date()
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const second = String(now.getSeconds()).padStart(2, '0')
    const hourText = `${hour}:${minute}:${second}`
    const weekText = weekMap[now.getDay()]
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const dateText = `${year}-${month}-${day}`

    document.getElementById('time-hour').textContent = hourText
    document.getElementById('time-week').textContent = weekText
    document.getElementById('time-date').textContent = dateText
  }
  updateTime()
  clockTimer = setInterval(updateTime, 1000)
}

onMounted(() => {
  initClock()
})
</script>




<style scoped>
* {
    all:unset;
    box-sizing: border-box;
    display: block;
}
.header {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: flex-start;/* 垂直居中 */
  width: 100vw;
  height: 11vh;
  color: #3da1ff;
  padding-bottom: 5vh;
  background: url(../assets/img/header.png) center repeat-x;
  mask-image: linear-gradient(to bottom,black 65%,transparent 100%);
  z-index: 10; /* 高于3D场景 */
  pointer-events: none;
}
/* 标题 */
.header h1 {
  font-size: 3.6vh;
  font-weight: bold;
  color: transparent;
  margin: 0 auto;
  letter-spacing: 2px;
  background: linear-gradient(to bottom,#ffffff,hsl(209, 100%, 50%));
  background-clip: text;
  -webkit-background-clip: text;
}

/* 副标题 */
.header .info { 
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: flex-end;
  font-weight: bold;
  margin: 0.8vh 0 0 2vh;
}

.header .info .ZYXX { 
  font-family: "宋体", SimSun, "Songti SC", "Noto Serif CJK SC", "WenQuanYi Song", Arial, serif;
  color: transparent;
  background: linear-gradient(to bottom,#ffffff,hsl(209, 100%, 50%));
  background-clip: text;
  -webkit-background-clip: text;
}

/* 时间 */
.header .time {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  margin: 0.8vh 2vh 0 0;
}


</style>