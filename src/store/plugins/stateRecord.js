import _ from "lodash";
import { watch, effectScope } from "vue-demi";

const scope = effectScope();
const storeOpts = {};
const mutationRecords = [];
let index = 0;

export function StateRecord({ store, options }) {
    if (!options.recordOption) return;
    if (!options.recordOption.enabled) return;

    const {
        clone = _.cloneDeep,
        diff = _.constant(true),
    } = options.recordOption;
    const { id } = options;
    storeOpts[id] = {
        clone,
        diff,
        store
    };

    function push(id, state) {
        mutationRecords.length = index;
        mutationRecords[index++] = {
            id,
            state: clone(state),
        };
    }

    scope.run(() => {
        watch(store, (state, prevState) => {
            if(stop) {
                stop=false;
                return;
            }
            state=clone(state);
            prevState=clone(prevState);
            if (diff(state, prevState)) {
                push(id, state);
            }
        })
    });
}

let stop=false;

export function getMutationRecords() {
    return mutationRecords;
}

export function setMutationRecords(records) {
    // mutationRecords = records;
}

export function stepBack() {
    stop=true;
    if(index>1) index-=1;
    let { id, state } = mutationRecords[index-1];
    state=storeOpts[id].clone(state);
    console.log(state,mutationRecords);
    storeOpts[id].store.$patch(state);
}

export function stepForward() {
    stop=true;
    if(index<mutationRecords.length) index+=1;
    let { id, state } = mutationRecords[index-1];
    state=storeOpts[id].clone(state);
    storeOpts[id].store.$patch(state);
}

export function debug(){
    console.log(mutationRecords);
}