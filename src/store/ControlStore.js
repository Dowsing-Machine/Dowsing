import { defineStore } from 'pinia'

import { v4 as uuidv4 } from 'uuid';


export const ControlStore= defineStore({
    id: 'control',
    state: ()=>({
        currentViewId: null,
        groupId: null,
        Id:null,
        taskOn:true,
        poiOn:null,
        suggestionOn:true,
    }),
    getters:{
        uuid: state => {
            let id=localStorage.getItem("uuid");
            if(id){
                return id;
            }else{
                id=uuidv4();
                localStorage.setItem("uuid",id);
                return id;
            }
        }
    }
})