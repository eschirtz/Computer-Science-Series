<template lang="html">
  <div class="container">
    <home-button></home-button>
    <canvas ref="canvas"></canvas>
    <div class="controller">
      <button type="button" v-on:click="wrapper('step')">Step</button>
      <button type="button" v-on:click="wrapper('restart')">Rese</button>
    </div>
  </div>
</template>

<script>
import canvasTools from '@/custom-modules/canvas-tools';
import app from './js/main';

export default {
  data() {
    return {
      points: 500,
      clusters: 5,
      numSteps: 10,
    };
  },
  methods: {
    init() {
      canvasTools.setCanvasSize(this.$refs.canvas);
      app.initialize(this.points, this.clusters, this.$refs.canvas, this.numSteps);
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
    // Quick wrapper
    wrapper(func) {
      switch (func) {
        case 'step':
          app.step();
          break;
        case 'restart':
          this.init();
          break;
        default:
          // eslint-disable-next-line
          console.warn('wrapper() called without proper argument');
      }
    },
  },
  mounted() {
    this.init();
    window.onkeydown = this.handleKeydown;
    window.addEventListener('resize', this.setCanvasSize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setCanvasSize);
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
  .controller {
    position: fixed;
    bottom: 10px;
    left: 10px
  }
</style>
