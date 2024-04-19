import { TaskStore } from "../store/TaskStore";

let taskStore = null;
const history = [];
export default {
    install: (app, opts)=>{
        if (taskStore == null) taskStore = TaskStore();
        const eb = app.config.globalProperties.$EventBus;
        eb.on("*", function (type, e) {
            console.log("plugin",type);
            history.push(type);
            taskStore.getPredictsNew(history);
            // taskStore.getPredicts(type);
        });
    }
}
