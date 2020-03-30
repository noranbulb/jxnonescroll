  /*
  //------------------ JXNONESCROLL  ------------------ //
  설명 : 가로나 세로 움직임을 마우스 휠이 아닌 드래그로 객체를 슬라이딩 하는 플러그인

  version( 버전 ) : 3
  date ( 날짜 ) : 2020.01

  [ defaults.options ]
  bMobile        : pc 또는 mobile에서 드래그 여부 (true or false:기본)
  sDirection      : h(기본) or vertical 옵션 추가 세로 형태도 움직임 가능
  bAction         : 세로형태일경우에 nav를 넣을수도 있다. 그래서 세로형태일경우 bAction을 false를 줘야 addEventClick 등록을 하지 않고 위아래로 움직이지 않게 함
  bBounce        : 드래그시 최상단과 최하단에 도달하면 바로 멈출것인가
  bScroll          : jxbox 에 overflow : auto 를 줘버리면 드래그를 하지 않고 스크롤이 생겨서 마우스 휠로 움직여야 해서 touch 이벤트를 등록하면 안된다. ( 세로형태일때만 가능 )
  bSoftMove : 부드럽게 움직일것인가
  reCallFnc           : 콜백함수이며 선택된 jxunit.on의 $(this).index() 을 넘긴다.

  update
  1. options 변수를  this.defaults 로 값을 extend 하고

  2. this.defaults.bSoftMove 은 바로 자기 자리로 갈때 부드럽게 움직이지 말고 바로 갈수 있도록


  */
  function JXNONESCROLL(obj, options) {
    //console.log('JXNONESCROLL ' , obj , options )
    var _this = this;
    this.defaults = {
      bMobile: true,
      sDirection: 'h', //가로 세로 방향 h = h 이고 v = vertical
      bAction: false, //요소를 클릭하면 그 요소로 움직임
      bBounce: false, //움직임이 끝에서 바운스를 일으킬것인가
      bScroll: false, //overflow 스크롤을 생기에 할것인가
      bSoftMove: true, //부드럽게 움직일것인가
      reCallFnc: function(v) {
        console.log('defaults reCallFnc', v)
      }
    }

    //피씨와 모바일 체크
    ;
    (function(a, b) {
      var ua = a.userAgent.toLowerCase();
      var pl = a.platform.toLowerCase();
      var mx = a.maxTouchPoints;

      if (/mobile/i.test(ua) || /ipad|iphone|ipod/i.test(pl) || (pl === 'macintel' && mx > 1)) {
        _this.defaults.bMobile = true;
      } else {
        _this.defaults.bMobile = false;
      }
    })(navigator, 'm/');

    $.extend(true, this.defaults, options);


    this.jxnonescroll = obj;
    this.jxbox = this.jxnonescroll.find('> .jx-box'); //ul을 감싸고 있는 부모 클래스
    this.jxwrap = this.jxbox.find('> .jx-wrap');
    this.jxunit = this.jxwrap.find('> .jx-unit');

    this.nTarEnd = 0;
    this.nCurr;

    this.nSize = 0;

    this.bMovIng = false; // 드래그 이용하여 움직임이 시작했느냐
    this.nEX = 0; //ul 의 이동완료 된후 left 값을 담는다.
    this.nDragTime; //드래그 시작한 시점
    this.bPcIng = false; // pc에선 마우스 무브가 계속 움직이므로 그러나 공통으로 하면 된다.
    this.nCX = 0; //드래그 차이값
    this.nCY = 0; //드래그 차이값
    this.nTarAdd = 0; //속도를 계산하여 더해질 값
    this.nTarOri = 0; //엔터 프레임에서 계산할때 필요한 목표값 ( 드래그하고 난후 ul 위치 + 속도를 계산하여 더해질 값:this.nTarAdd)
    this.nTarEnd //= 0;
    this.sDragChg = ''; // 드래그를 왔다갔다할때 체크

    if (this.defaults.bAction) {
      //this.defaults.bSoftMove = true;
      this.defaults.bScroll = false; //클릭해서 이동을 되는 옵션이 들어가면 스크롤은 다시 안되게 해야한다.
      this.addEventClick();
    }


    if (!this.defaults.bScroll) {
      this.addEventDrag(); //드래그 이벤트 등록
    }

    $(window).resize(function() {
      _this.reset();
    })

    $(window).trigger('resize');
  } //JXNONESCROLL
  JXNONESCROLL.prototype.reset = function() {
    var _this = this;
    var nRelax = .5;
    this.nSize = 0;
    if (_this.defaults.sDirection == 'h') {
      if (_this.defaults.bScroll) {
        _this.jxbox.css({ 'overflow-x': 'auto' });
      }
      this.jxwrap.find('>.jx-unit').each(function(i, e) {
        _this.nSize += ($(this).outerWidth(true) + nRelax);
      });
      this.jxwrap.css({ 'width': _this.nSize });
    } else {
      if (_this.defaults.bScroll) {
        _this.jxbox.css({ 'overflow-y': 'auto' });
      }
      //this.jxwrap.find('>.jx-unit').css({ 'float': 'none' });
      this.jxwrap.find('>.jx-unit').addClass('clear');
      this.jxwrap.find('>.jx-unit').each(function(i, e) {
        _this.nSize += ($(this).outerHeight(true) + nRelax);
      });
      //this.jxwrap.css({'height' :  _this.nSize });
      this.jxwrap.css({ 'height': _this.nSize, 'min-height': '100%' });
    }
    if (_this.defaults.bMobile) {
      _this.dragLimit();
    }
  } //JXNONESCROLL.prototype.reset

  JXNONESCROLL.prototype.addEventClick = function() {
    var _this = this;
    //외부에서 on이 찍혀있으면 바로 그 부분으로 가게 할려고 하는것
    _this.jxwrap.find('>.jx-unit').each(function(i, e) {
      if ($(this).hasClass('on')) {
        var $this = $(this);
        setTimeout(function() {
          _this.setMove($this);
          // _this.dragLimit();
        }, 100)
      }
    });
    //_this.jxwrap.find('>.jxunit').bind( sEventEnd , function(e)
    _this.jxwrap.find('>.jx-unit').bind('click', function(e) {

      //console.log(_this.nCurr , $(this).index())
      if (_this.nCurr != $(this).index()) {
        e.preventDefault();
      }

      var $this = $(this);
      if (_this.bMovIng || _this.jxwrap.is(':animated')) {
        return;
      }
      _this.bPcIng = false;
      _this.setMove($this);
      // if (_this.defaults.reCall != undefined) {
      //   _this.defaults.reCall(_this.nCurr);
      // }

    });
  } //addEventClick

  JXNONESCROLL.prototype.setMove = function(obj) {
    var _this = this;
    //var nChar = Math.abs(_this.nCurr - obj.index());

    _this.nTarOri = obj.position().left * -1;
    if (_this.defaults.sDirection == 'h') {
      _this.nTarOri = obj.position().left * -1;
    } else {
      _this.nTarOri = obj.position().top * -1;
    }

    obj.addClass('on').siblings().removeClass('on');
    _this.dragLimit();

    _this.nCurr = obj.index();
  } //setMove

  JXNONESCROLL.prototype.addEventDrag = function() {
    var _this = this;
    //console.log (_this.defaults.bMobile)
    var sEventOver, sEventStart, sEventMove, sEventEnd;
    sEventOver = 'mouseover';
    if (_this.defaults.bMobile) {
      sEventStart = 'touchstart';
      sEventMove = 'touchmove';
      sEventEnd = 'touchend';
    } else {
      sEventStart = 'mousedown';
      sEventMove = 'mousemove';
      sEventEnd = 'mouseleave click';
    }
    var nSX = nSY = nZX = 0 // 클릭시에 처음 지점
    var nPX, nMX, nMY; // 드래그 할때 한쪽 방향으로만 이동하면 되지만 왔다 갔다 했을때는 문제가 되기 때문에 이 변수에 담아서 확
    var nPY = 0;
    // _this.jxslider.bind( sEventStart , function(e)
    var nZig = 0; //꺽은 횟수 2번 이상이면 꺽은거
    _this.jxbox.bind(sEventOver, function(e) {
      //_this.jxnonescroll.bind( sEventOver , function(e)  {
      //console.log('over')
      clearInterval(this.MovingTime)
    }).bind(sEventStart, function(e) {
      //_this.defaults.bSoftMove = false;
      _this.bPcIng = true;
      clearInterval(_this.MovingTime);
      if (_this.defaults.sDirection == 'h') {
        nSX = (e.originalEvent.touches) ? e.originalEvent.touches[0].clientX : e.originalEvent.clientX;
        nSY = (e.originalEvent.touches) ? e.originalEvent.touches[0].clientY : e.originalEvent.clientY;
        _this.nEX = _this.jxwrap.position().left;
      } else {
        nSX = (e.originalEvent.touches) ? e.originalEvent.touches[0].clientY : e.originalEvent.clientY;
        nSY = (e.originalEvent.touches) ? e.originalEvent.touches[0].clientX : e.originalEvent.clientX;
        _this.nEX = _this.jxwrap.position().top;
      }
    }).bind(sEventMove, function(e) {
      //pc에서 드래그가 계속 되는것을 방지
      if (!_this.bPcIng) { return; }
      nPX = nMX; //드래그 하는 동안 전에 좌표값(nMX : x축으로 )을  담는다
      nPY = nMY; //드래그 하는 동안 전에 좌표값(nMY : y축으로 )을  담는다
      if (_this.defaults.sDirection == 'h') {
        nMX = (e.originalEvent.touches) ? e.originalEvent.touches[0].clientX : e.originalEvent.clientX; //무브시에 값을 다시 가져오고
        nMY = (e.originalEvent.touches) ? e.originalEvent.touches[0].clientY : e.originalEvent.clientY; //무브시에 값을 다시 가져오고
      } else {
        nMX = (e.originalEvent.touches) ? e.originalEvent.touches[0].clientY : e.originalEvent.clientY;
        nMY = (e.originalEvent.touches) ? e.originalEvent.touches[0].clientX : e.originalEvent.clientX;
      }
      _this.nCX = nMX - nSX; //드래그 차이값
      _this.nCY = nMY - nSY; //드래그 차이값
      if (Math.abs(_this.nCX) > Math.abs(_this.nCY)) {
        e.preventDefault(); //console.log(' x축 값이 더 크면 스크롤 막자 ')
      } else {
        return; //console.log('좌우 움직이지 마')
      }
      var date = new Date();
      if (!_this.bMovIng) {
        _this.bMovIng = true;
        _this.nDragTime = (date.getSeconds() * 1000) + date.getMilliseconds(); //이건 기본적으로 드래그 시간을 알아내는것
        //console.log('--------------moving'  );
      }
      //console.log('------------------- ' , _this.bMovIng)
      if (nPX > nMX) {
        //드래그하는것이 왔다 갔다 하는것이냐 초반에는 값을 정할수 없으니 왼쪽으로 드래그이면 R를 넣고
        if (_this.sDragChg == '') {
          _this.sDragChg = 'R';
        }
        //R이면 다시 L로 해서 한번만 실행
        if (_this.sDragChg == 'R') {
          //console.log('<<<<< ', nZig);
          _this.sDragChg = 'L';
          nZig++; //왔다갔다 체크인데 2이상이면 왔다갔다로 인식
          _this.nDragTime = (date.getSeconds() * 1000) + date.getMilliseconds(); //왔다갔다 하므로 시간을 다시 정하고
          if (_this.defaults.sDirection == 'h') {
            nZX = (e.originalEvent.touches) ? e.originalEvent.touches[0].clientX : e.originalEvent.clientX; //드래그가 끝나면 이값을 가지고 다시 드래그 차이를 넣는다. nCX로 하면 드래그하는 동안 값이 변경되어 문제가 생김
          } else {
            nZX = (e.originalEvent.touches) ? e.originalEvent.touches[0].clientY : e.originalEvent.clientY; //드래그가 끝나면 이값을 가지고 다시 드래그 차이를 넣는다. nCX로 하면 드래그하는 동안 값이 변경되어 문제가 생김
          }
        }
      }
      if (nPX < nMX) {
        //드래그하는것이 왔다 갔다 하는것이냐
        if (_this.sDragChg == '') {
          _this.sDragChg = 'L';
        }
        if (_this.sDragChg == 'L') {
          //console.log('>>>>>>>', nZig);
          _this.sDragChg = 'R';
          nZig++;
          _this.nDragTime = (date.getSeconds() * 1000) + date.getMilliseconds();
          if (_this.defaults.sDirection == 'h') {
            nZX = (e.originalEvent.touches) ? e.originalEvent.touches[0].clientX : e.originalEvent.clientX;
          } else {
            nZX = (e.originalEvent.touches) ? e.originalEvent.touches[0].clientY : e.originalEvent.clientY;
          }
        }
      }
      if (_this.defaults.sDirection == 'h') {
        var tar = _this.nEX + _this.nCX;
        if (!_this.defaults.bBounce) {
          if (tar > 0) {
            tar = 0;
          }
          if (tar < _this.jxnonescroll.find('> .jx-box').innerWidth() - _this.jxnonescroll.find('> .jx-box > .jx-wrap').innerWidth()) {
            //맨 끝이면 끝에서 넘어가면 다시 오게 한다.
            if (_this.jxnonescroll.find('> .jx-box').innerWidth() - _this.jxnonescroll.find('> .jx-box > .jx-wrap').innerWidth() < 0) {
              tar = _this.jxnonescroll.find('> .jx-box').innerWidth() - _this.jxnonescroll.find('> .jx-box > .jx-wrap').innerWidth();
            } else {
              tar = 0;
            }
          }
        }
        _this.jxwrap.css({ 'left': tar }); //ul을 이동하고
      } else {
        //console.log(_this.nEX + _this.nCX)
        var tar = _this.nEX + _this.nCX;
        if (!_this.defaults.bBounce) {
          if (tar > 0) {
            tar = 0;
          }
          if (tar < _this.jxnonescroll.find('> .jx-box').innerHeight() - _this.jxnonescroll.find('> .jx-box > .jx-wrap').innerHeight()) {
            //맨 끝이면 끝에서 넘어가면 다시 오게 한다.
            if (_this.jxnonescroll.find('> .jx-box').innerHeight() - _this.jxnonescroll.find('> .jx-box > .jx-wrap').innerHeight() < 0) {
              tar = _this.jxnonescroll.find('> .jx-box').innerHeight() - _this.jxnonescroll.find('> .jx-box > .jx-wrap').innerHeight();
            } else {
              tar = 0;
            }
          }
        }
        _this.jxwrap.css({ 'top': tar }); //ul을 이동하고
      }
    }).bind(sEventEnd, function(e) {

      //e.stopPropagation();
      _this.bMovIng = false;
      if (nZig > 1) {
        //1번이상 왔다갔다 했다는것이다
        _this.nCX = nMX - nZX; //드래그 차이값
      }
      nZig = 0;
      //_this.nCX = nMX - nSX; //드래그 차이값
      nPX = 0; //드래그 왔다 갔다 담는 값을 초기화
      nMX = 0; //드래그 왔다 갔다 담는 값을 초기화
      _this.bPcIng = false; //피시에서 드래그 계속 되는것을 방지
      if (_this.defaults.sDirection == 'h') {
        _this.nEX = _this.jxwrap.position().left; //드래그 다시 할때 필요한 엔드 값을 담는다.
      } else {
        _this.nEX = _this.jxwrap.position().top; //드래그 다시 할때 필요한 엔드 값을 담는다.
      }
      _this.nTarEnd = _this.nEX;
      //console.log('end --------------   _this.nTarOri  ' , _this.nTarOri , '_this.nTarEnd  ' , _this.nTarEnd)
      if (_this.nDragTime == undefined) {
        console.log('조금이라도 이동을 하지 않았을때이다');
        return;
      }

      e.preventDefault();

      var date = new Date();
      //console.log('end 이동거리 =  ' , Math.abs( _this.nCX ) , '    걸린 시간 = ' ,   Math.abs( date.getMilliseconds() - _this.nDragTime) )
      var endTime = (date.getSeconds() * 1000) + date.getMilliseconds() - _this.nDragTime; //드래그가 된 시간 구함
      var nSpeed = endTime / Math.abs(_this.nCX) //속력 구하고
      _this.nTarAdd = _this.nCX / nSpeed; //얼마나 더 가야할지를 계산
      if (nSpeed > .6) {
        //속력이 .8초 이상이면 너무 오래 누르고 있는 상황
        _this.nTarAdd *= .1;
      }
      _this.nTarOri = Math.round(_this.nEX + _this.nTarAdd); // 얼마나 더 가야할지를 담는다
      _this.dragLimit();
    })
  } //addEventDrag
  JXNONESCROLL.prototype.dragLimit = function() {
    var _this = this
    if (_this.nTarOri > 0) {
      //맨 앞이면 다시 0으로 오게 하고
      _this.nTarOri = 0;
      _this.nEX = _this.nTarOri;
    }
    if (_this.defaults.sDirection == 'h') {
      if (_this.nTarOri < _this.jxbox.innerWidth() - _this.jxwrap.innerWidth()) {
        //맨 끝이면 끝에서 넘어가면 다시 오게 한다.
        if (_this.jxbox.innerWidth() - _this.jxwrap.innerWidth() < 0) {
          _this.nTarOri = _this.jxbox.innerWidth() - _this.jxwrap.innerWidth();
          _this.nEX = _this.nTarOri;
        } else {
          _this.nTarOri = 0;
          _this.nEX = _this.nTarOri;
        }
      }
    } else {
      if (_this.nTarOri < _this.jxbox.innerHeight() - _this.jxwrap.innerHeight()) {
        //맨 끝이면 끝에서 넘어가면 다시 오게 한다.
        if (_this.jxbox.innerHeight() - _this.jxwrap.innerHeight() < 0) {
          _this.nTarOri = _this.jxbox.innerHeight() - _this.jxwrap.innerHeight();
          _this.nEX = _this.nTarOri;
        } else {
          _this.nTarOri = 0;
          _this.nEX = _this.nTarOri;
        }
      }
    }
    //console.log('dragLimit ', _this.nTarOri)
    //스무스한 계산 실행
    clearInterval(_this.MovingTime);
    _this.MovingTime = setInterval(function() {
      _this.addEventEnterFrame();
    }, 40);
  } //dragLimit
  JXNONESCROLL.prototype.addEventEnterFrame = function() {
    var _this = this;
    this.nDragTime = undefined;
    if (this.defaults.bSoftMove) {
      this.nTarEnd += (_this.nTarOri - this.nTarEnd) * .3;
      //console.log('addEventEnterFrame   nTarOri = ' ,  _this.nTarOri , '    nTarEnd ' , _this.nTarEnd );
      if (Math.abs(_this.nTarOri - this.nTarEnd) < .1) {
        //console.log('엔터 프레임 ', this.defaults.bSoftMove, _this.nTarOri)

        this.callback();
        this.nTarEnd = _this.nTarOri;
        this.nEX = this.nTarEnd;
        clearInterval(this.MovingTime)
      }
    } else {
      this.callback();
      this.nTarEnd = this.nTarOri;
      this.nEX = this.nTarEnd;
      clearInterval(this.MovingTime);
    }
    if (_this.defaults.sDirection == 'h') {
      //console.log('addEventEnterFrame    ' , _this.jxwrap , _this.nTarOri)
      _this.jxwrap.css({ 'left': this.nTarEnd }); //ul을 이동하고
    } else {
      _this.jxwrap.css({ 'top': this.nTarEnd }); //ul을 이동하고
    }
  } //addEventEnterFrame

  JXNONESCROLL.prototype.callback = function() {
    var _this = this;

    //console.log('callback ===  ' , this.jxnonescroll.attr('class') ,  this.defaults)

    if (typeof this.defaults.reCallFnc === 'string') {
      var str = this.defaults.reCallFnc.split(' ').join('');

      //console.log(3333333 , typeof this.defaults.reCallFnc === 'string' , str , typeof window[str] === 'function')
      if (str.length > 0 && typeof window[str] === 'function') {
        //console.log('일단 빈문자가 아닌 함수명도 있고 함수도 정의된 경우만 ')
        this.jxunit.each(function(i, e) {
          if ($(this).hasClass('on')) {
            //console.log('this.defaults.reCallFnc ' , _this.defaults.reCallFnc ===  'string' , $(this).index())
            eval(_this.defaults.reCallFnc)($(this).index());
          }
        });
      } else {
        //console.log('일단 글자가 없는경우')
      }
    } else {
      //console.log('옵션을 넘기지 않았다')
    }

  }