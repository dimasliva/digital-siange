<template>
  <div class="modal_window" @click="closeModal">
    <div class="modal_container">
      <div class="modal" @click.stop>
        <div class="head">
          <span>{{title}}</span>
          <button @click="closeModal" title="Удалить"><img src="@/assets/imgs/playlist/delete.svg"/></button>
        </div>
        <div class="content">
          <div class="img_container" style="text-align: center; background-color: #000;">
		      	<img v-if="format === 'pdf'" id="previewImage" style="max-width: 100%" src="@/assets/imgs/stuff/preview-unavail-16x9.png" class="">
		      	<video v-else-if="item.id.split('.')[item.id.split('.').length - 1] === 'mp4'" id="previewVideo" style="max-width: 100%" controls="" class="is-hidden" :src="`/media/${name}`"></video>
		      	<img v-else id="previewImage" style="max-width: 100%" :src="`/media/${name}`" class="">
		      </div>
        </div>
        <div class="footer">
          <button @click.stop="downloadFile" download class="btn">Сохранить на компьютер</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'OpenImage',
  data: () => ({
    name: "",
    format: "",
  }),
  props: {
    title: String,
    item: String,
  },
  mounted() {
    this.format = this.item.id.split('.')[this.last_i]
    console.log('format', this.format)
    this.name = this.item.id
  },
  methods: {
    async downloadFile() {
      const image = await fetch(this.item.id.split('.')[this.last_i] === 'mp4' ? '/media/' + this.name : '/thumb/' + this.name + '.jpg')
      const imageBlog = await image.blob();
      const imageUrl = URL.createObjectURL(imageBlog)

      const anchor = document.createElement("a")
      console.log(imageUrl)
      anchor.href = imageUrl
      anchor.download = this.name

      document.body.append(anchor)
      anchor.click()
      document.body.removeChild(anchor)
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
  computed: {
    last_i() {
      return this.item.id.split('.').length - 1
    }
  }
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
  .img_container {
    width: 100%;
    height: 530px;
  } 
  .img_container img, .img_container video {
    height: 100%;
  }
  .modal .head {
    background: #555;
    color: #FFF;
    margin: 0;
    padding: 10px;
    font-size: 1.3em;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  }
  .head button {
    background-color: transparent;
    border: none;
    cursor: pointer;
  }
  .head button img {
    filter: invert(1) sepia(1) saturate(5) hue-rotate(175deg);
  }
  .modal .footer {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 6px 0px;
    text-align: right;
    border-top: 1px solid #CCC;
    background-color: #efefef;
  }
  .modal .content {
    max-width: 960px;
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
  .footer .btn:hover {
    background: #737373;
  }
  .btn:first-child {
    margin-right: 5px;
  }
  .footer .btn {
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


</style>
