<template>
  <div class="wordcloud-container">
    <div class="wordcloud" id="backgroundmap">
      <div class="map-image-background" id="charts-content2"></div>
    </div>
    <div class="mask-uploader">
      <input type="file" accept="image/*" ref="fileInput" style="display: none">
      <button class="upload-btn">上传图片</button>
      <div class="font-size-sliders">
        <div class="slider-container">
          <span class="slider-label">最小值</span>
          <input type="range" min="1" max="50" class="slider">
          <span class="slider-value">10</span>
        </div>
        <div class="slider-container">
          <span class="slider-label">最大值</span>
          <input type="range" min="10" max="100" class="slider">
          <span class="slider-value">30</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
    import Js2WordCloud from 'js2wordcloud';
    import { ref, onMounted, watch } from 'vue';
    import { useMapStore } from '@/store/mapStore';
    import { usewordsStore } from '@/store/words';
    //import mapImage from '@/static/map.png';

    const mapStore = useMapStore();
    const wordsStore = usewordsStore();
    
    function initWordCloud() {
        var wc = new Js2WordCloud(document.getElementById('charts-content2'))
        const wordsList = wordsStore.WordsAndWeights.map(item => [item.name, Math.floor(item.value * 100)])
        wc.setOption({
            imageShape: 'wuhan.png',
            //imageShape: '../../wuhan.png',
            //imageShape: mapStore.mapImage,
            drawOutOfBound: false,
            shrinkToFit: true,
            fontSizeFactor: 0.1,  // 当词云值相差太大，可设置此值进字体行大小微调，默认0.1
            maxFontSize: 60,      // 最大fontSize，用来控制weightFactor，默认60
            minFontSize: 1,      // 最大fontSize，用来控制weightFactor，默认60
            gridSize: 0,          // 密集程度 数字越小越密集
            weightFactor: 1,      // 字体大小=原始大小*weightFactor
            fontWeight: 700, //字体粗细
            fontFamily: 'sans-serif', // 字体
            color: 'random-light', // 字体颜色 'random-dark' 或者 'random-light'
            backgroundColor: 'transparent', // 背景颜色
            rotateRatio: 0.2, // 字体倾斜(旋转)概率，1代表总是倾斜(旋转)
            minRotation:-Math.PI/2,
            maxRotation:-Math.PI/2,
            rotationSteps:2,
            
            tooltip: {
                show: false,
                backgroundColor: 'rgba(0, 0, 0, 0.701961)',
                formatter: function(item) {
                    return item[0] + ': ' + item[1];
                }
            },
            noDataLoadingOption: {
                backgroundColor: '#888',
                text: '暂无数据',
            },
            list: wordsList,
        })
        console.log("词云信息")
        console.log(wc)
    }

    onMounted(() => {
        initWordCloud()
        updateMapImageBackground()
    })

    // 监听词库数据变化
    watch(() => wordsStore.WordsAndWeights, () => {
        initWordCloud()
    }, { deep: true })

    // 监听地图图像数据变化
    watch(() => mapStore.mapImage, () => {
        console.log('地图图像数据变化')
        initWordCloud()
        updateMapImageBackground()

    })

    // 更新背景图片
    function updateMapImageBackground() {
        console.log('更新背景图片')
        const chartDom = document.getElementById('backgroundmap');
        if (chartDom) {
          chartDom.style.backgroundImage = `url(wuhan.png)`;
          //chartDom.style.backgroundImage = `url(${mapStore.mapImage})`;
          //chartDom.style.backgroundImage = `url(https://holanlan.github.io/b2wordcloud/src/logo.png)`;
          chartDom.style.backgroundSize = 'contain';
          chartDom.style.backgroundPosition = 'center';
          chartDom.style.backgroundRepeat = 'no-repeat';
        }
    }
</script>

<style lang="scss" scoped>
.wordcloud-container {
  width: 40%;
  height: 60%;
  border: 3px solid #4d6f94;
  position: absolute;
  top: 100%;
  left: 23.5%;
  background-color: #d7e9ef;
  border-radius: 20px;
  z-index: 10;
}

// .wordcloud {
//   position: relative;
//   width: 95%;
//   height: calc(100% - 60px);
//   // transform: scale(0.6);
//   // transform-origin: center center;
// }

.map-image-background {
  position: absolute;
  top: 0;
  left: 20%;
  width:60%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  //opacity: 0.3;
  z-index: 9999;
  //transform: scale(0.75);
  transform-origin: center center;
}

.mask-uploader {
  margin-top: 10px;
  text-align: center;
}

.upload-btn {
  padding: 8px 8px;
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4d6f94;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.font-size-sliders {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
}

.slider-container {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.slider-label {
  width: 60px;
  text-align: right;
  margin-right: 10px;
  font-size: 14px;
}

.slider {
  flex: 1;
  margin: 0 10px;
}

.slider-value {
  width: 30px;
  text-align: left;
  font-size: 14px;
}
</style>