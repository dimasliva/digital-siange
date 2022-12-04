<template>
  <div class="modal_window">
    <div class="modal_container">
      <div class="modal">
        <div class="head">
          <span>Предупреждение</span>
        </div>
        <div class="content">
          <div class="dialog-body dialog-message dialog-warning">
				  Вы добавляете в список проигрывания папку, которая не содержит файлов подходящего типа.<br>Вы уверены, что хотите это сделать?
			    </div>
        </div>
        <div class="footer">
          <button @click="saveModal" class="btn btn-success">Продолжить</button>
          <button @click="closeModal" class="btn">Отмена</button>
        </div>
      </div>
    </div>
    <div class="modal_bg" @click="closeModal">

    </div>
  </div>
</template>

<script>

export default {
  name: 'CreateTask',
  data: () => ({

  }),
  props: {
    slide: Object
  },
  mounted() {
  },
  methods: {
    saveModal() {
      this.$emit('savemodal', this.slide, 'add', true)
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
}
</script>
<style scoped>  
  .modal_container {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -40%);
    width: 480px;
    background: #EFEFEF;
    border: 1px solid #080808;
    box-sizing: border-box;
    z-index: 4;
    color: white;
  }
  .modal .head {
    background: #555;
    color: #FFF;
    margin: 0;
    padding: 10px;
    font-size: 1.3em;
    font-weight: bold;
  }
  .icon .doc, .icon .web, .icon .stream, .icon .monitor {
    width: 45px;
    height: 45px;
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
    background-color: #fff;
    padding: 15px 20px 15px 0px;
    color: #080808;
  }
  .dialog-warning {
    background-image: url('@/assets/imgs/playlist/warning-modal.svg');
    background-repeat: no-repeat;
    background-position: left 18px center;
    background-size: 64px;
    padding-left: 100px !important;
    min-height: 80px;
  }
  .modal_bg{
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: black;
    opacity: .6;
    z-index: 3;
  }
  .footer .btn {
    font: 400 10pt "Open Sans", "Segoe UI", "Liberation Sans", sans-serif;
    background: #888;
    color: #fff;
    border: 0;
    border-radius: 3px;
    padding: 5px 15px;
    margin: 0px 2px;
    vertical-align: bottom;
    min-width: 120px;
    cursor: pointer;
    display: inline-block;
    text-decoration: none;
    transition: .3s all ease-in-out;
  }
  .footer .btn:hover {
    background-color: #7c7c7c;
  }
  .footer .btn-success:hover {
    background-color: #5abc7a;
  }
  .footer .btn-success {
    background: #6c8;
  }
</style>
