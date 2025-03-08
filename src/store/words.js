import { defineStore } from "pinia";

export const usewordsStore = defineStore("words", {
    //真正存储数据的地方
    state(){
        return{
            WordsAndWeights:[
                {name:'江城',value:0.92},
                {name: '黄鹤楼',value: 0.89},
                { name: '热干面', value: 0.88 },
                { name: '东湖', value: 0.85 },
                { name: '九省通衢', value: 0.83 },
                { name: "长江大桥", value: 0.81 },
                { name: '光谷', value: 0.79 },
                { name: '高校云集', value: 0.77 },
                { name: '户部巷', value: 0.75 },
                { name: '汉秀码头', value: 0.73 },
                { name: '樱花', value: 0.71 },
                { name: "武昌起义", value: 0.69 }

            ],
            geojsonfile:[]
        }
    }
})