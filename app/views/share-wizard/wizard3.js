'use strict';
const store = require('../../store');

module.exports = {
  data: function() {
    return store;
  },
  template: `
<section>
  <div class="container">
    <div class="row wizard-nav">
      <div class="col-6">
        <router-link :to="{path: '/share-wizard/wizard2'}"><small>&lt; Go Back</small></router-link>
      </div>
      <div class="col-6 text-right">
        <small>Step 3 of 3</small>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <img src="imgs/logo.svg" alt="Storj Share" class="logo">
      </div>
    </div>
    <div class="row text-center">
      <div class="col">
        <h2>Step 3 - Storage Sharing</h2>
        <p>Storj Share uses only the storage space you share. <br class="hidden-sm-down">The more storage you share, the more you can earn.</p>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col col-md-10 col-lg-8 col-xl-6">
        <div class="range-slider storage-slider">
          <input v-model="_sharePercent" class="range-slider__range" type="range" value="50" min="0" max="100">
          <div class="row">
            <div class="col-6">
              <p class="range-slider__info">Available: <span class="range-slider__value range-slider__value-free">100 GB</span></p>
            </div>
            <div class="col-6 text-right">
              <p class="range-slider__info">Sharing: <span class="range-slider__value range-slider__value-used">50</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row text-center justify-content-center mt-2">
      <div class="col col-md-10 col-lg-8 col-xl-6">
        <router-link :to="{path: '/share-wizard/wizard4'}" class="btn">Next</router-link>
      </div>
    </div>

  </div>
</section>

<script src="node_modules/jquery/dist/jquery.min.js" type="text/javascript"></script>

<script>

// Range Slider

var rangeSlider = function(){
  var slider = $('.range-slider'),
      range = $('.range-slider__range'),
      value = $('.range-slider__value-used');

  slider.each(function(){

    value.each(function(){
      var value = $('.range-slider__range').attr('value');
      $(this).html(value + '%');
    });

    range.on('input', function(){
      $('.range-slider__value-used').html(this.value + '%');
      $( this ).css( 'background', 'linear-gradient(90deg, #7ED321 ' + this.value + '%, #fff ' + this.value + '%)' );
    });

  });
};

rangeSlider();

</script>
  `
};
