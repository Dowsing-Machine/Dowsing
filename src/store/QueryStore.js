import _ from "lodash";
import { defineStore } from "pinia";

const initState = () => ({
    x_encoding: null,
    x_aggregate: null,
    // x_filter: null,
    // x_bin:false,
    y_encoding: null,
    // y_bin:false,
    y_aggregate: null,
    // y_fillter: null,
    category_encoding: null,
    category_aggregate: null,
    // category_filter: null,
    chart_type: null,
    filter: [] //[{filter:"...condiation",column:"...field",predicate:"range|oneOf"}]
})

export function spec2query(spec = {}) {
    const state = initState();
    if (spec.mark) {
        state.chart_type = spec.mark;
    }
    if (spec.encoding) {
        const enc = spec.encoding;
        if (enc.x) {
            state.x_encoding = enc.x.field;
            if (enc.x.aggregate) {
                if (enc.x.aggregate != "count")
                    state.x_aggregate = enc.x.aggregate;
                else state.x_encoding = "COUNT"

            } else if (enc.x.bin)
                state.x_aggregate = "bin"

        }
        if (enc.y) {
            state.y_encoding = enc.y.field;
            if (enc.y.aggregate) {
                if (enc.y.aggregate != "count")
                    state.y_aggregate = enc.y.aggregate;
                else state.y_encoding = "COUNT"
            } else if (enc.y.bin)
                state.y_aggregate = "bin"
        }
        if (enc.color) {
            const color = enc.color.condiction ?? enc.color;
            state.category_encoding = color?.field;
            if (color?.aggregate) {
                if (color?.aggregate != "count")
                    state.category_aggregate = color?.aggregate;
                else state.category_encoding = "COUNT"
            } else if (color?.bin)
                state.category_aggregate = "bin"
        }
    }
    if (spec.transform) {
        state.filter = spec.transform.map(t => {
            if (t.filter.oneOf != null) {
                return {
                    filter: t.filter.oneOf,
                    column: t.filter.field,
                    predicate: "oneOf",
                }
            }
            if (t.filter.range != null) {
                return {
                    filter: t.filter.range,
                    column: t.filter.field,
                    predicate: "range",
                }
            }
        });
    }
    return state;

}

export const QueryStore = defineStore({
    id: "QueryStore",
    // undoOption: {
    //     enabled: true,
    //     clone: (state)=>{
    //         let clone = _.clone(state);
    //         clone.filter=state.filter.map(f=>_.clone(f));
    //         return clone;
    //     },
    //     diff:function(state,prevState){
    //         return !_.isEqual(state,prevState);
    //     }
    // },
    state: initState,
    getters: {
        isSpecAggregate: state => {
            return state.x_aggregate && state.y_aggregate;
        },
        hasOpenPosition: state => {
            return !state.x_encoding || !state.y_encoding;
        },
        hasStyleChannel: state => {
            return !state.color_encoding;
        },
        hasSpecView: state => {
            return !(state.x_encoding == null && state.y_encoding == null && state.category_encoding == null);
        },
        getFilterByColumn(state) {
            return (column) => {
                const filter = state.filter.find(f => f && (f.column == column));
                if (filter) {
                    return filter;
                } else {
                    return null;
                }
            }
        },
        spec(state) {
            return {
                mark: state.chart_type,
                encoding: {
                    x: {
                        field: state.x_encoding,
                        aggregate: state.x_aggregate
                    },
                    y: {
                        field: state.y_encoding,
                        aggregate: state.y_aggregate
                    },
                    color: {
                        field: state.category_encoding,
                        aggregate: state.category_aggregate
                    }
                }
            }
        }
    },
    actions: {
        setFilterByColumn(column, filter) {
            console.log("setFilterByColumn", column, filter);
            const existFilter = this.filter.find(f => f && (f.column == column));
            if (existFilter) {
                existFilter.filter = filter.filter;
            } else {
                this.filter.push(filter);
            }
        },
        deleteFilterByColumn(column) {
            this.filter = this.filter.filter(f => f.column != column);
        },
        refreshFilter() {
            this.filter = this.filter.filter(
                f => f && _.find(
                    [this.x_encoding, this.y_encoding, this.category_encoding],
                    c => c == f.column
                )
            );
        },
        editEncoding(channel, encoding) {
            this.$patch(() => {
                this[channel] = encoding;
                this.refreshFilter();
                if (channel == "x_encoding") {
                    this.x_aggregate = null;
                } else if (channel == "y_encoding") {
                    this.y_aggregate = null;
                } else if (channel == "category_encoding") {
                    this.category_aggregate = null;
                }
            })
        }
    }
});