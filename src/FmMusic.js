

var EventCenter = {
  on: function(type, handler){
    $(document).on(type, handler)
  },
  fire: function(type, data){
    $(document).trigger(type, data)
  }
}
var list = {
  init:function () {

    this.$songList = $('.song-List')
    this.$ul = this.$songList.find('ul')
    this.$list = this.$songList.find('.list')
    this.$left = this.$songList.find('.icon-fon10')
    this.$right = this.$songList.find('.icon-fon9')
    this.isToEnd = false
    this.isToStart = true
    this.isAnimate = false
    this.data()
    this.activity()
  },
  activity:function () {
    var _this = this
    this.$right.on('click',function () {
      if(_this.isAnimate) return
      var itemWidth = _this.$list.find('li').outerWidth(true)
      var rowCount = Math.floor(_this.$list.width() / itemWidth)
      if(!_this.isToEnd){
        _this.isAnimate = true
        _this.$ul.animate({
          left: '-=' + rowCount * itemWidth
        },400,function () {
          _this.isAnimate = false
          _this.isToStart = false
          if(parseFloat(_this.$list.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width')) ){
            _this.isToEnd = true
          }
        })
      }
    })

    this.$left.on('click',function () {
      if(_this.isAnimate) return
      var itemWidth = _this.$list.find('li').outerWidth(true)
      var rowCount = Math.floor(_this.$list.width() / itemWidth)
      if(!_this.isToStart){
        _this.isAnimate = true
        _this.$ul.animate({
          left: '+=' + rowCount * itemWidth
        },400,function () {
          _this.isAnimate = false
          _this.isToEnd = false
          if(parseFloat(_this.$ul.css('left')) >= 0){
            _this.isToStart = true
          }
        })
      }
    })

    this.$songList.on('click', 'li', function(){
      EventCenter.fire('select-albumn', {
        id: $(this).attr("data-id"),
        name:$(this).attr("data-name")
      })
    })

  },

  data:function () {
    var _this = this
    $.getJSON('//jirenguapi.applinzi.com/fm/getChannels.php')
        .done(function(ret){
          // console.log(ret)
          _this.renderFooter(ret.channels)
        }).fail(function(){
      console.log('error')
    })
  },
  renderFooter:function (channels) {
    // console.log(channels)
    var html = ''
    channels.forEach(function (t) {
      html += ' <li data-name = '+t.name +' + data-id = '+ t.channel_id + '>'
          + '<img src ="' + t.cover_small + '">'
          + '<p>'+ t.name +'</p>'
          + ' </li>'
    })
    this.$ul.html(html)
    this.setStyle()
  },
  setStyle: function(){
    var count = this.$songList.find('li').length
    var width = this.$songList.find('li').outerWidth(true)
    // console.log(count, width)
    this.$ul.css({
      width: count * width + 'px'
    })
  },
}


var Fm = {
  init:function () {
    this.audio = new Audio()
    this.audio.autoplay = true
    this.$box = $('.box')
    this.$h1 = $('.title—plate h1')
    this.$h5 = $('.title—plate h5')
    this.$p = $('.name p:nth-child(1)')
    this.$bg_max = $('.setting')
    this.$bg_min = $('.control .img')

    this.bind()
  },
  bind:function () {
    var _this = this
    EventCenter.on('select-albumn', function (e, data) {
      // console.log(data.id)
      _this.id = data.id
      _this.name = data.name
      _this.loadMusic()
    })
    this.audio.play(  _this.loadMusic())

    this.$box.find('.play').on('click',function () {
      var $btn = $(this)
      if($btn.hasClass('icon-fon2')){
        $btn.removeClass('icon-fon2').addClass('icon-fon3')
        _this.audio.play();
      }else {
        $btn.removeClass('icon-fon3').addClass('icon-fon2')
        _this.audio.pause();
      }
    })

    this.$box.find('.icon-fon1').on('click', function(){
      _this.loadMusic()
    })
    
    this.audio.addEventListener('play',function () {
      clearInterval(_this.statusClock)
      _this.statusClock = setInterval(function () {
        _this.planTime()
      },1000)
    })

    this.$box.find('.timeline').on('click',function (e) {
      var percent = e.offsetX / parseInt(getComputedStyle(this).width)
      // console.log(percent)
      _this.audio.currentTime = _this.audio.duration * percent
    })

    this.$box.find('.plan').on('click',function (o) {
      var percent = o.offsetX / parseInt(getComputedStyle(this).width)
      var b =  _this.audio.volume = 1 * percent
     _this.$box.find('.volume-reduce').css({
       width:  b * 100 + '%'
     })
    })

   this.audio.addEventListener('ended', function(){
     _this.loadMusic()
   })

  },
  loadMusic:function(){
    var _this = this
    $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{channel:this.id}).done(function (rt) {
      _this.song = rt['song'][0]
      _this.variation()
      _this.lyricsMusic()
    })
  },
  lyricsMusic:function () {
    var _this = this
    $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php',{sid:this.song.sid}).done(function (rt) {
      var lyric = rt.lyric
      var lyricObj = {}
      lyric.split('\n').forEach(function (t) {
        var times = t.match(/\d{2}:\d{2}/g)
        var str = t.replace(/\[.+?\]/g,' ')
        if(Array.isArray(times)){
          times.forEach(function (t2) {
            lyricObj[t2] = str
          })
        }
      })
      _this.lyricObj = lyricObj
    })
  },
  variation:function(){
    // console.log(this.song)
    this.audio.src = this.song.url
    this.$h1.text(this.song.title)
    this.$h5.text(this.name)
    this.$p.text(this.song.artist)
    this.$bg_max.css('backgroundImage','url("' + this.song.picture+ '")')
    this.$bg_min.css('backgroundImage','url("' + this.song.picture + '")')
    this.$box.find('.play').removeClass('icon-fon2').addClass('icon-fon3')

  },
  planTime:function () {
    var min = Math.floor(this.audio.currentTime/60)
    var second = Math.floor(Fm.audio.currentTime%60) + ''
    second = second.length === 2?second:'0'+ second
    this.$box.find('.time').text(min + ':'+ second)
    this.$box.find('.timeline-up').css('width',this.audio.currentTime/this.audio.duration*100+'%')

    var lyricText = this.lyricObj['0'+ min + ':' + second]
    if(lyricText){
      this.$box.find('.lyric').text(lyricText).boomText('bounce')
      //hinge
    }
  },


}


$.fn.boomText = function(type){
  type = type || 'rollIn'
  // console.log(type)
  this.html(function(){
    var arr = $(this).text()
        .split('').map(function(word){
          return '<span class="boomText">'+ word + '</span>'
        })
    return arr.join('')
  })

  var index = 0
  var $boomTexts = $(this).find('span')
  var clock = setInterval(function(){
    $boomTexts.eq(index).addClass('animated ' + type)
    index++
    if(index >= $boomTexts.length){
      clearInterval(clock)
    }
  }, 150)
}

Fm.init()
list.init()