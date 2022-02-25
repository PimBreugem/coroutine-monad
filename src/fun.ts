export type IntermediateState = {}

export interface Fun<input, output>{
    (_:input) : output,
    then: <finalOutput>(g: Fun<output, finalOutput>) => Fun<input, finalOutput>
}

export let Fun = <input, output>(first: (_: input) => output): Fun<input, output> => {
    const fDecorated = first as Fun<input, output>
    fDecorated.then = function<finalOutput>(second: Fun<output, finalOutput>): Fun<input, finalOutput> {
        return Fun<input, finalOutput>((x: input) => second(first(x)))
    }
    return fDecorated
}

// Export type and let of pair, a pair exists of two function
export type Pair<firstFun, secondFun> = {first: firstFun, second: secondFun}

export let Pair = <firstFun, secondFun>(x: firstFun, y: secondFun) : Pair<firstFun, secondFun> => {
    return { first: x, second: y}
}