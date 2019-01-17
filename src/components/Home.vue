<template lang="html">
  <div class="container">
    <section class="header">
      <lottie :options="animationOptions" style="margin-top: 4em" :height="250" />
    </section>
    <div class="row">
      <hr>
    </div>
    <div class="list-item" v-for="episode in episodes" :key="episode.num" >
      <div class="row">
        <div class="two columns" style="color: #5C626B;">
          {{episode.num}}
        </div>
        <div class="ten columns">
          <router-link :to="episode.demolink">
            <h5 style="margin-bottom: 0;">{{episode.name}}</h5>
            <p>{{episode.description}}</p>
          </router-link>
        </div>
      </div>
      <hr>
    </div>
    <footer style="margin-bottom: 2em; text-align: center">
      <small>
        &copy; 2018
        Eric Schirtzinger
        <br>
        <a href="https://www.eschirtz.com">www.eschirtz.com</a>
      </small>
    </footer>
  </div>
</template>

<script>
import Lottie from 'vue-lottie';
import loaderAnimation from '@/assets/animations/title.json';

export default {
  data() {
    return {
      episodes: [
        { num: 'ep. 1 )',
          name: 'Simulated Annealing',
          video: 'https://www.youtube.com/watch?v=S9vs05eAGN0',
          demolink: '/demos/ep01',
          writeuplink: '/writeups/ep01',
          description: 'We examine an optimization algorithm known as Simulated Annealing. This algorithm draws inspiration from the physical process of annealing. Annealing is when a metal is heated and then cooled slowly in order to reach it\'s most stable state.',
        },
        { num: 'ep. 2 )',
          name: 'Easing Function Hack',
          video: 'youtube.com',
          demolink: '/ep01',
          writeuplink: '/ep01',
          description: 'In order to make objects in games behave more naturally, game designers often give them "inertia". This simple trick makes this very easy.',
        },
        { num: 'ep. 3 )',
          name: 'K-means Clustering',
          video: 'youtube.com',
          demolink: '/demos/ep03',
          writeuplink: '/writeups/ep03',
          description: 'An unsupervised learning algorithm',
        },
      ],
      animationOptions: { animationData: loaderAnimation },
    };
  },
  components: {
    lottie: Lottie,
  },
};
</script>

<style lang="css" scoped>
  a{
    text-decoration: none;
    color: #A7ACB6;
    transition: color 0.2s;
  }
  a:hover{
    color: #0FA0CE;
  }
</style>

<!-- <a target="_blank" href="https://github.com/eschirtz">GitHub</a> -->
<!-- <a target="_blank" href="https://www.youtube.com/playlist?list=PLT40GkRdNrGz3ls-78iJkdoV7Vjh6xG05">Videos</a> -->
