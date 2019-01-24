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
  .modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
