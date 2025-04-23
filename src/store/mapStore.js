// stores/mapStore.js
import { defineStore } from 'pinia';
import * as L from 'leaflet';

export const useMapStore = defineStore('map', {
  state: () => ({
    map: null,
    geoJsonLayers: [], // 存储所有的 GeoJSON 图层
    drawnItems: [], // 存储用户绘制的多边形
    isDrawing: false, // 是否处于绘制模式
    currentPolygon: null, // 当前正在绘制的多边形
    polygonPoints: [], // 当前多边形的顶点
    geoJsonData: null, // 存储当前的GeoJSON数据
    mapImage: null // 存储地图图像数据
  }),
  actions: {
    // 初始化地图
    initializeMap(container) {
      this.map = L.map(container).setView([34, 113], 4);
      L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        subdomains: ['1', '2', '3', '4'],
        minZoom: 1, // 最小放缩级别
        maxZoom: 19, // 最大放缩级别
        attribution: '&copy; 高德地图',
      }).addTo(this.map);
    },

    // 添加新的 GeoJSON 数据到地图
    addGeoJsonToMap(geoJsonData) {
      this.geoJsonData = geoJsonData; // 存储GeoJSON数据
      const geoJsonLayer = L.geoJSON(geoJsonData).addTo(this.map);
      this.geoJsonLayers.push(geoJsonLayer); // 将新图层存储到数组中

      // 调整地图视图以显示所有图层
      if (this.geoJsonLayers.length > 0) {
        const bounds = L.latLngBounds(
          this.geoJsonLayers.flatMap(layer => layer.getBounds())
        );
        this.map.fitBounds(bounds);
      }
    },

    // 清空所有 GeoJSON 图层和绘制的多边形
    clearLayers() {
      this.geoJsonLayers.forEach(layer => {
        this.map.removeLayer(layer); // 从地图中移除图层
      });
      this.geoJsonLayers = []; // 清空图层数组

      this.drawnItems.forEach(layer => {
        this.map.removeLayer(layer); // 从地图中移除绘制的多边形
      });
      this.drawnItems = []; // 清空绘制的多边形数组
    },

    // 开始或结束绘制多边形
    toggleDrawing() {
      this.isDrawing = !this.isDrawing;
      if (this.isDrawing) {
        this.startDrawing();
      } else {
        this.stopDrawing();
      }
    },

    // 开始绘制多边形
    startDrawing() {
      this.polygonPoints = []; // 重置顶点数组
      this.currentPolygon = L.polygon(this.polygonPoints, { color: 'red' }).addTo(this.map); // 创建新的多边形

      // 添加事件监听器
      this.map.on('click', this.onClick);
      this.map.on('mousemove', this.onMove);
      this.map.on('dblclick', this.onDoubleClick);
    },

    // 停止绘制多边形
    stopDrawing() {
      // 移除事件监听器
      this.map.off('click', this.onClick);
      this.map.off('mousemove', this.onMove);
      this.map.off('dblclick', this.onDoubleClick);

      if (this.currentPolygon) {
        this.drawnItems.push(this.currentPolygon); // 将绘制的多边形存储到数组中
        this.currentPolygon = null; // 重置当前多边形
      }
    },

    // 处理点击事件
    onClick(e) {
      this.polygonPoints.push([e.latlng.lat, e.latlng.lng]); // 添加顶点
      this.currentPolygon.setLatLngs(this.polygonPoints); // 更新多边形
    },

    // 处理鼠标移动事件
    onMove(e) {
      const tempPoints = [...this.polygonPoints, [e.latlng.lat, e.latlng.lng]]; // 临时添加鼠标坐标
      this.currentPolygon.setLatLngs(tempPoints); // 动态更新多边形
    },

    // 处理双击事件
    onDoubleClick() {
      this.toggleDrawing(); // 结束绘制模式
      console.log('多边形绘制完成:', this.currentPolygon.getLatLngs()); // 输出多边形的顶点
    },

    // 存储地图图像数据
    setMapImage(imageData) {
      this.mapImage = imageData;
    },

    // 获取地图图像数据
    getMapImage() {
      return this.mapImage;
    },
  },
});