import {IntermediateState, Fun, Pair, Pair_map, identifier} from "./fun"
import {Either, optionA, optionB} from "./either"

// Coroutine monadic definition
// The monadic definition of a coroutine. When used, the Coroutine takes a State (S) to perform
// the operation on, it will result in either a NoResult or a Pair with the result of Action (A)
// and a new state of (S).
type CoroutineMonadic<State, Errored, Action> = Fun<State, Either<NoResult<State, Errored, Action>, Pair<Action, State>>>

// Coroutine operations definitions
interface CoroutineOperations<State, Errored, Action> {
    map: <State, Errored, Action1, Action2>(fun: (_: Action1) => Action2) => Coroutine<State, Errored, Action2>
    //Do: <State, Errored, Action>() => {  }
    RepeatUntil: <State, Errored>(condition: (_:State) => boolean) => Coroutine<State, Errored, IntermediateState>
    // Wait: <State, Errored, Action>() => {  }
    // Any: <State, Errored, Action>() => {  }
    // All: <State, Errored, Action>() => {  }
    // Parallel: <State, Errored, Action>() => {  }
    // Concurrent: <State, Errored, Action>() => {  }
}

// Export the Coroutine type, which is a combination* of monadic definition and behaviour from Operation
// CoroutineMonadic<State, Errored, Action> &
export type Coroutine<State, Errored, Action> = CoroutineMonadic<State, Errored, Action> & CoroutineOperations<State, Errored, Action>

// Type of No Result should either error or go ahead with the coroutine
type NoResult<State, Errored, Action> = Either<Errored, CoroutineExcess<State, Errored, Action>>

interface CoroutineExcess<State, Errored, Action> extends Pair<State, Coroutine<State, Errored, Action>> { }

// Creates a coroutine type of the given coroutineMonadic definition
let Coroutine = <State, Errored, Action>(z: CoroutineMonadic<State, Errored, Action>): Coroutine<State, Errored, Action> => {
    return {
        ...z,
        map: function<State, Errored, Action1, Action2>(this: Coroutine<State, Errored, Action1>, fun: (_:Action1) => Action2): Coroutine<State, Errored, Action2>{
            return Coroutine_map<State, Errored, Action1, Action2>(Fun(x => fun(x)))(this)
        },
        RepeatUntil: function<State, Errored, Action>(this: Coroutine<State, Errored, Action>, condition: (_:State) => boolean): Coroutine<State, Errored, IntermediateState>{
            return RepeatUntil(condition, this)
        }
    }
}

// Coroutine mapping, either computation is complete, coroutine has excess or the computation errored.
export let Coroutine_map = <State, Errored, Action1, Action2>(fun: Fun<Action1, Action2>): Fun<Coroutine<State, Errored, Action1>, Coroutine<State, Errored, Action2>> =>

    Fun(c1 => Coroutine(Fun(state => {
        // computate the coroutine to find the current state (continued, failed, or succes)
        let actionState: Either<NoResult<State, Errored, Action1>, Pair<Action1, State>> = c1(state)

        // Check if the coroutine had excess, has failed, or if it has an result.
        if(actionState.kind == "optionA") {
            let failedOrContinue: NoResult<State, Errored, Action1> = actionState.value

            // Coroutine or excess code had failed, check wich one
            if (failedOrContinue.kind == "optionA"){
                return optionA<Errored, CoroutineExcess<State, Errored, Action2>>()
                    .then(optionA<NoResult<State, Errored, Action2, Pair<Action2, State>>())
                    (failedOrContinue.value)
            } else {
                // When the is excess code
                return Pair_map(identifier<State>(), Coroutine_map<State, Errored, Action1, Action2>(fun))
                    .then(optionB<Errored, CoroutineExcess<State, Errored, Action2>>())
                    .then(optionA<NoResult<State, Errored, Action2>, Pair<Action2, State>>())
                    (failedOrContinue.value)
            }
        } else {
            return Pair_map(fun, identifier<State>())
                .then(optionB<NoResult<State, Errored, Action2>, Pair<Action2, State>>())
                (actionState.value)
        }
})))

let succes = <State, Errored, Action>(action: Action): Coroutine<State, Errored, Action> =>
    Coroutine(Fun(state => optionB<NoResult<State, Errored, Action>, Pair<Action, State>>()
    (Pair<Action, State>(action, state))))

let failed = <State, Errored, Action>(error: Errored): Coroutine<State, Errored, Action> =>
    Coroutine(Fun(state => optionA<NoResult<State, Errored, Action>, Pair<Action, State>>()
    (optionA<Errored, Coroutine<State, Errored, Action>>() //Maybe CoroutineExcess
    (error))))

let continued = {}

// // declaration of repeat until function
// let RepeatUntil = <State, Errored, Action>(condition: (_:State) => boolean, action: Coroutine<State, Errored, Action>): Coroutine<State, Errored, IntermediateState> =>
//     Coroutine(Fun(state => (action(state) ? succes<State, Errored, IntermediateState>({})  : action.bind(() => RepeatUntil(condition, action))).state()))
//     //bind should have his own operation in the coroutine interface




