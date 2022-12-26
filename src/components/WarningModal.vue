<template>
<div :class="{'active': isActive}" class="warning" style="position: fixed; top: 12px; right: 12px; border: 1px solid rgb(51, 51, 51); background: rgb(68, 68, 68); color: rgb(255, 255, 255); padding: 16px; width: 400px; z-index: 4;">
  {{text}}
</div>
</template>

<script>

export default {
  name: 'WarningModal',
  data: () => ({
  }),
  props: {
    text: String,
    isActive: Boolean,
  },
  mounted() {
  },
  methods: {
    saveModal() {
      this.$emit('savemodal')
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
}
</script>
<style scoped>  
  .warning {
    transition: .3s all ease-in-out;
    opacity: 0;
  }
  .active {
    opacity: 1;
  }
</style>
