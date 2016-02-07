import Promise from "bluebird";
import excelWithCallback from "excel";

export default Promise.promisify(excelWithCallback);