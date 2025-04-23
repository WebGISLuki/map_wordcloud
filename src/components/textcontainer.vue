<template>
    <div class="textContainer">
        <h3 align="center">文本容器</h3>
        <div class="containerTitle">
            关键词-------权重
        </div>
        <div class="container">
            <div v-for="item in container" >
            <!-- {{ item.word }}---{{ item.weight }} -->
            
            <input class="word" type="text" v-model="item.name"/>
            <input class="weight" type="text" v-model="item.value"/>
        </div>
        </div>

        <button @click="addElement" style="position:absolute;bottom: 15px;margin-right: 10px;">添加关键词</button>
        <button @click="mapRender" style="position:absolute;bottom: 15px;left: 100px;">确认渲染</button>
        <button @click="clearWords" style="position:absolute;bottom: 15px;left:67%;">清空关键词</button>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import {usewordsStore} from '@/store/words'
    import { onMounted,onUpdated } from 'vue'
    let wordsStore = usewordsStore()
    let container = wordsStore.WordsAndWeights

    //方法
    function addElement(){
        let tempWordAndWeight = {
            name: "请修改关键词",
            value: 0
        }
        wordsStore.WordsAndWeights.push(tempWordAndWeight)

    }
    function mapRender(){
        console.log("渲染地图")
    }
    function clearWords(){
        wordsStore.WordsAndWeights.splice(0,wordsStore.WordsAndWeights.length)
    }

    onMounted(()=>{
        console.log("容器已挂载")
        console.log(wordsStore.WordsAndWeights)
    })
    onUpdated(()=>{
        console.log("容器已更新")
        console.log(wordsStore.WordsAndWeights)
    })
</script>

<style lang="scss" scoped>
    .container{
        margin-top: 20px;
        border : 1px solid #000;
        border-radius: 10px;
        //position: absolute;
        //top:85px;
        width: 100%;
        height:75%;
        //display: none;
        overflow: scroll;
    }
</style>