<template>
  <div class="hint">
    <div class="tooltip-spacing">
      <div class="tooltip-bg1"></div>
      <div class="tooltip-bg2"></div>
      <div @click="openHint" class="tooltip-text">?</div>
    </div>
  </div>
</template>
<script>

export default {
  name: 'Hint',
  methods: {
    openHint() {
      this.$emit('openhint')
    }
  },
}
</script>
<style>
:root {
  --hint-size: 40px;
  --hint-white-size: 32px;
}
@media (max-width: 414px) {
  .hint {
    top: 1%;
    left: 75%;
    z-index: 1;
    position: fixed;
    height: 10px;
  }    
}
.hint {
  position: absolute;
  bottom: 0%;
  right: 0%;
  z-index: 3;
}
.tooltip-spacing {
    height: 50px;
    margin: 8px;
    position: relative;
    width: 50px;
}
.tooltip-bg1 {
    background-color: #000;
    border-radius: 55%;
    content: " ";
    display: flex;
    height: var(--hint-size);
    position: absolute;
    top: 0;
    width: var(--hint-size);
}
.tooltip-bg2 {
    background-color: #fff;
    border-radius: 55%;
    content: " ";
    display: flex;
    height: var(--hint-white-size);
    left: 4px;
    position: absolute;
    top: 4px;
    width: var(--hint-white-size);
}
.tooltip-text {
  font-size: 18px;
  font-weight: bold;
  line-height: var(--hint-size);
  position: relative;
  text-align: center;
  width: var(--hint-size);
  cursor: pointer;
}
</style>
