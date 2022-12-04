<template>
<div style="position: fixed; top: 12px; right: 12px; border: 1px solid rgb(51, 51, 51); background: rgb(68, 68, 68); color: rgb(255, 255, 255); padding: 16px; width: 400px; z-index: 2; transition: opacity 0.5s ease 0s; opacity: 1;">
  {{text}}
</div>
</template>

<script>

export default {
  name: 'WarningModal',
  data: () => ({
  }),
  props: {
    text: String
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
</style>
