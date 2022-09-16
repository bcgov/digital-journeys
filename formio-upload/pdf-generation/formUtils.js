/*
* A recursively lookup in all form components and set the target value
* for the target property with the specified key
*/
function setValueForEveryComponentByKey({
  components,
  targetKey,
  targetValue,
}) {
  const fnd = (obj) => {
    if (!obj || Object.entries(obj).length === 0) {
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (k === targetKey && v !== null) {
        obj[k] = targetValue;
      }
      if (typeof v === "object") {
        fnd(v);
      }
    }
  };
  fnd(components);
}

module.exports = {
  setValueForEveryComponentByKey,
};
