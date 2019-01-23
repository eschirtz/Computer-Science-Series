<template lang="html">
  <div>
    <router-link to="/">
      <circle-button class="home-button">
        arrow_back
      </circle-button>
    </router-link>
    <div class="container">
      <canvas ref="canvas" class="full-screen-canvas"></canvas>
      <div class="controller">
        <circle-button color='accent' v-on:click.native="wrapper('step')">skip_next</circle-button>
        <circle-button v-on:click.native="wrapper('restart')">replay</circle-button>
        <circle-button v-on:click.native="wrapper('reset')">settings</circle-button>
      </div>
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
