<template lang="html">
  <div class="container">
    <div class="row">
      <h1 class="title">CS <i>Visualized</i></h1>
      <p><i>By Eric Schirtzinger</i></p>
    </div>
    <div class="row">
      <a target="_blank" href="https://www.youtube.com/playlist?list=PLT40GkRdNrGz3ls-78iJkdoV7Vjh6xG05">
        <button class="button-primary">Videos</button>
      </a>
      <a target="_blank" href="https://github.com/eschirtz">
        <button class="button-secondary">GitHub</button>
      </a>
    </div>
    <div class="row">
      <hr>
    </div>
    <div class="list-item" v-for="episode in episodes" :key="episode.num" >

      <div class="row">
        <div class="two columns">
          {{episode.num}}
        </div>
        <div class="ten columns">
          <router-link :to="episode.link">
            <h5 style="margin-bottom: 0;">{{episode.name}}</h5>
            <p>{{episode.description}}</p>
          </router-link>
        </div>
      </div>
      <hr>

    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      episodes: [
        { num: 'ep. 1 )',
          name: 'Simulated Annealing',
          video: 'https://www.youtube.com/watch?v=S9vs05eAGN0',
          link: '/ep01',
          description: 'We examine an optimization algorithm known as Simulated Annealing. This algorithm draws inspiration from the physical process of annealing. Annealing is when a metal is heated and then cooled slowly in order to reach it\'s most stable state.',
        },
        { num: 'ep. 2 )',
          name: 'Easing Function Hack',
          video: 'youtube.com',
          link: '/ep01',
          description: 'In order to make objects in games behave more naturally, game designers often give them "inertia". This simple trick makes this very easy.',
        },
        { num: 'ep. 3 )',
          name: 'K-means Clustering',
          video: 'youtube.com',
          link: '/ep03',
          description: 'An unsupervised learning algorithm',
        },
      ],
    };
  },
};
</script>

<style lang="css" scoped>
  a{
    text-decoration: none;
    color: #222;
    transition: color 0.2s;
  }
  a:hover{
    color: #0FA0CE;
  }
  .container{
    margin-top: 160px;
  }
</style>
