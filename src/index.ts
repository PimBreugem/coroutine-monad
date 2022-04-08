import {IntermediateState, Fun, Pair, Pair_map, identifier} from "./fun"
import {Either, optionA, optionB} from "./either"

// Coroutine monadic definition
// The monadic definition of a coroutine. When used, the Coroutine takes a State (S) to perform
// the operation on, it will result in either a NoResult or a Pair with the result of Action (A)
// and a new state of (S).
type CoroutineMonadic<State, Errored, Action> = Fun<State, Either<NoResult<State, Errored, Action>, Pair<Action, State>>>

// Coroutine operations definitions
interface CoroutineOperations<State, Errored, Action1> {
    map: <State, Errored, Action1, Action2>(f: (_: Action1) => Action2) => Coroutine<State, Errored, Action2>
    bind: <Action2>(f: (_: Action1) => Coroutine<State, Errored, Action2>) => Coroutine<State, Errored, Action2>
    // Do: <State, Errored, Action>() => {  }
    RepeatUntil: <State, Errored>(condition: (_: State) => boolean) => Coroutine<State, Errored, IntermediateState>
    // Wait: <State, Errored, Action>() => {  }
    // Any: <State, Errored, Action>() => {  }
    // All: <State, Errored, Action>() => {  }
    // Parallel: <State, Errored, Action>() => {  }
    // Concurrent: <State, Errored, Action>() => {  }
}

// Export the Coroutine type, which is a combination* of monadic definition and behaviour from Operation
// CoroutineMonadic<State, Errored, Action> &
export type Coroutine<State, Errored, Action> =
    CoroutineMonadic<State, Errored, Action>
    & CoroutineOperations<State, Errored, Action>

// Type of No Result should either error or go ahead with the coroutine
type NoResult<State, Errored, Action> = Either<Errored, CoroutineExcess<State, Errored, Action>>

interface CoroutineExcess<State, Errored, Action> extends Pair<State, Coroutine<State, Errored, Action>> {
}

// Creates a coroutine type of the given coroutineMonadic definition
let Coroutine = <State, Errored, Action1>(z: CoroutineMonadic<State, Errored, Action1>): Coroutine<State, Errored, Action1> => {
    let cm = z as Coroutine<State, Errored, Action1>
    cm.map = function <State, Errored, Action1, Action2>(this: Coroutine<State, Errored, Action1>, f: (_: Action1) => Action2): Coroutine<State, Errored, Action2> {
        return Coroutine_map<State, Errored, Action1, Action2>(Fun(a => f(a)))(this)
    }
    cm.bind = function <Action2>(this: Coroutine<State, Errored, Action1>, f: (_: Action1) => Coroutine<State, Errored, Action2>): Coroutine<State, Errored, Action2> {
        return Coroutine_bind<State, Errored, Action1, Action2>(Fun(a => f(a)))(this)
    }
    cm.RepeatUntil = function <State, Errored, Action1>(this: Coroutine<State, Errored, Action1>, condition: (_: State) => boolean): Coroutine<State, Errored, IntermediateState> {
        return RepeatUntil(condition, this)
    }
    return cm
}
//     return {
//         ...z as Coroutine<State, Errored, Action1>,
//         map: function<State, Errored, Action1, Action2>(this: Coroutine<State, Errored, Action1>, f: (_:Action1) => Action2): Coroutine<State, Errored, Action2>{
//             return Coroutine_map<State, Errored, Action1, Action2>(Fun(a => f(a)))(this)
//         },
//         bind: function<Action2>(this: Coroutine<State, Errored, Action1>, f: (_ : Action1) => Coroutine<State, Errored, Action2>): Coroutine<State, Errored, Action2>{
//             return Coroutine_bind<State, Errored, Action1, Action2>(Fun(a => f(a)))(this)
//         },
//         repeatUntil: function<State, Errored, Action1>(this: Coroutine<State, Errored, Action1>, condition: (_ : State) => boolean): Coroutine<State, Errored, IntermediateState> {
//             return repeatUntil(condition, this)
//         }
//     }
// }

// Coroutine mapping, either computation is complete, coroutine has excess or the computation errored.
let Coroutine_map = <State, Errored, Action1, Action2>(f: Fun<Action1, Action2>): Fun<Coroutine<State, Errored, Action1>, Coroutine<State, Errored, Action2>> =>
    Fun(co => Coroutine(Fun(state => {
        let actionState: Either<NoResult<State, Errored, Action1>, Pair<Action1, State>> = co(state)

        if (actionState.kind == "optionA") {
            // compute the coroutine to find the current state (continued, failed, or succeed)
            let failedOrCoroutineExcess: NoResult<State, Errored, Action1> = actionState.value

            // Check if the coroutine had excess, has failed, or if it has a result.
            if (failedOrCoroutineExcess.kind == "optionA") {
                return optionA<Errored, CoroutineExcess<State, Errored, Action2>>()
                    .then(optionA<NoResult<State, Errored, Action2>, Pair<Action2, State>>())
                    (failedOrCoroutineExcess.value)

            } else {
                // Excess code
                return Pair_map(identifier<State>(), Coroutine_map<State, Errored, Action1, Action2>(f))
                    .then(optionB<Errored, CoroutineExcess<State, Errored, Action2>>())
                    .then(optionA<NoResult<State, Errored, Action2>, Pair<Action2, State>>())
                    (failedOrCoroutineExcess.value)
            }
        } else {
            // Final computed value
            return Pair_map(f, identifier<State>())
                .then(optionB<NoResult<State, Errored, Action2>, Pair<Action2, State>>())
                (actionState.value)
        }
    })))

