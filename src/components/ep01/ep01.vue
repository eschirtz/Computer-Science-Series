<template lang="html">
  <div class="container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import app from './js/main';

export default {
  methods: {
    setCanvasSize() {
      app.setCanvasSize(this.$refs.canvas);
      app.render(this.$refs.canvas, {
        backgroundColor: 'lightblue',
      });
    },
  },
  mounted() {
    app.initialize(this.$refs.canvas, {
      backgroundColor: 'lightblue',
    });
    window.addEventListener('resize', this.setCanvasSize);
  },
  beforeDestroy() {
  },
};
</script>

<style scoped lang="css">
  canvas {
    position: fixed;
    top: 0px;
    left: 0px;
    display: block;
    margin: 0;
    padding: 0;
    background-color: lightblue;
  }
</style>
