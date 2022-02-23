# Forms

## Table of Contents
1. [Calculated Form Values](#calculated-form-values)
   1. [Examples](#examples)
2. [Auto-populate form fields](#how-to-auto-populate-form-fields-with-the-user-data)

## Calculated Form Values

If you would like a certain form field to have a calculated value based on the input from previous fields it could potentially require the use of some custom javascript code.

These calculations can be made by selected the field you wish to contain the calculated value and clicking on it's gear icon.
- Navigate to the **Data** tab at the top
- Scroll down to the **Calculated Value** section and click to expand
- This will show some general instructions on how to add calculations

![img.png](images/img.png)

## Examples

### Telework Calculated "Number of days teleworking in a week"

#### Calculate a value based on the number of boxes checked representing days of the week:

The following code snippet checks each checkbox contained within the `theEmployeesScheduleWillBe` field of the form and adds it to the value of this field if it has been checked.

```
value = Object.keys(data.theEmployeesTeleworkScheduleWillBe).reduce((acc, key) => {
if (data.theEmployeesTeleworkScheduleWillBe[key] === true) {
	acc++
}
return acc;
},0)
```

## How to auto-populate form fields with the user data

If you would like to automatically populate a form's field with the user's data, you can do so by adding one of the pre-defined names to a field in your form. Follow these steps to add the user's data to a field:

Step 1: Look at the pre-defined values along with their names in `/forms-flow-api/src/formsflow_api/models/employee_data.py` file. These values are available to all forms.<br>
Step 2: When creating forms, in the Form builder dialog for a component, under `API` tab, you can set the `Property Name` of a field. If you want this field to be pre-populated with the user data simply add one of the pre-defined names (found in the last step) as a `Property Name`.<br>
Step 3: If you want to use one piece of user data more than once in a form, you can append `_` to the property name of your field. For example, if you want to use the user's `name` second time in a form, you can set the `Property Name` of the field to be `name_2`.

![img-2.png](images/img-2.png)
