<template>
    <div class="dragcontainer">
        <!-- <div class="dragfile"
        style="overflow: auto;"
        :class="{dragenter:dragEnter,dragfile_plus:!fileContent}"
        @dragover="handleDragOver"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
        >
            <div v-if="!fileContent" style="padding: 100px;">将文件拖拽到此处</div>
            <div v-else style="padding: 5px 5px 5px 5px ;">{{fileContent}}</div>
            
        </div>
        <button @click="clearjson" style="position: absolute;bottom: 10px;left: 15px;">清空json文件</button>
        <button @click="geojsontoMap" style="position: absolute;bottom: 10px;left: 115px;">添加到地图</button>
     -->
        <div
        @dragover.prevent="onDragOver"
        @drop.prevent="onDrop"
        class="dragfile"
        style="border: 2px dashed #ccc; text-align: center;">
            拖拽 GeoJSON 文件到这里
        </div>
    </div>

</template> 

<script setup>
    import {ref} from 'vue'
    import {usewordsStore} from '@/store/words'
    import { useMapStore } from '@/store/mapStore'
    import 'leaflet/dist/leaflet.css'
    const dragEnter = ref(false)
    const fileContent = ref("")
    const mapStore = useMapStore()
    let wordsStore = usewordsStore()
    let geojsonfile = wordsStore.geojsonfile

    const onDragOver = (event) => {
        event.dataTransfer.dropEffect = 'copy';
    };

    const onDrop = (event) => {
        // const file = event.dataTransfer.files[0];
        // if (file && file.type === 'application/json') {
        //     const reader = new FileReader();
        //     reader.onload = (e) => {
        //     const geoJsonData = JSON.parse(e.target.result);
        //     mapStore.setGeoJsonData(geoJsonData); // 将 GeoJSON 数据存储到 Pinia
        //     };
        //     reader.readAsText(file);
        // } else {
        //     alert('请拖拽一个有效的 GeoJSON 文件');
        // }
        const file = event.dataTransfer.files[0];
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (e) => {
            const geoJsonData = JSON.parse(e.target.result);
            mapStore.addGeoJsonToMap(geoJsonData); // 将 GeoJSON 数据存储到 Pinia
            };
            reader.readAsText(file);
            console.log("geojsonfile",geoJsonData)
        } else {
            alert('请拖拽一个有效的 GeoJSON 文件');
        }
    };


    // const handleDragEnter = (e)=>{
    //     dragEnter.value = true
    //     e.preventDefault()
    // }
    // const handleDragOver = (e)=>{
    //     dragEnter.value = true
    //     e.preventDefault()
    // }
    // const handleDragLeave = (e)=>{
    //     dragEnter.value = false
    //     e.preventDefault()
    // }
    // const handleDrop = (e)=>{
    //     dragEnter.value = false
    //     e.preventDefault()
    //     const file = e.dataTransfer.files[0]
    //     const reader = new FileReader()
    //     reader.onload = (e)=>{
    //         fileContent.value = e.target.result
    //     }
    //     reader.readAsText(file)
    // }
    // function clearjson(){
    //     console.log("clearjson")
    //     fileContent.value = ""
    // }
    // function geojsontoMap(){
    //     console.log("geojsontoMap")
    //     wordsStore.geojsonfile.push(fileContent.value)
    //     console.log(wordsStore.geojsonfile)
    // }

</script>

<style lang="scss" scoped>

</style>