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

//map either
export let Either_map = <optionA, optionA1, optionB, optionB1>(f_fun: Fun<optionA, optionA1>, g_fun: Fun<optionB, optionB1>):
    Fun<Either<optionA, optionB>, Either<optionA1, optionB1>> => {
        return Fun((either: Either<optionA, optionB>): Either<optionA1, optionB1> => {
            if (either.kind == "optionA") {
                return optionA<optionA1, optionB1>()(f_fun(either.value))
            } else {
                return optionB<optionA1, optionB1>()(g_fun(either.value))
            }
        }
    )
}