export type IntermediateState = {}

export interface Fun<input, output> {
    (_: input): output,

    then: <finalOutput>(g: Fun<output, finalOutput>) => Fun<input, finalOutput>
}

export let Fun = <input, output>(first: (_: input) => output): Fun<input, output> => {
    const fDecorated = first as Fun<input, output>
    fDecorated.then = function <finalOutput>(second: Fun<output, finalOutput>): Fun<input, finalOutput> {
        return Fun<input, finalOutput>((x: input) => second(first(x)))
    }
    return fDecorated
}

export let identifier = <inputOutput>(): Fun<inputOutput, inputOutput> => Fun((x: inputOutput) => x)

// Export type and let of pair, a pair exists of two function
export type Pair<firstFun, secondFun> = { first: firstFun, second: secondFun }

export let Pair = <firstFun, secondFun>(x: firstFun, y: secondFun): Pair<firstFun, secondFun> => {
    return {first: x, second: y}
}

// Mapping between two coroutine types, maps both pairs and execute the first and second action of each result.
export let Pair_map = <firstFun, firstFun1, secondFun, secondFun1>(f_fun: Fun<firstFun, firstFun1>, g_fun: Fun<secondFun, secondFun1>): Fun<Pair<firstFun, secondFun>, Pair<firstFun1, secondFun1>> => {
    return Fun((action: Pair<firstFun, secondFun>) => Pair<firstFun1, secondFun1>(f_fun(action.first), g_fun(action.second)))
}


//Example of how function works
// const id = <inputOutput>() => Fun<inputOutput, inputOutput>(x => x);
// const incr = Fun<number, number>(x => x + 1)
// const dupl = Fun<number, number>(x => x * 2)
//
// const g = incr.then(dupl)
// console.log(g(2))
