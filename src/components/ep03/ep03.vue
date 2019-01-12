<template lang="html">
  <div class="container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import canvasTools from '@/custom-modules/canvas-tools';
import app from './js/main';

export default {
  data() {
    return {
      points: 400,
      clusters: 4,
    };
  },
  methods: {
    init() {
      canvasTools.setCanvasSize(this.$refs.canvas);
      app.initialize(this.points, this.clusters, this.$refs.canvas);
      this.setCanvasSize();
    },
    setCanvasSize() {
      canvasTools.setCanvasSize(this.$refs.canvas);
      app.render(this.$refs.canvas);
    },
    handleKeydown(e) {
      const key = e.key;
      switch (key) {
        case 'Escape':
          this.$router.push('/');
          break;
        case 'Enter':
          app.step();
          app.render(this.$refs.canvas);
          break;
        default:
      }
    },
  },
  mounted() {
    this.init();
    window.onkeydown = this.handleKeydown;
    window.addEventListener('resize', this.setCanvasSize);
  },
};
</script>

<style lang="css" scoped>
  canvas {
    position: fixed;
    top: 0px;
    left: 0px;
    display: block;
    margin: 0;
    padding: 0;
    z-index: -1;
  }
</style>
