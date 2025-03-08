<template>
    <div class="mapbackground">
        <!-- <div class="mymap" id="mymap">
            <h3>map</h3>
            
        </div> -->
        <div ref="mapContainer" class="mymap"></div>
        <button 
            @click="toggleDrawing"
            class="map_startdraw" 
            :class="{map_startdraw_after: mapStore.isDrawing}">
            {{mapStore.isDrawing ? '停止绘制' : '开始绘制'}}
        </button>

        
        <button
            @click = "deleteDraw"
            class = "map_deletedraw"
        >
            清空地图
        </button>
        <button class="map_loadjson" @click="loadjson">
            加载geojson
        </button>
        <button class="mapflushed" @click="mapflushed">刷新地图</button>
    </div>

</template>

<script setup name="leafletmap">
    import L from 'leaflet'
    import 'leaflet/dist/leaflet.css'
    import { onMounted,ref,watch } from 'vue';
    import wuhanData from "../store/wuhan.json"
    import {usewordsStore} from "@/store/words"
    import { useMapStore } from '@/store/mapStore';

    const mapContainer = ref(null);
    const mapStore = useMapStore();
    const isDrawing = ref(false);
    // 初始化地图
    onMounted(() => {
        mapStore.initializeMap(mapContainer.value);
    });
    const toggleDrawing = () => {
        mapStore.toggleDrawing(); // 切换绘制模式
    };
    // // 监听 geoJsonData 的变化
    // watch(
    //     () => mapStore.geoJsonData,
    //     () => {
    //         mapStore.addGeoJsonToMap();
    //     }
    // );


    // let judge = ref(false)
    
    // //绘制多边形part
    // //定义变量项
    // let map = ref()
    // let mymap
    // let points = []
    // let polygon
    // let timer
    // let wordsStore = usewordsStore()
    // let mygeojsons = ref(wordsStore.geojsonfile)


    const deleteDraw=()=>{
        mapStore.clearLayers()
    }
    // function drawPolygon(){
    //     judge.value = !judge.value
    //     if(judge.value){
    //         if(polygon){
    //             deleteDraw()
    //         }
    //         points = []
    //         polygon = new L.polygon(points, {color: 'red'}).addTo(mymap)
    //         mymap.off("dblclick")
    //         mymap.on("click",onClick)
    //     }
    // }
    // function onClick(e){
    //     clearTimeout(timer)
    //     timer = setTimeout(()=>{
    //         points.push([e.latlng.lat,e.latlng.lng])
    //         polygon.setLatLngs(points)
    //         mymap.on("mousemove",onMove)
    //         mymap.on("dblclick",onDoubleClick)
    //         console.log("click",polygon._latlngs[0])
    //     },50)
    // }
    // function onMove(e){
    //     points.push([e.latlng.lat,e.latlng.lng])
    //     polygon.setLatLngs(points)
    //     points.pop()
    // }
    // function onDoubleClick(e){
    //     clearTimeout(timer)
    //     judge.value = !judge.value
    //     mymap.off("click")
    //     mymap.off("mousemove")
    // }

    // //初始化
    // const initData=()=>{
    //     mymap = L.map('mymap').setView([34, 113], 4)
    //     L.tileLayer('https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    //         maxZoom: 13,
    //         attribution: '© OpenStreetMap'
    //     }).addTo(mymap)
        
    //     L.geoJSON(wuhanData).addTo(mymap)
    // }

    // function startDraw(){ 
    //     judge.value = !judge.value
    //     console.log('startDraw')
    // }

    // //加载json文件
    // function loadjson(){
    //     console.log('loadjson')
    //     console.log(wuhanData)
    //     L.geoJSON(wuhanData).addTo(mymap)
    // }
    // //刷新地图
    // function mapflushed(){
    //     mymap.remove()
    //     initData()
    // }
    // onMounted(() => {
        
    //     console.log('mounted')
    //     initData()
    // })

</script>

<style lang="scss" scoped>

</style>
