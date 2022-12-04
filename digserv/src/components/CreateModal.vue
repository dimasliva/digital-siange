<template>
  <div class="modal_window" @click="closeModal">
    <div class="modal_container">
      <div class="modal" @click.stop>
        <div class="head">
          <span>{{title}}</span>
        </div>
        <div class="content">
          <input v-model="name" />
        </div>
        <div class="footer">
          <button @click="saveModal" class="btn">Добавить</button>
          <button @click="closeModal" class="btn">Закрыть</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'CreateModal',
  data: () => ({
    openList: false,
    name: "",
  }),
  props: {
    title: String,
    item: Object,
  },
  mounted() {
    if(this.item) {
      this.name = this.item.name
    }
  },
  methods: {
    saveModal() {
      this.$emit('savemodal', this.name, this.item)
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
}
</script>
<style scoped>  
  .modal_container {
    z-index: 3;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: scroll;
  }
  .modal_container .modal {
    max-width: 480px;
    width: 100%;
    max-height: 90%;
    overflow: hidden;
    background: #EFEFEF;
    border: 1px solid #080808;
    box-sizing: border-box;
    box-shadow: 0 0 8px rgb(0 0 0 / 30%);
    z-index: 3;
    display: flex;
    flex-direction: column;
  }
  .modal .head {
    background: #555;
    color: #FFF;
    margin: 0;
    padding: 10px;
    font-size: 1.3em;
    font-weight: bold;
  }
  .modal .footer {
    width: 100%;
    padding: 10px;
    text-align: right;
    border-top: 1px solid #CCC;
    background-color: #efefef;
  }
  .modal .content {
    width: 100%;
    padding: 0px;
  }
  .modal .content input {
    margin: 0;
    border: 1px solid #CCC;
    padding: 10px;
    font-size: 1.2em;
    display: block;
    width: 100%;
    box-sizing: border-box;
    outline: none;
  }
</style>
