<template lang="html">
  <div class="container">
    <router-link to="/">
    <lottie :options="animationOptions" style="margin-top: 4em" :height="250" />
    </router-link>
    <div ref="markdown">
    </div>
  </div>
</template>

<script>
import Showdown from 'showdown'
import Lottie from 'vue-lottie'
import loaderAnimation from '@/assets/animations/title.json'
/* eslint-disable */
import ep01 from 'raw-loader!@/views/ep01/writeup.md';
import epNotFound from 'raw-loader!@/views/writeup-viewer/not-found.md';
/* eslint-enable */

export default {
  data () {
    return {
      animationOptions: { animationData: loaderAnimation }
    }
  },
  methods: {
    updateWriteup () {
      // TODO: This is kinda janky, change if we end up doing lot's of writeups
      const episode = this.$route.params.episode
      let writeup
      switch (episode) {
        case 'ep01':
          writeup = ep01
          break
        default:
          writeup = epNotFound
      }
      const converter = new Showdown.Converter()
      const html = converter.makeHtml(writeup)
      this.$refs.markdown.innerHTML = html
    }
  },
  watch: {
    $route () {
      this.updateWriteup()
    }
  },
  mounted () {
    this.updateWriteup()
  },
  components: {
    lottie: Lottie
  }
}
</script>

<style lang="css" scoped>
</style>
