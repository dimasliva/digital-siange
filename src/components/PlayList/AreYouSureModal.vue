<template>
  <div class="modal_window">
    <div class="modal_container">
      <div class="ds-minidialog" @click.stop>
			  <div class="dialog-header">
			  	Предупреждение
            <button @click="closeModal" title="Удалить"><img src="@/assets/imgs/playlist/delete.svg"/></button>
			  </div>
			  <div class="dialog-body dialog-message dialog-warning">
			  	  {{warningtext}}
            <br>Вы уверены, что хотите это сделать?
			  </div>
        <div class="dialog-footer">
			  	<button @click="saveModal" class="btn btn-primary">Продолжить</button>
			  	<button @click="closeModal" class="btn">Отмена</button>
			  </div>
		  </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'CreateTask',
  data: () => ({

  }),
  props: {
    slide: Object,
    warningtext: String,
    routename: String,
  },
  mounted() {
  },
  methods: {
    saveModal() {
      if(this.slide) {
        this.$emit('savemodal', this.slide, true)
        return
      }
      if(this.routename) {
        this.$emit('savemodal', this.routename)
        return
      }
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
}
</script>
<style scoped>
  .modal_container {
    z-index: 4;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: hidden;
  }
.ds-minidialog {
  max-width: 480px;
  width: 100%;
  max-height: 90%;
  overflow: hidden;
  background: #EFEFEF;
  border: 1px solid #080808;
  box-sizing: border-box;
  box-shadow: 0 0 8px rgb(0 0 0 / 30%);
  z-index: 101;
  display: flex;
  flex-direction: column;
}
.dialog-header {
  background: #555;
  color: #FFF;
  margin: 0;
  padding: 10px;
  font-size: 1.3em;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
}
.dialog-header button {
  background-color: transparent;
  border: none;
  cursor: pointer;
}
.dialog-header button img {
  filter: invert(1);
}
  .dialog-warning {
    background-image: url('@/assets/imgs/playlist/warning-modal.svg');
    background-repeat: no-repeat;
    background-position: left 18px center;
    background-size: 64px;
    padding-left: 100px !important;
    min-height: 80px;
  }
  .dialog-body.dialog-message {
    padding: 15px;
    font-size: 16px;
    background-color: #FFF;
    color: #080808;
}
.dialog-footer {
    margin: 0 5px;
    padding: 10px;
    text-align: right;
    border-top: 1px solid #CCC;
}
.btn-primary {
    background: #6c8;
}
</style>
