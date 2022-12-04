<template>
	<div class="head">
    <div class="btns">
      <span>{{title}}</span>
	    <button @click="btnClicked" v-if="btn" :class="{'active': issave}" class="btn btn-primary">{{btn}}</button>
	    <button @click="btntwoClicked" v-if="btntwo" :class="{'active': issave}" class="btn btn-info">{{btntwo}}</button>
    </div>
	</div>
</template>

<script>
export default {
  name: 'Header',
  props: {
    title: String,
    btn: String,
    btntwo: String,
    issave: Boolean
  },
  methods: {
    btnClicked() {
      this.$emit("openlist")
    },
    btntwoClicked() {
      this.$emit("opensecond")
    }
  },
}
</script>
<style scoped>
  @media (max-width: 414px) {
    .main_content .head {
      padding-top: 0px;
    }
  }
	.head {
    color: #000;
    border-bottom: 1px solid #CCC;
    padding-top: 72px;
    background-color: #DDD;
    overflow: hidden;
	}
  .btns {
    padding: 8px 8px;
    background-color: #EEE;
    position: relative;
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
  }
  .btn-primary.active {
    background: #888;
  }
  .btn-primary, .btn-info.active {
    background-color: #6c8;
    transition: .3s ease-in-out all;
    margin-right: 5px;
  }
  .btn-primary:hover {
    background-color: rgb(85, 187, 119);
  }
  .btns span {
    display: inline-block;
    vertical-align: top;
    display: inline-block;
    margin: 4px 16px;
    font-size: 14px;
  }
</style>
