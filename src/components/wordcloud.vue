<template>

  <div class="wordcloud-container">
  
    <div class="wordcloud" id="charts-content" ></div>
  
    <div class="mask-uploader">
  
      <input type="file" @change="handleImageUpload" accept="image/*" ref="fileInput" style="display: none">
      <button @click="triggerFileInput" class="upload-btn">上传图片</button>
      <div class="font-size-sliders">
        <div class="slider-container">
          <span class="slider-label">最小值</span>
          <input type="range" min="1" max="50" v-model="minFontSize" @input="updateFontSize" class="slider">
          <span class="slider-value">{{ minFontSize }}</span>
        </div>
        <div class="slider-container">
          <span class="slider-label">最大值</span>
          <input type="range" min="10" max="100" v-model="maxFontSize" @input="updateFontSize" class="slider">
          <span class="slider-value">{{ maxFontSize }}</span>
        </div>
      </div>
    </div>
  </div>
  
</template>
  <script setup> 
  import * as echarts from 'echarts';
  import 'echarts-wordcloud';
  import { ref, onMounted, onUpdated, watch } from 'vue';
  import { usewordsStore } from '@/store/words';
  const wordsStore = usewordsStore();
  const maskImage = ref(null);
  let myChart = null;
  const minFontSize = ref(10);
  const maxFontSize = ref(30);
  
    
  
  // 词云图默认属性
  
  const defaultSeries = [{
    type: 'wordCloud',
    shape: 'circle',
    keepAspect: true,
    maskImage: maskImage.value,
    left: 'center',
    top: 'center',
    width: '90%',
    height: '90%',
    right: null,    bottom: null,
    sizeRange: [minFontSize.value, maxFontSize.value],
    rotationRange: [-90, 90],
    rotationStep: 90,
    gridSize: 0,
    drawOutOfBound: false,
    layoutAnimation: true,
    textStyle: {
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    color: function () {
      return 'rgb(' + [
        
        // Math.round(Math.random() * 160),
        // Math.round(Math.random() * 160),
        // Math.round(Math.random() * 160)
      ].join(',') + ')';
    },
    emphasis: {
      focus: 'self',
      textStyle: {
        shadowBlur: 10,
        shadowColor: '#333',
        fontSize: 20
      }
  },

},
  emphasis: {
    focus: 'self',
    textStyle: {
      shadowBlur: 10,
      shadowColor: '#333',
      fontSize: 20
    }
  },
  data: []
  }]; 
  // 更新词云图的蒙版
  const fileInput = ref(null);

  const triggerFileInput = () => {
    fileInput.value.click();
  };
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      maskImage.value = e.target.result;
      // 设置背景图片
      const chartDom = document.getElementById('charts-content');
      if (chartDom) {
        chartDom.style.backgroundImage = `url(${e.target.result})`;
        chartDom.style.backgroundSize = 'contain';
        chartDom.style.backgroundPosition = 'center';
        chartDom.style.backgroundRepeat = 'no-repeat';
      }
      DrawWordCloud();
    };
    reader.readAsDataURL(file);  
  };
  // 更新字体大小的方法
  const updateFontSize = () => {
  // 确保最大值始终大于最小值
  if (Number(minFontSize.value) >= Number(maxFontSize.value)) {
    maxFontSize.value = Number(minFontSize.value);
  }
  defaultSeries[0].sizeRange = [Number(minFontSize.value), Number(maxFontSize.value)];
  DrawWordCloud();  
  };

  // 绘制词云图
  function DrawWordCloud() {
  const chartDom = document.getElementById('charts-content');
  if (!myChart) {
    myChart = echarts.init(chartDom);
  }
  const option = {
    series: defaultSeries.map(series => ({
      ...series,
      maskImage: maskImage.value ? new Image() : undefined,
      data: wordsStore.WordsAndWeights.map(item => ({
        name: item.name,
        value: Math.max(item.value, 1), // 确保权重至少为1
        textStyle: {
          color: series.textStyle.color()
        }
      })),

    }))
  };
  if (maskImage.value) {
      const maskImg = new Image();
      maskImg.src = maskImage.value;
      maskImg.onload = () => {
        option.series[0].maskImage = maskImg;
        myChart.setOption(option);
      };
    } else {
      myChart.setOption(option);
    }
  
  }
  onMounted(() => {  
    DrawWordCloud();
  });
  onUpdated(() => {
    DrawWordCloud();
  });
  

  watch(  
    () => wordsStore.WordsAndWeights, 
    () => { 
      DrawWordCloud();  
    },  
    { deep: true }  
  );
  </script>

  <style lang="scss" scoped>
  
  .wordcloud-container {
      width: 22%;
      height:38.5%;
      border:3px solid #4d6f94;
      position:absolute;  
      top: 58.5%; 
      left: 23.5%;  
      background-color: #d7e9ef;  
      border-radius: 20px;  
      z-index: 10;
  }

  .mask-uploader {
    margin-top: 10 ;  
    text-align: center;
  }

  .upload-btn {
    padding: 8px 8px;
    position:absolute;
    bottom:5px;
    left:10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .font-size-sliders {
  
    position: absolute;
    bottom: 5px;
    right: 10px;
    width: 200px;
  }

  .slider-container {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }

  .slider-label {
    font-size: 10px;
    margin-right: 8px;
    width: 40px;
    text-align: right;
  }
  
    
  
  .slider-value {
    margin-left: 8px;
    font-size: 12px;
    width: 24px;
    text-align: right;
  }
  
  .slider {
    flex: 1;
    height: 5px;
    background: #ddd;
    outline: none;
    border-radius: 5px;
    //-webkit-appearance: none;
  
    &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 15px;
    height: 15px;
    background: #4CAF50;
    border-radius: 50%;
    cursor: pointer;
    }
  }
  
  </style>