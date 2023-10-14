// 목적 : go 구현 이해하기

/* 

먼저 [Symbol.iterator]()를 이해해야 하는데 

JS 내장 객체인 Array, Set, Map은 이터러블/이터레이터 프로토콜을 따르고 있다.

## 이터러블/이터레이터 프로토콜
- 이터러블: 이터레이터를 리턴하는 [Symbol.iterator]() 메서드를 가진 값
- 이터레이터: value, done 객체를 리턴하는 next() 메서드를 가진 값
- 이터러블/이터레이터 프로토콜: 이터러블을 for...of, 전개 연산자 등과 함께 동작하도록한 규약

*/

// 사용자 정의 이터러블 구현을 통해 이터러블 알아보기
const iterable = {
    [Symbol.iterator]() {
        let i = 3;
        return {
            next() {
                return i == 0 ? { done: true } : { value: i--, done: false };
            },
            [Symbol.iterator]() {
                return this;
            }
        }
    }
};
let iterator = iterable[Symbol.iterator]();

console.log(iterator.next()) // { value: 3, done: false }
console.log(iterator.next()) // { value: 2, done: false }
for (const a of iterator) console.log(a);
// { value: 1, done: false }
// 1
console.log(iterator.next()) // { done: true }
console.log(iterator.next()) // { done: true }



// 예시 arr
const arr = [1, 2, 3]
let iter = arr[Symbol.iterator]()
console.log(iter.next()) // { value: 3, done: false }
console.log(iter.next()) // { value: 2, done: false }
console.log(iter.next()) // { value: 1, done: false }
console.log(iter.next()) // { done: true }

// 이제 reduece를 보면

const reduce = (f, acc, iter) => {
    if (!iter) {
        iter = acc[Symbol.iterator]();
        acc = iter.next().value;
    }
    for (const a of iter) {
        acc = f(acc, a);
    }
    return acc;
};

/*
iter가 없으면 iter 인수에 acc[Symbol.iterator]()를 넣어주는 데 이것에 의미는 실제 js reduce의 로직을 생각해보면 된다. 
js에서 제공하는 reduce는 acc의 초기값을 지정할 수 있는데 여기서는 그 부분을 구현한 것이다. acc = iter.next().value;
의 값을 넣은 이유도 acc의 초기값이 없으면 iter로 받은 예를 들면 [1,2,3]의 첫번째 인자 값을 넣어 acc의 값을 초기화 한 것이다.

그리고 밑에 for of 반복문을 인자로 받은 f를 실행하여 누산 진행
*/

const add = (a, b) => a + b;

const go = (...args) => reduce((a, f) => f(a), args);

go(
    add(0, 1),
    a => a + 10,
    a => a + 100,
    console.log
); /// 결과 111

/* 
const go = (...args) =>
reduce((a, f) => f(a), args)

이 두 부분을 나누어서 보면 편하다.
1. 먼저 ...args 부분에서 [add(0, 1), a => a + 10, a => a + 100, console.log]를 인자로 받았다.
2. 그 다음 부분에서 (a, f) => f(a) 이 함수를 reduce의 첫번째 인자로 준 것이다. ( reduce = (f, acc, iter) 여기서 f의 해당하는 부분이 된 것이다.)
3. 그 뒤에 reduce((a, f) => f(a), args) 부분에 args는 전에 받았던 ...args를 배열로 받게 된 것이다. 
4. const reduce = (f, acc, iter) => {
    if (!iter) {
        iter = acc[Symbol.iterator]();
        acc = iter.next().value;
    }
    for (const a of iter) {
        acc = f(acc, a);
    }
    return acc;
};
reduce의 if (!iter) 부분을 보면 iter가 없기 때문에 iter에 acc 즉 [add(0, 1), a => a + 10, a => a + 100, console.log]가 들어가게 된 것이다. 그리고 acc에는 add(0, 1) 이 함수가 실행 돼서 저장이 되었으면 값은 1이다.
그 다음 for (const a of iter)가 처음으로 실행 될 떄 iter는 방금 설명 한 배열이고 배열의 2번째 인자부터 실행이 되는데  acc = iter.next().value; 이 로직이 있었기 때문이다.
다시  (const a of iter)가 처음으로 실행 되면 a는 a => a + 10 이 값이 된다. 
이제 acc = f(acc,a)가 실행 되는데 여기서 f는 (a, f) => f(a)가 되는 것이고. 즉 acc = 1 => 1+10 가 되는 것이다. 

그리고서 이 과정이 반복이 된다.
*/