// Coroutine joining, 'flattens' a nested Coroutine
let Coroutine_join = <State, Errored, Action>(): Fun<Coroutine<State, Errored, Coroutine<State, Errored, Action>>, Coroutine<State, Errored, Action>> =>
    Fun(nested => Coroutine<State, Errored, Action>(Fun(state => {
        let actionState: Either<NoResult<State, Errored, Coroutine<State, Errored, Action>>, Pair<Coroutine<State, Errored, Action>, State>> = nested(state)

        if (actionState.kind == "optionA") {
            let failedOrCoroutineExcess: NoResult<State, Errored, Coroutine<State, Errored, Action>> = actionState.value

            if (failedOrCoroutineExcess.kind == "optionA") {
                return optionA<Errored, CoroutineExcess<State, Errored, Action>>()
                    .then(optionA<NoResult<State, Errored, Action>, Pair<Action, State>>())
                    (failedOrCoroutineExcess.value)
            } else {
                return Pair_map(identifier<State>(), Coroutine_join<State, Errored, Action>())
                    .then(optionB<Errored, CoroutineExcess<State, Errored, Action>>())
                    .then(optionA<NoResult<State, Errored, Action>, Pair<Action, State>>())
                    (failedOrCoroutineExcess.value)
            }
        } else {
            // Successfully computed a result
            let computedValue: Pair<Coroutine<State, Errored, Action>, State> = actionState.value
            let next: Coroutine<State, Errored, Action> = computedValue.first
            let stateOfCoroutine: State = computedValue.second
            return next(stateOfCoroutine)
        }
    })))

let Coroutine_bind = <State, Errored, Action1, Action2>(f: Fun<Action1, Coroutine<State, Errored, Action2>>): Fun<Coroutine<State, Errored, Action1>, Coroutine<State, Errored, Action2>> =>
    Coroutine_map<State, Errored, Action1, Coroutine<State, Errored, Action2>>(f).then(Coroutine_join())

export let succeed = <State, Errored, Action>(action: Action): Coroutine<State, Errored, Action> =>
    Coroutine(Fun(state => optionB<NoResult<State, Errored, Action>, Pair<Action, State>>()
    (Pair<Action, State>(action, state))))

export let suspended = <State, Errored>(): Coroutine<State, Errored, IntermediateState> =>
    Coroutine(Fun(state => optionA<NoResult<State, Errored, IntermediateState>, Pair<IntermediateState, State>>()
    (optionB<Errored, CoroutineExcess<State, Errored, IntermediateState>>()
    ({first: state, second: succeed<State, Errored, IntermediateState>(({}))}))))

export let failed = <State, Errored, Action>(error: Errored): Coroutine<State, Errored, Action> =>
    Coroutine(Fun(state => optionA<NoResult<State, Errored, Action>, Pair<Action, State>>()
    (optionA<Errored, CoroutineExcess<State, Errored, Action>>()
    (error))))

//let continued = {}

// declaration of repeat until function
export let RepeatUntil = <State, Errored, Action>(condition: (_: State) => boolean, action: Coroutine<State, Errored, Action>): Coroutine<State, Errored, IntermediateState> =>
    Coroutine(Fun(state => (condition(state) ? succeed<State, Errored, IntermediateState>({}) : action.bind(() => RepeatUntil(condition, action)))(state)))
//bind should have his own operation in the coroutine interface

// Look at the effects of a state
export let effect = <Errored, Action>(f: (_: IntermediateState) => Action): Coroutine<IntermediateState, Errored, Action> =>
    compute<IntermediateState, Errored, Action>(s => f({}))

// Compute, do something with the objects state but dont change it
export let compute = <State, Errored, Action>(f: (_: State) => Action): Coroutine<State, Errored, Action> =>
    Coroutine(Fun(state => {
        try {
            return optionB<NoResult<State, Errored, Action>, Pair<Action, State>>()(Pair<Action, State>(f(state), state))
        } catch (e) {
            return optionA<NoResult<State, Errored, Action>, Pair<Action, State>>()(optionA<Errored, CoroutineExcess<State, Errored, Action>>()(e))
        }
    }))

// Do, change the objects state
export let Do = <State, Errored>(f: (_: State) => State): Coroutine<State, Errored, State> =>
    Coroutine(Fun(state => {
        try {
            console.log(state)
            let newState = f(state)
            return optionB<NoResult<State, Errored, State>, Pair<State, State>>()(Pair<State, State>(newState, newState))
        } catch (e) {
            return optionA<NoResult<State, Errored, State>, Pair<State, State>>()(optionA<Errored, CoroutineExcess<State, Errored, State>>()(e))
        }
    }))

export let Wait = <State>(ticks: number): Coroutine<State, IntermediateState, IntermediateState> =>
    ticks <= 0 ? succeed<State, IntermediateState, IntermediateState>({}) : suspended<State, IntermediateState>().bind<IntermediateState>(() => Wait<State>(ticks--))
