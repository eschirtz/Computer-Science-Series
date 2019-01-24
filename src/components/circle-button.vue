<template lang="html">
  <div class="circle-outline" ref='outline'>
    <i class="material-icons" ref='icon'>
      <slot></slot>
    </i>
  </div>
</template>

<script>
export default {
  props: ['color'],
  mounted () {
    // TODO: Change color based on props
  }
}
</script>

<style lang="css" scoped>
  .circle-outline{
    display: inline-block;
    color: rgba(255,255,255,0.5);
    background-color: rgba(255,255,255,0.0);
    cursor: pointer;
    padding: 0;
    margin: .5em;
    border-radius: 100%;
    width: 48px;
    height: 48px;
    text-align: center;
    -webkit-transition: color .25s, background-color .5s; /* Safari */
    transition: color .25s, background-color .5s;
    /* Remove text highlighting */
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently
                          supported by Chrome and Opera */
  }
  .circle-outline:hover, .circle-outline:focus{
    color: rgba(255,255,255,1.0);
    background-color: rgba(255,255,255,0.25);
  }
  .material-icons{
    margin: 0 auto;
    font-size: 32px;
    line-height: 48px;
  }

</style>
