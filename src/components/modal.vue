<template lang="html">
    <div class="modal">
      <slot></slot>
    </div>
</template>

<script>
export default {
}
</script>

<style lang="css" scoped>
  label {
    font-weight: lighter;
    font-size: 1em;
    letter-spacing: 0.1em;
  }
  hr {
    margin-top: 0.25em;
  }
  .modal {
    /* Positioning & Scaling */
    position: absolute;
    left: 50%;
    transform: translate(-50%, 50%);
    /* Styling */
    background: #292E34;
    border-radius: .5em;
    padding: 1.5em 1em 1em 1em;
    box-shadow: 0px 5px 15px rgba(0,0,0,0.5);
  }
</style>
