import { Coroutine } from "./index"
import { Pair, Pair_map } from "./fun"
import { Either, optionA, optionB } from "./either"

export let unsafeRun = <State, Errored, Action>(coroutine: Coroutine<State, Errored, Action>, state: State): Either<Coroutine<State, Errored, Action>, Pair<Action, State>> => {
    let result = coroutine(state)
    if (result.kind == "optionB") {
        return optionB<Coroutine<State, Errored, Action>, Pair<Action, State>>()(result.value)
    } else {
        if (result.value.kind == "optionA") {
            throw new Error("Coroutine failed with: " + result.value.value)
        } else {
            return optionA<Coroutine<State, Errored, Action>, Pair<Action, State>>()(result.value.value.second)
        }
    }
}


export let unsafeRunGetValue = <State, Errored, Action>(coroutine: Coroutine<State, Errored, Action>, state: State): Pair<Action, State> => {
    let result = unsafeRun(coroutine, state)
    if (result.kind == "optionA") {
        throw new Error("")
    } else {
        return result.value
    }
}