import { IntermediateState } from "../src/fun"
import { unsafeRun, unsafeRunGetValue} from "../src/runtime"
import {
    Coroutine,
    succeed,
    failed,
    suspended,
    effect,
    compute,
    Do,
    repeatUntil,
    Wait

} from "../src/index"
import { optionA, optionB} from "../src/either"

// let test1 = unsafeRunGetValue(succeed<number, never, number>(10), 1)
// console.log(test1.first == 10)
//
// let test2 = unsafeRun(suspended<number, string>(), 2)
// console.log(test2.kind == "optionA")
//
// //let test3 = unsafeRun(failed<number, string, boolean>("Error!"), 1)
// // try catch, should return an error
//
// let numericVar = 0
// let repetition = effect<never, void>(() => { numericVar++ }).repeatUntil(() => numericVar >= 16)
// let test4 = unsafeRun(repetition, {})
//
// let test5 = compute<number, never, number>(x => 10 + x).bind(compute<number, never, number>(x => 10 + x))
// console.log(test5(5).value)
// console.log(test5(10).value)
//
// console.log(numericVar == 16)

// @ts-ignore
let a = repeatUntil((s:{Counter:number}) => s.Counter > 10,
    Wait(5).bind(() =>
       Do((s:{Counter:number}) => {
           console.log(s.Counter);
           return ({...s, Counter:s.Counter++});
       })
    )
)


console.log(a({Counter:0}))

// a = Wait(10000000000).bind(() => console.log('a'))
// console.log('a')
// console.log(a({Counter: 0}))

