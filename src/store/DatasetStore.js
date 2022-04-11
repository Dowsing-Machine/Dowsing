import { defineStore } from 'pinia'

import * as cql from "compassql";
// const cql=require('compassql');

// import CarJSON from '@/assets/carjson.json'
import _ from 'lodash'
import axios from 'axios'
// import http from "@/utils/http";
import META from "./meta.json";

export const DatasetStore=defineStore({
    id:"DatasetStore",
    state:function(){return {
        dataset:[],
        userDefinedColType:{},
        name:"",
    }},
    getters:{
        columns:state=>{
            if(state.dataset.length>0){
                const columns = _.keys(state.dataset[0])
                const res=[];
                for(let col of columns){
                    let colData = _.map(state.dataset,col);
                    let unique = _.uniq(colData).sort();
                    let numbersCount = _(colData).map(_.isNumber).sum();
                    let numberRatio = numbersCount/colData.length;
                    let uniqueRatio = unique.length/colData.length;
                    // console.log(numberRatio,uniqueRatio);
                    let temp={
                        name:col,
                        min: _(colData).map(_.toNumber).filter(item => !isNaN(item) && _.isNumber(item)).min(),
                        max: _(colData).map(_.toNumber).filter(item => !isNaN(item) && _.isNumber(item)).max(),
                        unique,
                    };
                    if(state.userDefinedColType[col]!=null){
                        // res.push({
                        //     name:col,
                        //     type:state.userDefinedColType[col],
                        //     min: _(colData).map(_.toNumber).filter(item=>!isNaN(item)&&_.isNumber(item)).min(),
                        //     max: _(colData).map(_.toNumber).filter(item => !isNaN(item) && _.isNumber(item)).max(),
                        //     unique,
                        // })
                        temp.type=state.userDefinedColType[col];
                    }
                    else if(numberRatio>0.9 && uniqueRatio>0.1){
                        // res.push({
                        //     name:col,
                        //     type:"quantitative",
                        //     min: _(colData).filter(_.isNumber).min(),
                        //     max: _(colData).filter(_.isNumber).max(),
                        //     unique,
                        // });
                        temp.type="quantitative";
                    }
                    else{
                        // res.push({
                        //     name:col,
                        //     type:"nominal",
                        //     min: _(colData).filter(_.isNumber).min(),
                        //     max: _(colData).filter(_.isNumber).max(),
                        //     unique,
                        // });
                        temp.type="nominal";
                    }
                    res.push(temp);
                }
                return res;
            }
            else{
                return []
            }
        },
        schema:state=>{
            return cql.schema.build(state.columns);
        },
        asp:state=>{

        }
    },
    actions:{
        defineColType(col,type){
            this.userDefinedColType[col]=type;
        },
        clearDefinedColType(){
            this.userDefinedColType={};
        },
        async loadDataset(url){
            // const response=await http.get(url);
            const response = await axios.get(url);

            // console.log(response.data);
            this.dataset=response.data;
            const dataset_name=url.split("/").pop();
            const dataset_meta = META.find(meta => meta.name == dataset_name);
            console.log(url,dataset_name,dataset_meta);
            this.name=dataset_name;
            if(dataset_meta){
                this.userDefinedColType=dataset_meta.columns;
            }
            else{
                this.userDefinedColType={};
            }
        }
    }
})
