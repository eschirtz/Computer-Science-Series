<template lang="html">
  <div class="container">
    <home-button></home-button>
    <form class="controller">
      <label for="initialTemp">Initial Temp.</label>
      <input type="text" name="initialTemp" v-model="initialTemp" placeholder="Initial Temp">
      <label for="coolingRate">Cooling Rate</label>
      <input type="text" name="coolingRate" v-model="coolingRate" placeholder="Cooling Rate">
      <hr>
      <label for="speed">Simulation Speed</label>
      <input type="range" v-model.number="speed" min="0" max="100">
      <br>
      <button type="button" @click="run">Run</button>
      <button type="button" @click="restart">Restart</button>
    </form>
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
      initialTemp: 10,
      coolingRate: 0.99,
      speed: 50,
    };
  },
  computed: {
    keyFrame() {
      const RANGE = 100;
      const MAX_KEYFRAME = 100;
      const MIN_KEYFRAME = 1;
      /* eslint-disable no-mixed-operators */
      let keyFrame = ((MAX_KEYFRAME - MIN_KEYFRAME) *
      (RANGE - parseInt(this.speed, 10)) / RANGE) + 1;
      /* eslint-enable no-mixed-operators */
      keyFrame = Math.round(keyFrame);
      return keyFrame;
    },
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
        initialTemp: this.initialTemp,
        coolingRate: this.coolingRate,
        algorithm: 'annealing',
        keyframe: this.keyFrame,
        stepSize: 50,
      });
    },
    restart() {
      app.terminate();
      this.initialize();
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
    window.removeEventListener('resize', this.setCanvasSize);
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
    z-index: -1;
  }

  hr{
    border-color: #bbb;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
  .controller {
    position: fixed;
    bottom: 10px;
    left: 10px;
    z-index: 1;
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.75);
    border-radius: .5rem;
  }
</style>
