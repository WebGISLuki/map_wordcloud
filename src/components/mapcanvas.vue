<template>
    <div class="mapcanvas">
        
        <canvas ref="mapCanvas" ></canvas>
        <button class="save-button" @click="saveAsImage">保存为图片</button>
    </div>
</template>

<script setup>
    import { ref, onMounted, watch } from 'vue';
    import { useMapStore } from '@/store/mapStore';

    // 获取 canvas 元素的引用
    const mapCanvas = ref(null);
    const mapStore = useMapStore();

    // 初始化画布
    let ctx = null;

    onMounted(() => {
        initCanvas();
    });

    // 监听GeoJSON数据变化
    watch(() => mapStore.geoJsonData, (newData) => {
        if (newData) {
            const bounds = calculateBounds(newData);
            setupCanvasSize(mapCanvas.value, bounds);
            drawRegions(newData, bounds);
        }
    });

    // 初始化画布
    const initCanvas = async () => {
        const canvas = mapCanvas.value;
        if (!canvas) {
            console.error('Canvas 元素未找到');
            return;
        }
        ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('无法获取画布上下文');
            return;
    }

    // 如果已有GeoJSON数据，直接绘制
    const data = mapStore.geoJsonData;
    if (data) {
        const bounds = calculateBounds(data);
        setupCanvasSize(canvas, bounds);
        drawRegions(data, bounds);
    }
    };

    // 加载 JSON 数据
    const loadRegions = async () => {
    try {
        const response = await fetch('../src/store/wuhan.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('加载 JSON 数据失败:', error);
        return null;
    }
    };

    // 计算地理坐标的边界
    const calculateBounds = (data) => {
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

    data.features.forEach((feature) => {
        feature.geometry.coordinates.forEach((polygons) => {
            polygons.forEach((polygon) => {
                polygon.forEach((point) => {
                    //console.log("点",point)
                    const [x, y] = point;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                });
            })

        });
    });

    return { minX, minY, maxX, maxY };
    };

    // 根据地理范围设置画布大小
    const setupCanvasSize = (canvas, bounds) => {
    const padding = 20; // 画布边距
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    // 设置画布大小
    canvas.width = width * 1000 + padding * 2; // 缩放因子为 1000
    canvas.height = height * 1000 + padding * 2;
    };

    // 将地理坐标转换为画布坐标
    const project = (x, y, bounds, canvas) => {
        const padding = 20; // 画布边距
        const scale = 1000; // 缩放因子

        const canvasX = (x - bounds.minX) * scale + padding;
        const canvasY = canvas.height - ((y - bounds.minY) * scale + padding); // 反转 Y 轴

        return { x: canvasX, y: canvasY };
    };

    // 绘制行政区域
    const drawRegions = (data, bounds) => {
        console.log("范围",bounds)
        const canvas = mapCanvas.value;
        console.log("画布",canvas)

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //ctx.fillStyle = 'white'; // 设置填充颜色为白色
        //ctx.fillRect(0, 0, canvas.width, canvas.height); // 填充整个画布
        // 遍历每个区域
        data.features.forEach((feature) => {
            const coordinates = feature.geometry.coordinates;

            // 遍历每个多边形
            coordinates.forEach((polygons) => {
                polygons.forEach((polygon => {
                    // 开始绘制路径
                    ctx.beginPath();

                    // 遍历每个点
                    polygon.forEach((point, index) => {
                        const [x, y] = point;

                        // 将地理坐标转换为画布坐标
                        const { x: canvasX, y: canvasY } = project(x, y, bounds, canvas);

                        if (index === 0) {
                        ctx.moveTo(canvasX, canvasY);
                        } else {
                        ctx.lineTo(canvasX, canvasY);
                        }
                    });
                    // 闭合路径并填充
                    ctx.closePath();
                    //ctx.fillStyle = 'rgba(128, 128, 128)';
                    ctx.fillStyle = 'rgba(255,255,255)';
                    ctx.fill();
                    ctx.strokeStyle = '#404040';
                    ctx.lineWidth = 5;
                    ctx.stroke();
                }))
            });
        });
    };

    // 导出为图片
    const saveAsImage = () => {
        const canvas = mapCanvas.value;
        const image = canvas.toDataURL('image/png');
        // 保存图像数据到mapStore
        mapStore.setMapImage(image);
        // 创建下载链接
        const link = document.createElement('a');
        link.href = image;
        link.download = 'map.png';
        link.click();
    };
</script>

<style lang="scss" scoped>
    canvas {
        border: 1px solid #000;
        position:absolute;
        top:10px;
        width:92%;
        height:78%;
    }
    button {
        position: absolute;
        bottom: 8px;
        cursor: pointer;
    }
    .save-button{
        margin-left: 34%;
        margin-bottom:0.6%;
    }
</style>