import {IntermediateState, Fun, Pair} from "./fun"
import {Either} from "./either"

// Coroutine monadic definition
// The monadic definition of a coroutine. When used, the Coroutine takes a State (S) to perform
// the operation on, it will result in either a NoResult or a Pair with the result of Action (A)
// and a new state of (S).
type CoroutineMonadic<State, Errored, Action> = Fun<State, Either<NoResult<State, Errored, Action>, Pair<Action, State>>>

// Coroutine operations definitions
interface CoroutineOperations<State, Errored, Action> {
    Do: <State, Errored, Action>() => {  }
    RepeatUntil: <State, Errored>(condition: (_:State) => boolean) => Coroutine<State, Errored, IntermediateState>
    Wait: <State, Errored, Action>() => {  }
    Any: <State, Errored, Action>() => {  }
    All: <State, Errored, Action>() => {  }
    Parallel: <State, Errored, Action>() => {  }
    Concurrent: <State, Errored, Action>() => {  }
}

// Export the Coroutine type, which is a combination* of monadic definition and behaviour from Operation
export type Coroutine<State, Errored, Action> = CoroutineMonadic<State, Errored, Action> & CoroutineOperations<State, Errored, Action>

// Type of No Result should either error or go ahead with the coroutine, but because of circularity this should be implemented in another way ToDO
type NoResult<State, Errored, Action> = Either<Errored, CoroutineN<State, Errored, Action>>