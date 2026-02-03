## common
 - 코드는 지역성을 우선시한다.

## repository
 - repository는 단순 쿼리만을 담는다.
 - repository내의 코드는 async, await를 하지 않고, promise를 그대로 리턴한다.
 - *.repository.spec.ts 는 쿼리의 생성만을 테스트 한다.

## module
 - fowardRef는 최대한 지양한다.
 - Entity마다 모듈을 만든다. Entity는 추상화 정도나 용도에 따라 존재할 수도 있고 없을수도 있다.

## service
 - Entity의 생성과 제거, 업데이트는 해당 Entity를 다루는 service의 module을 import하여 사용한다.
 - select는 바로 옆의 repository에서 바로 가져다 쓴다.
 - 다른 module의 repository와 service를 직접 import하면 안된다
 