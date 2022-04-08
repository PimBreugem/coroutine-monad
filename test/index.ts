import { IntermediateState } from "../src/fun"
import { unsafeRun, unsafeRunGetValue} from "../src/runtime"
import {
    Coroutine,
    succeed,
    failed,
    suspended,
    Do,
    compute,
    RepeatUntil,
    effect
} from "../src/index"
import { optionA, optionB} from "../src/either"

// let test1 = unsafeRunGetValue(succeed<number, never, number>(10), 1)
// console.log(test1.first == 10)
//
// let test2 = unsafeRun(suspended<number, string>(), 2)
// console.log(test2.kind == "optionA")
//
// // let test3 = unsafeRun(failed<number, string, boolean>("Error!"), 1)
// // try catch, should return an error
//
// let numericVar = 0
// let repetition = effect<never, void>(() => { numericVar++ }).repeatUntil(() => numericVar >= 16)
// unsafeRun(repetition, {})
// console.log(numericVar == 16)
//
// let test5 = compute<number, never, number>(x => 10 + x)
// console.log(test5(5).value)

let s = {counter: 0}
let a = RepeatUntil(() => s.counter >= 10, effect(() => {
    s.counter++;
    console.log(s.counter.toString());
}))

a(0)

//Do(s => console.log(s))('a')

//let s = {counter: 0}
// RepeatUntil(s => s.Counter > 0,
//     Do(s => ({...s, Counter: s.Counter+1}))
// )({Counter:0})


// let b = repeatUntil((s: {counter:number}) => s.counter >= 10, effect((s: {counter:number}) =>
//     ({...s, counter:s.counter+1})
// ))
// b({counter:0})
