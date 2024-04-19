// @ts-check

import * as ort from 'onnxruntime-web'
import _ from 'lodash';
// import { watch, ref, getCurrentInstance, onBeforeUnmount, computed } from "vue";

// const { proxy } = getCurrentInstance();

const action2num = { 'user:update:x_encoding:time': 0, 'user:update:y_encoding:quantitative': 1, 'user:update:category_encoding:nominal': 2, 'user:update:filter:category_filter': 3, 'user:update:chart_type:point': 4, 'user:update:chart_type:line': 5, 'user:update:x_encoding:nominal': 6, 'user:update:chart_type:bar': 7, 'user:update:aggregate:y_aggregate': 8, 'user:update:filter:x_filter': 9, 'user:update:x_encoding:quantitative': 10, 'user:update:chart_type:tick': 11, 'user:specify:alternative encoding': 12, 'user:specify:same': 13, 'user:update:y_encoding:nominal': 14, 'user:specify:summary': 15, 'user:update:y_encoding:time': 16, 'user:update:category_encoding:quantitative': 17, 'user:update:category_encoding:time': 18, 'user:update:category_encoding:None': 19, 'user:update:filter:y_filter': 20, 'user:update:y_encoding:None': 21, 'user:update:chart_type:None': 22, 'user:update:aggregate:x_aggregate': 23, 'user:specify:collection': 24, 'user:reset:query': 25, 'user:control:undo': 26, 'user:update:aggregate:category_aggregate': 27, 'user:update:x_encoding:None': 28, 'user:specify:add field': 29 }
const num2action = _.invert(action2num)

const task2num = {
  '数据转换': 0,
  '关联': 1,
  '关联（趋势）': 2,
  '对比': 3,
  '确认': 4,
  '聚类': 5,
  '异常': 5
}

const num2task = _.invert(task2num)


const sessionPromise = ort.InferenceSession.create('/models/dowsing_fold0.onnx')


/**
 * 
 * @param {string} action 
 * @returns {number[]} 
 */
function toOneHot(action) {
  const actionNumber = action2num[action]
  const oneHot = Array(Object.keys(action2num).length + 1).fill(0)
  oneHot[actionNumber] = 1
  return oneHot
}

/**
 * 
 * @param {string[]} actions 
 * @returns {number[][]}
 */
function arrayToOneHot(actions) {
  return actions.map(action => toOneHot(action))
}

/**
 * 
 * @param {string[]} actions 
 * @returns {ort.Tensor}
 */
function actionArrayToTensor(actions) {
  const oneHot = arrayToOneHot(actions)
  const flatOneHotTensor = Float32Array.from(
    oneHot.reduce((acc, val) => acc.concat(val), []),
  )
  // console.log('Shape', [1, actions.length, Object.keys(action2num).length + 1])
  return new ort.Tensor('float32', flatOneHotTensor, [1, actions.length, Object.keys(action2num).length + 1])
}

/**
 * 
 * @param {string[]} actions 
 */
export async function predict(actions) {
  const encodingList = [
    ...Array(7).fill(num2action[0]),
    ...actions.filter(
      value => value.includes('encoding')
    )
  ].slice(-7)
  const typeList = [
    ...Array(2).fill(num2action[0]),
    ...actions.filter(
      value => value.includes('chart_type')
    )
  ].slice(-2)
  const aggregateList = [
    ...Array(2).fill(num2action[0]),
    ...actions.filter(
      value => value.includes('aggregate')
    )
  ].slice(-2)
  const otherList = [
    ...Array(4).fill(num2action[0]),
    ...actions.filter(
      value => !value.includes('encoding') && !value.includes('chart_type') && !value.includes('aggregate')
    )
  ].slice(-4)
  const actionList = [
    ...Array(15).fill(num2action[0]),
    ...actions,
  ].slice(-15)
  const tensor = actionArrayToTensor([
    ...encodingList,
    ...typeList,
    ...aggregateList,
    ...otherList,
    ...actionList
  ])
  const session = await sessionPromise
  const outputMap = await session.run({ 'onnx::Transpose_0': tensor })
  const outputData = outputMap['319'].data
  const value = _.toPairs(outputData).map(item => {
    const [type, score] = item;
    return {
      type: num2task[type],
      score: [score],
    };
  })
  return {
    value,
  }
}

// export function useTaskPrediction(){
//   proxy.$EventBus.on("*", function (type, e) {
//     console.log(type, e)
//   })
// }