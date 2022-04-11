import { defineStore } from "pinia";
// import axios from "axios";
import _ from "lodash";



export const POIStore = defineStore({
    id: "POIStore",
    state: () => {
        // const column = [];

        return {
            column: [],

            // i:0
        };
    },
    actions: {
        updateColumn(col) {
            let newc = _.cloneDeep(this.column);

            if (col == "COUNT") return;

            let flag = 0;
            for (let i = 0; i < newc.length; i++) {
                if (newc[i].col == col) {
                    flag = 1;
                    newc[i].cnt++;
                    break
                }
            }
            console.log(flag)
            if (flag == 0)
                newc.push({ "col": col, "cnt": 1 });
            this.column = newc;
        }

    }


});