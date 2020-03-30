﻿

jxnonescroll
-
가로나 세로로 객체를 일반 스크롤이 아닌 움직임을 주기 위한 플러그인


https://jxnonescroll.netlify.com/

#### html

 ``` sh
 <div class="jx-nonescroll" >
  <div class="jx-box">
    <ul class="jx-wrap">
      <li class="jx-unit on">
        <a class="jx-cont">MAN</a>
      </li>
      <li class="jx-unit">
        <a class="jx-cont">WOMEN</a>
      </li>
      <li class="jx-unit">
        <a class="jx-cont">SPORTS &amp; OUTDOOR</a>
      </li>
      <li class="jx-unit">
        <a class="jx-cont">ACCESSORIES</a>
      </li>
      <li class="jx-unit">
        <a class="jx-cont">COSMETIC</a>
      </li>
      <li class="jx-unit">
        <a class="jx-cont">LIFE STYLE</a>
      </li>
    </ul>
  </div>
</div>

````


#### javascript

```` sh
<head>
    <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.9.1.js"></script>
    <script src="https://code.jquery.com/jquery-migrate-1.2.1.js"></script>
    <script src="resources/js/jxnonescroll-ver-3.js"></script>
</head>

<body>

..기본 슬라이드 객체 생략..

<script>

  new JXNONESCROLL( $('.jx-nonescroll') );
</script>

</body>

````


### option

Option | Type | Default | Description
------ | ---- | ------- | -----------
bMobile     |  boolean  |  true  | pc 와 모바일 버전 확인
sDirection  |  string   |  h  | 움직이는 방향 가로(h) or 세로(v)
bAction     |  boolean  | false | 객체를 클릭하면 칸 차이를 인식하여 이동  `링크가 있는경우에는 현제 활성화된=on 객체는 링크 연결이 되고 나머지는 움직이게 된다.`
bBounce     |  boolean  | false | 드래그시 최상단과 최하단에 도달하면 바로 멈출것인지 한번 바운스를 줄것인지 여부
bScroll     |  boolean  |  false | jx-box 에 overflow : auto 를 줘버리면 드래그를 하지 않고 스크롤이 생겨서 마우스 휠로 움직일수가 있다.`세로형태일때 사용하는게 좋음`
bSoftMove   |  boolean  |  true  | 부드럽게 움직일것인가
reCallFnc |  string  |  -  | 슬라이드가 끝난후 외부에서 넘긴 함수를 실행시키는 방법 `외부에서 함수를 정의하고 속성에 스트링 타입으로 함수명을 적어주면 된다. ex ) {reCallFnc : testCall} 넘겨주고 function testCall(v) { console.log(v); } `


### mothod
Option | Type |  Description
------ | ---- |  -----------
setMove |  function  |   바로 몇번째를 객체로 이동을 하게 됨 `setMove($('.jx-nonescroll .jx-unit').eq(2)) 이면 3번째 객체를 클릭한것으로 이동`
reset   |  function  |   객체의 전체 사이즈를 갱신해야할때 사용



