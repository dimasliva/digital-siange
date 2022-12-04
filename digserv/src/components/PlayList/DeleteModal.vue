<template>
<div @click="closeModal" id="scheduleDelete" class="ds-dialog-fog">
	<div class="ds-minidialog" @click.stop>
		<div class="dialog-header">{{title}}</div>
		<div class="dialog-body dialog-message dialog-delete">{{text}}  <span id="deletingSchedule">{{item.name}}</span></div>
		<div class="dialog-footer">
    	<button class="btn" @click="saveModal">Удалить</button>
	   	<button class="btn" @click="closeModal">Закрыть</button>
    </div>
	</div>
	</div>
</template>

<script>

export default {
  name: 'DeleteModal',
  data: () => ({
  }),
  props: {
    title: String,
    text: String,
    item: Object,
  },
  mounted() {
  },
  methods: {
    saveModal() {
      this.$emit('savemodal', this.item)
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
}
</script>
<style scoped>  
.ds-dialog-fog {
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
.ds-minidialog {
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
.dialog-header {
    background: #555;
    color: #FFF;
    margin: 0;
    padding: 10px;
    font-size: 1.3em;
    font-weight: bold;
}
.ds-minidialog > .dialog-body {
    overflow: auto;
}
.dialog-body.dialog-message {
    padding: 15px;
    font-size: 110%;
    background-color: #FFF;
}
.dialog-delete {
    background-image: url(@/assets/imgs/playlist/delete-modal.svg);
    background-repeat: no-repeat;
    background-position: left 18px center;
    background-size: 64px;
    padding-left: 100px !important;
    min-height: 80px;
}
.dialog-footer {
    margin: 0 5px;
    padding: 10px;
    text-align: right;
    border-top: 1px solid #CCC;
}
.btn:first-child {
  margin-right: 5px;
}
.btn {
    font: 400 10pt "Golos Text", "Open Sans", "Segoe UI", "Liberation Sans", sans-serif;
    background: #888;
    color: #fff;
    border: 0;
    border-radius: 3px;
    padding: 5px 10px;
    vertical-align: bottom;
    min-width: 120px;
    cursor: pointer;
    display: inline-block;
    text-decoration: none;
  transition: .3s all ease-in-out;
}
  .dialog-footer .btn:hover {
    background: #737373;
  }
</style>
