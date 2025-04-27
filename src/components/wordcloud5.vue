<template>
  <div class="wordcloud-container">
    <div class="wordcloud" id="backgroundmap5">
      <div class="map-image-background" id="charts-content5"></div>
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
    import  BP2wordcloud from 'bp2wordcloud';

    import { ref, onMounted, watch } from 'vue';
    import { useMapStore } from '@/store/mapStore';
    import { usewordsStore } from '@/store/words';

    const mapStore = useMapStore();
    const wordsStore = usewordsStore();



    function initWordCloud() {
        const wordsList = wordsStore.WordsAndWeights.map(item => [item.name, Math.floor(item.value * 100)])
        var wc = new BP2wordcloud(document.getElementById('charts-content5'),{
            maskImage:'wuhan.png',
            drawOutOfBound: false,
            shrinkToFit: true,
            fontSizeFactor: 0.1,
            gridSize: 0,
            maxFontSize: 60,
            minFontSize: 1,
            weightFactor: 1,
            fontWeight: 700,
            fontFamily: 'sans-serif',
            color: 'random-light',
            backgroundColor: 'transparent',
            rotateRatio: 0.2,
            minRotation: -Math.PI/2,
            maxRotation: Math.PI/2,
            rotationSteps: 2,
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
            wordRec:true,
            drawMask:true,
        })
        console.log("词云信息5")
        console.log(wc)
    }

    onMounted(() => {
        initWordCloud()
        updateMapImageBackground()
    })

    watch(() => wordsStore.WordsAndWeights, () => {
        initWordCloud()
    }, { deep: true })

    watch(() => mapStore.mapImage, () => {
        console.log('地图图像数据变化5')
        initWordCloud()
        updateMapImageBackground()
    })

    function updateMapImageBackground() {
        console.log('更新背景图片5')
        const chartDom = document.getElementById('backgroundmap5');
        if (chartDom) {
          chartDom.style.backgroundImage = `url(wuhan.png)`;
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
  top: 240%;
  left: 23.5%;
  background-color: #d7e9ef;
  border-radius: 20px;
  z-index: 10;
}

.map-image-background {
  position: absolute;
  top: 0;
  left: 20%;
  width:60%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  z-index: 9999;
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