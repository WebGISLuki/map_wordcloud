// import './assets/main.css'
import './assets/mystyle.css'
import { createApp } from 'vue'
import App from './App.vue'
// main.js 或地图组件的脚本部分
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
//引入pinia
import { createPinia } from 'pinia'
const app = createApp(App)
//创建pinia
const pinia = createPinia()
//安装pinia
app.use(pinia)
app.mount('#app')
