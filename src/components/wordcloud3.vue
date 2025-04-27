<template>
  <div class="wordcloud-container" id="parentContainer">
    <div class="wordcloud" id="backgroundmap3">
      <div class="map-image-background" id="charts-content3"></div>
    </div>
    <div class="mask-uploader">
      <input type="file" accept="image/*" ref="fileInput" @change="handleFileUpload" style="display: none">
      <button class="upload-btn" @click="triggerFileInput">上传图片(词云轮廓)</button>
      <input type="file" accept="image/*" ref="bgFileInput" @change="handleBgImageUpload" style="display: none">
      <button class="upload-btn bg-btn" @click="triggerBgFileInput">上传背景图片</button>
    </div>
  </div>
</template>

<script setup>
    import b2wordcloud from 'b2wordcloud';
    import { ref, onMounted, watch } from 'vue';
    import { useMapStore } from '@/store/mapStore';
    import { usewordsStore } from '@/store/words';

    const mapStore = useMapStore();
    const wordsStore = usewordsStore();
    const fileInput = ref(null);
    const bgFileInput = ref(null);
    const customMaskImage = ref(null);
    
    function initWordCloud() {
        const chartContent = document.getElementById('charts-content3');
        if (chartContent) {
            chartContent.innerHTML = '';
        }
        const wordsList = wordsStore.WordsAndWeights.map(item => [item.name, Math.floor(item.value * 100)])
         var wc = new b2wordcloud(document.getElementById('charts-content3'),{
            maskImage: customMaskImage.value,
            drawOutOfBound: false,
            shrinkToFit: true,
            fontSizeFactor: 0.1,
            maxFontSize: 100,
            minFontSize: 1,
            gridSize: 0,
            //weightFactor: 1,
            fontWeight: 700,
            fontFamily: 'sans-serif',
            //color: 'random-light',
            color: '',
            backgroundColor: 'transparent',
            rotateRatio: 0,
            // minRotation:-Math.PI/2,
            // maxRotation:-Math.PI/2,
            // rotationSteps:2,
            
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
        console.log("词云信息3")
        console.log(wc)
    }

    function triggerFileInput() {
        fileInput.value.click();
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    const chartDom = document.getElementById('backgroundmap3');
                    const chartsContent = document.getElementById('charts-content3');
                    
                    if (chartDom && chartsContent) {
                        // 设置容器的宽高比
                        chartDom.style.aspectRatio = `${aspectRatio}`;
                        chartsContent.style.aspectRatio = `${aspectRatio}`;
                        if(img.width > img.height){
                            chartsContent.style.width = '100%';
                            chartsContent.style.height = chartsContent.style.width / aspectRatio + 'px';
                        }
                        else{
                            chartsContent.style.height = '100%';
                            chartsContent.style.width = chartsContent.style.height * aspectRatio + 'px';
                        }
                        //chartsContent.style.backgroundImage = `url(${e.target.result})`;
                        // 设置背景图
                        chartDom.style.backgroundImage = `url(${e.target.result})`;
                        chartDom.style.backgroundSize = 'contain';
                        chartDom.style.backgroundPosition = 'center';
                        chartDom.style.backgroundRepeat = 'no-repeat';
                        chartsContent.style.backgroundSize = 'contain';
                        chartsContent.style.backgroundPosition = 'center center';
                        chartsContent.style.backgroundRepeat = 'no-repeat';
                        //chartContainer.style.backgroundImage = `url(${e.target.result})`;
                    }
                    
                    customMaskImage.value = e.target.result;
                    initWordCloud();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    function triggerBgFileInput() {
        bgFileInput.value.click();
    }

    function handleBgImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    const chartDom = document.getElementById('backgroundmap3');
                    
                    if (chartDom) {
                        chartDom.style.aspectRatio = `${aspectRatio}`;
                        chartDom.style.backgroundImage = `url(${e.target.result})`;
                        chartDom.style.backgroundSize = 'contain';
                        chartDom.style.backgroundPosition = 'center';
                        chartDom.style.backgroundRepeat = 'no-repeat';
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    onMounted(() => {
        initWordCloud()
        updateMapImageBackground()
    })

    watch(() => wordsStore.WordsAndWeights, () => {
        initWordCloud()
    }, { deep: true })

    watch(() => mapStore.mapImage, () => {
        console.log('地图图像数据变化3')
        initWordCloud()
        updateMapImageBackground()
    })

    function updateMapImageBackground() {
        console.log('更新背景图片3')
        // const chartDom = document.getElementById('backgroundmap3');
        // if (chartDom) {
        //   // chartDom.style.backgroundImage = `url(wuhanDissolve.png)`;
        //   chartDom.style.backgroundSize = 'contain';
        //   chartDom.style.backgroundPosition = 'center';
        //   chartDom.style.backgroundRepeat = 'no-repeat';
        // }
    }
</script>

<style lang="scss" scoped>
.wordcloud-container {
  width: 500px;
  height: 500px;
  position: absolute;
  top: 101%;
  left: 1%;
  // transform: translate(-50%, -50%);
  border: 0;
  background-color: transparent;
  border-radius: 20px;
  z-index: 10;
  border: 1px solid #4d6f94;
  //overflow: hidden;
}

.wordcloud {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  max-height: 100%;
}

.map-image-background {
  position: relative;
  // width: 100%;
  // height: 100%;
  // border: 1px solid red;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  z-index: 9999;
  max-width: 100%;
  max-height: 100%;
}

.mask-uploader {
  margin-top: 10px;
  text-align: center;
}

.upload-btn {
  width: 200px;
  padding: 8px 8px;
  position: absolute;
  bottom: -100px;
  left: 50%;
  transform: translateX(-50%);
  //background-color: #4d6f94;
  background-color: transparent;
  color: black;
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

.upload-btn.bg-btn {
  width: 100px;
  bottom: -140px;
}
</style>