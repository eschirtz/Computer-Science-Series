<template lang="html">
  <div class="container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import app from './js/main';

export default {
  data() {
    return {
      backgroundHillColor: '#C05010',
      hillColor: '#391A07',
      backgroundColor: '#D66E2D',
      ballColor: '#E8F980',
    };
  },
  methods: {
    setCanvasSize() {
      app.setCanvasSize(this.$refs.canvas);
      app.render(this.$refs.canvas, {
        backgroundColor: this.backgroundColor,
        backgroundHillColor: this.backgroundHillColor,
        hillColor: this.hillColor,
        ballColor: this.ballColor,
      });
    },
    initialize() {
      app.initialize(this.$refs.canvas, {
        backgroundColor: this.backgroundColor,
        backgroundHillColor: this.backgroundHillColor,
        hillColor: this.hillColor,
        ballColor: this.ballColor,
      });
    },
    run() {
      app.run({
        initialTemp: 100000,
        coolingRate: 0.99,
        algorithm: 'annealing',
        keyframe: 1,
        stepSize: 50,
      });
    },
    handleKeydown(e) {
      const key = e.key;
      switch (key) {
        case 'Escape':
          this.$router.push('/');
          break;
        case 'Enter':
          this.run();
          break;
        default:
      }
    },
  },
  mounted() {
    this.initialize();
    window.addEventListener('resize', this.setCanvasSize);
    window.onkeydown = this.handleKeydown;
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
  }
</style>
