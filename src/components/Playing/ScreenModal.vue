<template>
  <div @click="closeModal" class="modal_container">
    <div  @click.stop class="modal">
      <div class="head">
        <span>{{title}}</span>
        <img @click="closeModal" src="@/assets/imgs/playlist/delete.svg"/>
      </div>
      <div class="content">
        <div class="img_container" style="text-align: center; background-color: #000;">
	      	<img v-if="image === true" src="@/assets/imgs/solid-black.jpg" style="max-width: 100%"/>
	      	<img v-else id="previewImage" style="max-width: 100%" @error="changeSrc()"
          :src="`/thumb/${item.id}.png?${this.item.id}.png?rnd=${rnd}`" class="">
	      </div>
      </div>
      <div class="footer">
        <button @click="closeModal" class="btn">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ScreenModal',
  data: () => ({
    name: "",
    image: false,
    rnd: "",
  }),
  props: {
    title: String,
    item: String,
  },
  mounted() {
    this.name = this.item.id
    this.image = false
    this.rnd = Math.ceil(Math.random()*100000)
    setInterval(() => {
      this.rnd = Math.ceil(Math.random()*100000)
    }, 4000)
  },
  unmounted() {
    clearInterval(() => {
      this.rnd = ""
    })
  },
  methods: {
    changeSrc() {
      this.image = true
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
  computed: {
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
    overflow-y: hidden;
  }
  .modal {
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
  .img_container {
    width: 100%;
    height: 268px;
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
  .head img {
    filter: invert(1);
    cursor: pointer;
  }
  .modal .footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    padding: 6px 10px;
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
    z-index: 3;
    padding: 0px;
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
