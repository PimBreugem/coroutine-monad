import { IntermediateState } from "../src/fun"
import { unsafeRun, unsafeRunGetValue} from "../src/runtime"
import {
    Coroutine,
    succeed,
    failed,
    suspended,
    effect,
    compute
} from "../src/index"
import { optionA, optionB} from "../src/either"

let test1 = unsafeRunGetValue(succeed<number, never, number>(10), 1)
console.log(test1.first == 10)

let test2 = unsafeRun(suspended<number, string>(), 2)
console.log(test2.kind == "optionA")

//let test3 = unsafeRun(failed<number, string, boolean>("Error!"), 1)
// try catch, should return an error

let numericVar = 0
let repetition = effect<never, void>(() => { numericVar++ }).repeatUntil(() => numericVar >= 16)
let test4 = unsafeRun(repetition, {})

let test5 = compute<number, never, number>(x => 10 + x)
console.log(test5(5).value)

console.log(numericVar == 16)