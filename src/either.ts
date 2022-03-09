import { Fun } from "./fun"

// Exporting a type Either, should have two options
export type Either<optionA, optionB> = {
    kind: "optionA",
    value: optionA
} | {
    kind: "optionB",
    value: optionB
}

// Export optionA which returns the first option (A)
export let optionA = <optionA, optionB>(): Fun<optionA, Either<optionA, optionB>> => {
    return Fun<optionA, Either<optionA, optionB>>((x: optionA) => {
        return {
            kind: "optionA",
            value: x
        }
    })
}

// Export optionB which returns the second option (B)
export let optionB = <optionA, optionB>(): Fun<optionB, Either<optionA, optionB>> => {
    return Fun<optionB, Either<optionA, optionB>>((x: optionB) => {
        return {
            kind: "optionB",
            value: x
        }
    })
}