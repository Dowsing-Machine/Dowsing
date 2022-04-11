import _ from "lodash"
import createStack from './utils/undo_stacker';
import { isProxy, toRaw, watch, effectScope } from "vue-demi";

const scope = effectScope();

export function Undo({ store, options }) {
    if (!options.undoOption) return;
    const { undoOption } = options;
    if(!undoOption.enabled) return;

    const cloneState=undoOption.clone||_.cloneDeep;
    const diff=undoOption.diff||_.constant(true);

    const stack = createStack(cloneState(store.$state));
    let preventUpdateOnSubscribe = false;
    store.undo = () => {
        preventUpdateOnSubscribe = true;
        let undo = stack.undo();
        console.log("undo", undo);
        store.$patch(cloneState(undo));
    }
    store.redo = () => {
        preventUpdateOnSubscribe = true;
        store.$patch(cloneState(stack.redo()));
    }
    scope.run(() => {
        watch(store.$state, (state) => {

            const prevState=stack.top();
            if (preventUpdateOnSubscribe) {
                preventUpdateOnSubscribe = false;
                return;
            }
            if(!diff(state,prevState)){
                return;
            }
            console.log("state changed", state.collections, prevState.collections);
            state = cloneState(state);
            stack.push(state);
        })
    }
    )
}
