<template>
    <div class="textinput">
        <h3 align="center">文本输入</h3>
        <div 
            class="drop-zone"
            @dragover.prevent="handleDragOver"
            @drop.prevent="handleDrop"
        >
            <textarea 
            v-model="message" 
            class="inputTextarea"
            placeholder="请按照 文本 数字 的格式输入，每行一个词组
例如：
武汉 9.8
长江 8.5
黄鹤楼 7.2

您也可以直接拖拽txt文件到此处">
            </textarea>
        </div>
        <button style="margin-top: 10%;margin-left: 35%;" @click="textrender">生成容器</button>
    </div>
</template>

<script setup name="mywordinput123">
    import { ref } from 'vue'
    import {usewordsStore} from '@/store/words'
    // 定义数据
    let message = ref('')
    let wordsStore = usewordsStore()

    // 拖拽相关方法
    function handleDragOver(event) {
        event.target.classList.add('drag-over')
    }

    function handleDrop(event) {
        event.target.classList.remove('drag-over')
        const files = event.dataTransfer.files
        if (files.length > 0) {
            const file = files[0]
            if (file.type === 'text/plain') {
                const reader = new FileReader()
                reader.onload = (e) => {
                    message.value = e.target.result
                }
                reader.readAsText(file)
            }
        }
    }
    // 定义方法
    function textrender(){
        console.log("开始渲染：", message.value)
        // 按行分割输入文本
        const lines = message.value.split('\n').filter(line => line.trim())
        
        // 清空现有数据
        wordsStore.WordsAndWeights.splice(0, wordsStore.WordsAndWeights.length)
        
        // 处理每一行
        lines.forEach(line => {
            // 使用正则表达式匹配文本和数字
            const match = line.trim().match(/^([^\d]+)\s*(\d*\.?\d*)?$/)
            if (match) {
                const text = match[1].trim()
                const value = match[2] ? parseFloat(match[2]) : 0
                
                if (text) {
                    wordsStore.WordsAndWeights.push({
                        name: text,
                        value: value
                    })
                }
            }
        })
        
        console.log("更新后的pinia数据", wordsStore.WordsAndWeights)
    }
</script>

<style lang="scss" scoped>
.drop-zone {
    width: 100%;
    height: 58%;

    position: relative;
    
    &.drag-over {
        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.1);
            pointer-events: none;
        }
    }
}

.inputTextarea {
    width: 80%;
    height: 100%;
    margin: 10px auto;
    display: block;
    padding: 10px;
    border: 2px dashed #ccc;
    
    &:hover {
        border-color: #666;
    }
}
</style>