<template>
    <div class="textinput">
        <h3>文本输入</h3>
        <!-- <input type="text" style="width:200px;height:50px" v-model="message"/> -->
        <textarea 
        style="border-radius: 10px;" 
        v-model="message" 
        class="inputTextarea">
    
        </textarea>
        <button style="margin-top: 5px;" @click="textrender">生成容器</button>
    </div>
</template>

<script setup name="mywordinput123">
//test
    import { ref } from 'vue'
    import {usewordsStore} from '@/store/words'
    // 定义数据
    let message = ref('请输入文本')
    let wordsOut = ref({})
    let wordsStore = usewordsStore()
    console.log("@@@",wordsStore.WordsAndWeights[0].name)
    console.log("@@@",wordsStore.WordsAndWeights[0].value)
    // 定义方法
    function textrender(){
        console.log("开始渲染：",message.value)
        //将字符串划分为词组
        let tempwords = [];
        tempwords = message.value.split(/\s+/)

        wordsStore.WordsAndWeights.splice(0,wordsStore.WordsAndWeights.length)
        console.log(tempwords)
        for (let i = 0;i<tempwords.length;i++){
            // wordsOut.value[tempwords[i]] = 1
            //构建进入词组的对象
            let tempWordAndWeight = {
                name:tempwords[i],
                value:0//此处权值待修改，计划为随机值
            }
            wordsStore.WordsAndWeights.push(tempWordAndWeight)
        }
        console.log("更新后的pinia数据",wordsStore.WordsAndWeights)
        
    }
</script>

<style lang="scss" scoped>

</style>