<template>
  <div class="image-uploader">
    <input type="file" @change="handleImageUpload" accept="image/*" ref="fileInput" style="display: none">
    <button @click="triggerFileInput" class="upload-btn">上传图片</button>
    <div v-if="previewUrl" class="preview-container">
      <img :src="previewUrl" alt="预览图" class="preview-image">
      <canvas ref="maskCanvas" style="display: none"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const fileInput = ref(null);
const maskCanvas = ref(null);
const previewUrl = ref('');

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click();
};

// 处理图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
    generateMask(e.target.result);
  };
  reader.readAsDataURL(file);
};

// 生成图片蒙版
const generateMask = (imageUrl) => {
  const img = new Image();
  img.onload = () => {
    const canvas = maskCanvas.value;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = img.width;
    canvas.height = img.height;

    // 绘制图片
    ctx.drawImage(img, 0, 0);

    // 获取图片数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 转换为黑白图像
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const threshold = 128;
      const value = avg > threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = value;
      data[i + 3] = 255; // alpha 通道
    }

    // 将处理后的数据放回画布
    ctx.putImageData(imageData, 0, 0);

    // 获取 base64 格式的蒙版图片
    const maskImage = canvas.toDataURL();
    // 触发自定义事件，将蒙版图片传递给父组件
    emit('maskGenerated', maskImage);
  };
  img.src = imageUrl;
};

// 定义事件
const emit = defineEmits(['maskGenerated']);
</script>

<style scoped>
.image-uploader {

    padding: 20px;
    text-align: center;
    width: 25%;
    height:30%;
    border:3px solid #4d6f94;
    /* padding:5px 10px 30px 10px; */
    /* margin:1%; */
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 12px;
    position:absolute;
    top: 105%;
    left: 24%;
    background-color: #d7e9ef;
    border-radius: 20px;
    z-index:9999 ;
    line-height: 200px;
}

.upload-btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}

.preview-container {
  margin-top: 20px;
}

.preview-image {
  max-width: 300px;
  max-height: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>