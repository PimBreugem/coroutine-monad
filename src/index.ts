import {IntermediateState, Fun, Pair} from "./fun"
import {Either, optionA, optionB} from "./either"

// Coroutine monadic definition
// The monadic definition of a coroutine. When used, the Coroutine takes a State (S) to perform
// the operation on, it will result in either a NoResult or a Pair with the result of Action (A)
// and a new state of (S).
type CoroutineMonadic<State, Errored, Action> = Fun<State, Either<NoResult<State, Errored, Action>, Pair<Action, State>>>

// Coroutine operations definitions
interface CoroutineOperations<State, Errored, Action> {
    Do: <State, Errored, Action>() => {  }
    RepeatUntil: <State, Errored>(condition: (_:State) => boolean) => Coroutine<State, Errored, IntermediateState>
    // Wait: <State, Errored, Action>() => {  }
    // Any: <State, Errored, Action>() => {  }
    // All: <State, Errored, Action>() => {  }
    // Parallel: <State, Errored, Action>() => {  }
    // Concurrent: <State, Errored, Action>() => {  }
}

// Export the Coroutine type, which is a combination* of monadic definition and behaviour from Operation
export type Coroutine<State, Errored, Action> = CoroutineMonadic<State, Errored, Action> & CoroutineOperations<State, Errored, Action>

// Type of No Result should either error or go ahead with the coroutine, but because of circularity this should be implemented in another way ToDO
type NoResult<State, Errored, Action> = Either<Errored, CoroutineMonadic<State, Errored, Action>>

interface CoroutineExcess<State, Errored, Action> extends Pair<State, Coroutine<State, Errored, Action>> {}

// Creates a coroutine type of the given coroutineMonadic definition
let Coroutine = <State, Errored, Action>(z: CoroutineMonadic<State, Errored, Action>): Coroutine<State, Errored, Action> => {
    return {
        ...z,
        Do: function<State, Errored, Action>(): {} {
            return {};
        },
        RepeatUntil: function<State, Errored, Action>(this: Coroutine<State, Errored, Action>, condition: (_:State) => boolean): Coroutine<State, Errored, IntermediateState>{
            return RepeatUntil(condition, this)
        }

    }
}

let succes = <State, Errored, Action>(action: Action): Coroutine<State, Errored, Action> =>
    Coroutine(Fun(state => optionB<NoResult<State, Errored, Action>, Pair<Action, State>>()
    (Pair<Action, State>(action, state))))

let failed = <State, Errored, Action>(error: Errored): Coroutine<State, Errored, Action> =>
    Coroutine(Fun(state => optionA<NoResult<State, Errored, Action>, Pair<Action, State>>()
    (optionA<Errored, Coroutine<State, Errored, Action>>() //Maybe CoroutineExcess
    (error))))


let bind_Corotine = <State, Errored, Action1, Action2>(function: Fun<Action1, Coroutine<State, Errored , Action2>>): Fun<Coroutine<State, Errored, Action1>, Coroutine<State, Errored, Action2>> =>



// declaration of repeat until function
let RepeatUntil = <State, Errored, Action>(condition: (_:State) => boolean, action: Coroutine<State, Errored, Action>): Coroutine<State, Errored, IntermediateState> =>
    Coroutine(Fun(state => (action(state) ? succes<State, Errored, IntermediateState>({})  : action.bind(() => RepeatUntil(condition, action))).state()))
    //bind should have his own operation in the coroutine interface


