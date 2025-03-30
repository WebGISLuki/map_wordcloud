<template>
  <div class="wordcloud-container">
    <div class="wordcloud" id="charts-content2"></div>
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
    import { ref, onMounted, onUpdated, watch } from 'vue';

    function initWordCloud() {
        var wc = new Js2WordCloud(document.getElementById('charts-content2'))
        wc.setOption({
            //imageShape:'http://c.hiphotos.baidu.com/zhidao/pic/item/d52a2834349b033bc91c09cf16ce36d3d539bd0b.jpg',
            fontSizeFactor: 0.1,  // 当词云值相差太大，可设置此值进字体行大小微调，默认0.1
            maxFontSize: 70,      // 最大fontSize，用来控制weightFactor，默认60
            minFontSize: 10,      // 最大fontSize，用来控制weightFactor，默认60
            gridSize: 0,          // 密集程度 数字越小越密集
            weightFactor: 1,      // 字体大小=原始大小*weightFactor
            fontWeight: 600, //字体粗细
            fontFamily: 'sans-serif', // 字体
            color: 'random-dark', // 字体颜色 'random-dark' 或者 'random-light'
            backgroundColor: '#fff', // 背景颜色
            rotateRatio: 0, // 字体倾斜(旋转)概率，1代表总是倾斜(旋转)
            tooltip: {
                show: false,
                backgroundColor: 'rgba(0, 0, 0, 0.701961)',         // 默认：'rgba(0, 0, 0, 0.701961)'
                  formatter: function(item) {                         // 数据格式化函数，item为list的一项
                }
            },
            noDataLoadingOption: {                                  // 无数据提示。
            backgroundColor: '#888',
            text: '暂无数据',
        },
            list: [['口', 50], ['龚晓蕾', 40]],
        })

    }
    onMounted(() => {
        initWordCloud()
    })
</script>

<style lang="scss" scoped>
.wordcloud-container {
  width: 22%;
  height: 38.5%;
  border: 3px solid #4d6f94;
  position: absolute;
  top: 100%;
  left: 23.5%;
  background-color: #d7e9ef;
  border-radius: 20px;
  z-index: 10;
}

.mask-uploader {
  margin-top: 10;
  text-align: center;
}

.upload-btn {
  padding: 8px 8px;
  position: absolute;
  bottom: 5px;
  left: 10px;
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