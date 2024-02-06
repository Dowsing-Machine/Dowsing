import { csvParse, tsvParse, autoType } from "d3-dsv";
import _ from "lodash";

const DatasetTypes = {
  JSON: "json",
  CSV: "csv",
  TSV: "tsv",
};

function fileType(content) {
  try {
    JSON.parse(content);
    return DatasetTypes.JSON;
  } catch (e) {
    const CSVPattern = /^[^,]+(,[^,]+)*$/;
    if (CSVPattern.test(content)) {
      return DatasetTypes.CSV;
    } else {
      return DatasetTypes.TSV;
    }
  }
}

export function parseFile(str) {
  // console.log(dsv, fileType(str));
  const type = fileType(str);
  switch (type) {
    case DatasetTypes.JSON:
      return JSON.parse(str);
    case DatasetTypes.CSV:
      return csvParse(str, autoType);
    case DatasetTypes.TSV:
      return tsvParse(str, autoType);
    default:
      return null;
  }
}

function columnType(colData) {
  let unique = _.uniq(colData).sort();
  let numbersCount = _(colData).map(_.isNumber).sum();
  let numberRatio = numbersCount / colData.length;
  let uniqueRatio = unique.length / colData.length;
  if (numberRatio > 0.9 && uniqueRatio > 0.1) {
    return "quantitative";
  } else {
    return "nominal";
  }
}

export function getMeta(dataJSON) {
  const columns = _.keys(dataJSON[0]);
  const res = {};
  for(const col of columns){
    const colData = _.map(dataJSON, col);
    if (columnType(colData) === "quantitative") {
      res[col] = "quantitative";
    } else {
      res[col] = "nominal";
    }
  }
  return res;
}