function add(a: number, b: number) {
    return a + b
}

console.log(add(1,2))


// RepeatUntil(s => s.Counter > 10,
//     Wait(5).then(() =>
//         Do(s => ({...s, Counter:s.Counter+1}))
//     )
// )
//
//
//
// Wait(5) direct.
//
//
//
//

interface Fun<input, output> {
    (_:input) : output,
    then<finalOutput>(postProcess:Fun<output, finalOutput>) : Fun<input, finalOutput>
}

const then = <input, intermediateOutput, output>(
    first:Fun<input,intermediateOutput>,second:Fun<intermediateOutput, output>) : Fun<input,output> =>
    fun((input:input) => second(first(input)))

const fun = <input,output>(f:(_:input) => output) : Fun<input,output> => {
    const fDecorated = f as Fun<input,output>
    fDecorated.then = function<finalOutput>(postProcess:Fun<output, finalOutput>) : Fun<input, finalOutput> {
        return then(this, postProcess)
    }
    return fDecorated
}


interface
