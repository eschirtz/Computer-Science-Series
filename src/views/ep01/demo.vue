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
          <circle-button v-on:click.native="run">play_arrow</circle-button>
          <circle-button v-on:click.native="restart">replay</circle-button>
          <circle-button v-on:click.native="toggleModal(true)">settings</circle-button>
        </div>
        <transition name="fade">
          <modal v-if="modal">
            <div class="row">
              <div class="six columns">
                <label for="initialTemp">Initial Temp.</label>
                <input name="initialTemp" type="number" v-model="initialTemp">
              </div>
              <div class="six columns">
                <label for="coolingRate">Cooling Rate</label>
                <input name="coolingRate" type="number" v-model="coolingRate">
              </div>
            </div>
            <label for="speed">Simulation Speed</label>
            <input name="speed" type="number" v-model="speed">
            <hr>
            <button v-on:click="toggleModal(false)" style="width: 100%;">Done</button>
          </modal>
        </transition>
      </div>
  </div>
</template>

<script>
import app from './js/main'

export default {
  data () {
    return {
      // Colors
      backgroundHillColor: '#C05010',
      hillColor: '#391A07',
      backgroundColor: '#D66E2D',
      ballColor: '#E8F980',
      // UI
      modal: true,
      // Initial values
      initialTemp: 10,
      coolingRate: 0.95,
      speed: 100
    }
  },
  computed: {
    keyFrame () {
      const RANGE = 100
      const MAX_KEYFRAME = 100
      const MIN_KEYFRAME = 1
      /* eslint-disable no-mixed-operators */
      let keyFrame = ((MAX_KEYFRAME - MIN_KEYFRAME) *
      (RANGE - parseInt(this.speed, 10)) / RANGE) + 1
      /* eslint-enable no-mixed-operators */
      keyFrame = Math.round(keyFrame)
      return keyFrame
    }
  },
  methods: {
    setCanvasSize () {
      app.setCanvasSize(this.$refs.canvas)
      app.render(this.$refs.canvas, {
        backgroundColor: this.backgroundColor,
        backgroundHillColor: this.backgroundHillColor,
        hillColor: this.hillColor,
        ballColor: this.ballColor
      })
    },
    initialize () {
      app.initialize(this.$refs.canvas, {
        backgroundColor: this.backgroundColor,
        backgroundHillColor: this.backgroundHillColor,
        hillColor: this.hillColor,
        ballColor: this.ballColor
      })
    },
    run () {
      app.run({
        initialTemp: this.initialTemp,
        coolingRate: this.coolingRate,
        algorithm: 'annealing',
        keyframe: this.keyFrame,
        stepSize: 50
      })
    },
    restart () {
      app.terminate()
      this.initialize()
    },
    toggleModal (force) {
      this.modal = force || !this.modal
    }
  },
  mounted () {
    this.initialize()
    window.addEventListener('resize', this.setCanvasSize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.setCanvasSize)
  }
}
</script>

<style scoped lang="css">
  .fade-enter-active, .fade-leave-active {
    transition: opacity .25s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
</style>
