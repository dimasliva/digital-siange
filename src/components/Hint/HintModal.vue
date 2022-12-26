<template>
  <div class="modal_window" @click="closeModal">
    <div class="modal_container">
      <div class="modal" @click.stop>
        <div class="head">
          <div class=""></div>
          <h1 class="title">
            {{currentPage === 0 ? 'Как пользоваться? &#129300;'
            : currentPage === 1 ? 'Вкладка Устройства? &#128525;'
            : currentPage === 2 ? 'Вкладка Материалы &#129488;'
            : 'Редактирование задач &#128526;'}}</h1>
          <img @click="closeModal" src="@/assets/imgs/playlist/delete.svg"/>
        </div>
        <div class="content">
          <div v-if="currentPage === 0" class="page page_one">
            <div class="desc">
              <span>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati id natus iste porro, quo facilis cupiditate saepe architecto fugiat non? Nemo alias neque animi ullam fugit praesentium quae repudiandae accusamus?
                Officiis ducimus, corporis omnis facilis vero in cupiditate atque. Laborum voluptatum molestias deleniti distinctio, velit neque inventore officia ut nisi? Nobis odit a adipisci asperiores qui quod ut, earum similique.
                Ipsa maiores velit dolores molestiae, repudiandae ad culpa laboriosam repellat laborum accusantium quae sapiente, voluptas modi, quos quidem eaque exercitationem vero corporis et non neque id labore officia eveniet! Neque!
              </span>
            <br/>
            <br/>
            <div class="hint_img">
              <img src="@/assets/imgs/hint/image_one.png"/>
            </div>
            <br/>
              <span>
                Impedit debitis, architecto soluta, cupiditate et voluptates beatae, magnam ipsam fugiat autem enim assumenda? Nemo, dolorem ducimus, velit, quos doloribus molestiae magnam a architecto aliquam nam porro nostrum vero esse!
                Architecto nesciunt commodi magnam dolorem. Nam sint atque tempore corrupti, sunt quibusdam, dolore doloribus, odio ut facere voluptatem doloremque odit quod vitae temporibus quo itaque explicabo asperiores debitis aspernatur in.
              </span>
            </div>
          </div>

          <div v-if="currentPage === 1" class="page page_two">
            <div class="desc">
              <span>
                В рамках спецификации современных стандартов, элементы политического процесса представляют собой не что иное, как квинтэссенцию победы маркетинга над разумом и должны быть в равной степени предоставлены сами себе. Имеется спорная точка зрения, гласящая примерно следующее: базовые сценарии поведения пользователей освещают чрезвычайно интересные особенности картины в целом, однако конкретные выводы, разумеется, ассоциативно распределены по отраслям. Однозначно, акционеры крупнейших компаний призваны к ответу.
              </span>
            <br/>
            <br/>
            <div class="hint_img">
              <img src="@/assets/imgs/hint/second_image.png"/>
            </div>
            <br/>
              <span>
                Банальные, но неопровержимые выводы, а также диаграммы связей в равной степени предоставлены сами себе. Кстати, интерактивные прототипы являются только методом политического участия и представлены в исключительно положительном свете. А ещё диаграммы связей представлены в исключительно положительном свете.
              </span>
            </div>
          </div>

          <div v-if="currentPage === 2" class="page page_third">
            <div class="desc">
              <span>
                Картельные сговоры не допускают ситуации, при которой акционеры крупнейших компаний, вне зависимости от их уровня, должны быть объявлены нарушающими общечеловеческие нормы этики и морали. С другой стороны, курс на социально-ориентированный национальный проект выявляет срочную потребность своевременного выполнения сверхзадачи. Кстати, представители современных социальных резервов лишь добавляют фракционных разногласий и описаны максимально подробно.
              </span>
            <br/>
            <br/>
            <div class="hint_img">
              <img src="@/assets/imgs/hint/third_image.png"/>
            </div>
            <br/>
              <span>
                Значимость этих проблем настолько очевидна, что экономическая повестка сегодняшнего дня, а также свежий взгляд на привычные вещи — безусловно открывает новые горизонты для поэтапного и последовательного развития общества. Есть над чем задуматься: явные признаки победы институционализации представляют собой не что иное, как квинтэссенцию победы маркетинга над разумом и должны быть указаны как претенденты на роль ключевых факторов. Разнообразный и богатый опыт говорит нам, что экономическая повестка сегодняшнего дня требует от нас анализа приоретизации разума над эмоциями.
              </span>
            </div>
          </div>

          <div v-if="currentPage === 3" class="page page_four">
            <div class="desc">
              <span>
                Безусловно, дальнейшее развитие различных форм деятельности в значительной степени обусловливает важность новых предложений. Но независимые государства являются только методом политического участия и подвергнуты целой серии независимых исследований. Прежде всего, дальнейшее развитие различных форм деятельности однозначно определяет каждого участника как способного принимать собственные решения касаемо поставленных обществом задач.
              </span>
            <br/>
            <br/>
            <div class="hint_img">
              <img src="@/assets/imgs/hint/four_img.png"/>
            </div>
            <br/>
              <span>
                Картельные сговоры не допускают ситуации, при которой интерактивные прототипы набирают популярность среди определенных слоев населения, а значит, должны быть объективно рассмотрены соответствующими инстанциями. Являясь всего лишь частью общей картины, предприниматели в сети интернет и по сей день остаются уделом либералов, которые жаждут быть подвергнуты целой серии независимых исследований. Как уже неоднократно упомянуто, сделанные на базе интернет-аналитики выводы могут быть разоблачены.
              </span>
            </div>
          </div>
          
        </div>
        <div class="footer">
          <button :class="{'hideBtn': currentPage > 0}" @click="currentPage = currentPage - 1" class="btn btn_page">
            Назад
          </button>
          <button :class="{'hideBtn': currentPage < 3}" @click="currentPage = currentPage + 1" class="btn btn_page">
            Далее
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'HintModal',
  data: () => ({
    openList: false,
    currentPage: 0,
    name: "",
    size_window: {
      width: 0,
      height: 0,
    }
  }),
  props: {
    title: String
  },
  unmounted() {
    document.removeEventListener('keyup', this.swipePage)
  },
  mounted() {
    this.size_window.width = screen.width
    this.size_window.height = screen.height
    document.addEventListener('keyup', this.swipePage)
  },
  methods: {
    swipePage(e) {
        console.log(e.key)
      if(e.key==='ArrowLeft' || e.key==='ArrowDown') {
        if(this.currentPage > 0) {
          this.currentPage = this.currentPage - 1 
        }
      } else if (e.key==='ArrowRight' || e.key==='ArrowUp') {
        if(this.currentPage < 3) {
          this.currentPage = this.currentPage + 1 
        }
      } else if (e.key==='Escape') {
        this.closeModal()
      }
    },
    closeModal() {
      this.$emit('closemodal')
    },
  },
}
</script>
<style scoped>
  @media (max-height: 624px) {
    .content .hint_img {
      height: 325px;
    }
    .page_four .hint_img, .page_third .desc .hint_img {
      height: 305px;
    }
  }
  @media (max-height: 762px) {
    .content .modal_container .modal {
      margin-bottom: 0%;
      justify-content: flex-start;
    }
  }
  @media (max-width: 414px) {
    .page_two .desc .hint_img {
      height: 110px;
    }
    .page_third .desc .hint_img {
      height: 240px;
    }
    .desc .hint_img {
      width: 100%;
      height: 250px;
    }
    .desc .hint_img img {
      width: 100%;
    }
    .modal_container .modal .footer {
      bottom: 0%;
    }
    .modal_container .modal .content {
      height: 100%;
    }
    .modal_window .modal_container .modal {
      height: auto;
      padding: 20px;
      overflow-x: hidden;
    }
    .modal_window .modal_container {
      display: flex;
      align-items: flex-start;
      width: 100%;
      height: 100%;
    }
  }
  .head img {
    cursor: pointer;
  }
  .footer .btn svg {
    position: absolute;
    top: 32%;  /* position the top  edge of the element at the middle of the parent */
    left: 46%; /* position the left edge of the element at the middle of the parent */

    transform: translate(-50%, -50%);
    transition: .3s ease-in-out all;
    transform: rotate(90deg);
  }
  .footer .btn {
    position: relative;
    border-radius: 4px;
    border: none;
    background-color: #32cc8e;
    padding: 10px 0px;
    text-decoration: none;
    transition: 0.3s;
    cursor: pointer;
  }
  .btn {
    opacity: 0;
    pointer-events: none;
  }
  .footer .btn:hover {
    background-color: #25c686;
  }
  .btn:first-child {
    background-color: #e14949;
  }
  .btn:first-child:hover {
    background-color: #f45353;
  }
  .modal_container {
    z-index: 4;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-y: auto;
  }
  .modal_container .modal {
    width: var(--width-hint);
    height: 90%;
    overflow-y: scroll;
    background: #fff;
    border: 1px solid #080808;
    box-sizing: border-box;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: 3;
    position: relative;
    display: flex;
    flex-direction: column;
    margin-bottom: 1%;
    padding: 30px 50px;
    padding-bottom: 50px;
    border-radius: 10px;
    justify-content: flex-start;
  } 
  .modal .footer {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px 5px 5px 0px;
    position: absolute;
    bottom: 0%;
    left: 0%;
  } 
  .modal .head {
    color: #FFF;
    margin: 0;
    margin-bottom: 20px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  }
  .hint_img {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 400px;
  }
  .hint_img img {
    margin: 0px auto;
    height: 100%;
  }
  .page_two .hint_img{
    height: 180px;
  }
  .page_third .hint_img {
    height: 440px;
  }
  .modal .content {
    width: 100%;
    overflow-x: hidden;
    max-height: 74vh;
    color: #080808;
    overflow-y: auto;
  }
  .head .title {
    color: #080808;
    margin-left: 5%;
    font-weight: bold;
    font-family: 'Times New Roman', Times, serif;
  }
  .content .page .desc span {
    font-size: 14px;
    opacity: .7;
    margin-top: 10px;
    margin-left: 20px;
    font-family: Arial, Helvetica, sans-serif;
  }
  .hideBtn {
    pointer-events: all;
    opacity: 1;
  }
</style>
