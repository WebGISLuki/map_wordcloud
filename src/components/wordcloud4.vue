<template>
    <div class="wordcloud-container">
      <div class="wordcloud" id="backgroundmap4">
        <div class="map-image-background" id="charts-content4"></div>
      </div>
      <div class="mask-uploader">
        <input type="file" accept="image/*" ref="fileInput" @change="uploadMaskImage" style="display: none">
        <button class="upload-btn" @click="triggerFileInput">上传图片</button>
  
        <div class="font-size-sliders">
          <div class="slider-container">
            <span class="slider-label">最小值</span>
            <input type="range" min="1" max="50" v-model="minFontSize" @input="updateWordCloud" class="slider">
            <span class="slider-value">{{ minFontSize }}</span>
          </div>
          <div class="slider-container">
            <span class="slider-label">最大值</span>
            <input type="range" min="10" max="100" v-model="maxFontSize" @input="updateWordCloud" class="slider">
            <span class="slider-value">{{ maxFontSize }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import * as d3 from "d3";
  import cloud from "d3-cloud";
  import { ref, onMounted, watch } from "vue";
  import { usewordsStore } from "@/store/words";
  
  const wordsStore = usewordsStore();
  const minFontSize = ref(1);
  const maxFontSize = ref(5);
  const maskImage = ref(null);
  
  function generateWordCloud() {
    const wordsData = wordsStore.WordsAndWeights.map(item => ({ text: item.name, size: Math.floor(item.value * 100) }));
  
    const layout = cloud()
      .size([500, 500])
      .words(wordsData)
      .padding(0)
      .rotate(() => (Math.random() > 0.5 ? 0 : 0))
      .font("sans-serif")
      .fontSize(d => d3.scaleLinear().domain([1, 100]).range([minFontSize.value, maxFontSize.value])(d.size))
      .on("end", draw);
  
    layout.start();
  }
  
  function draw(words) {
    d3.select("#charts-content4").selectAll("svg").remove();
  
    const svg = d3
      .select("#charts-content4")
      .append("svg")
      .attr("width", 500)
      .attr("height", 500)
      .append("g")
      .attr("transform", "translate(250,250)");
  
    svg
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", d => d.size + "px")
      .style("fill", () => `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`)
      .attr("text-anchor", "middle")
      .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
      .text(d => d.text);
  }
  
  function updateWordCloud() {
    generateWordCloud();
  }
  
  function triggerFileInput() {
    document.querySelector("input[type=file]").click();
  }
  
  function uploadMaskImage(event) {
    const file = event.target.files[0];
    if (file) {
      maskImage = `url(wuhan.png)`;
      document.getElementById("backgroundmap4").style.backgroundImage = `url(wuhan.png)`;
    }
  }
  
  onMounted(() => {
    generateWordCloud();
  });
  
  watch(() => wordsStore.WordsAndWeights, generateWordCloud, { deep: true });
  </script>
  
  <style lang="scss" scoped>
  .wordcloud-container {
    width: 40%;
    height: 60%;
    border: 3px solid #4d6f94;
    position: absolute;
    top: 300%;
    left: 23.5%;
    background-color: #d7e9ef;
    border-radius: 20px;
    z-index: 10;
  }
  
  .map-image-background {
    position: absolute;
    top: -60px;
    left: 0%;
    width: 100%;
    height: 100%;
    //border: 3px solid #4d6f94;
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
  </style>
  