# Forms

## Table of Contents
1. [Calculated Form Values](#calculated-form-values)
   1. [Examples](#examples)
2. [Auto-populate form fields](#how-to-auto-populate-form-fields-with-the-user-data)
3. [Uploading a form](#uploading-a-form
)

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

Step 1: Look at the pre-defined values along with their names in table below or from `/forms-flow-api/src/formsflow_api/models/employee_data.py` file. These values are available to all forms.

Step 2: When creating forms, in the Form builder dialog for a component, under `API` tab, you can set the `Property Name` of a field. If you want this field to be pre-populated with the user data simply add one of the pre-defined names (found in the last step) as a `Property Name`.

Step 3: If you want to use one piece of user data more than once in a form, you can append `_` to the property name of your field. For example, if you want to use the user's `name` second time in a form, you can set the `Property Name` of the field to be `name_2`.

| Property Name            | Description |
| ------------------------ | ----------- |
| `name`                     | first and last name of employee as retuned from ODS|
| `firstName`                | first name of employee|
| `lastName`                 | last name of employee|
| `displayName`              | A calculated value based on `firstName` + `lastName` of employee|
| `email`                    | email of employee|
| `address1`                 | home address1 of employee|
| `address2`                 | home address2 of employee|
| `officePhone`              | office phone of employee|
| `empId`                    | employee id of employee|
| `positionTitle`            | position title of employee|
| `depId`                    | department id of employee|
| `officeAddress1`           | office address1 of employee|
| `officeAddress2`           | office address2 of employee|
| `officeCity`               | office city of employee|
| `officeCountry`            | office country of employee|
| `officePostal`             | office postal code of employee|
| `officeStateprovince`      | office state or province of employee|
| `organization`             | organization of employee|
| `supervisorName`           | name of employee's supervisor|
| `supervisorEmail`          | email of employee's supervisor|
| `supervisorPositionTitle`  | position title of employee's supervisor|

![img-2.png](images/img-2.png)

## Uploading a form
### Migrating a form to a new environement
  1. For this work, you need a `designer` role in the two environments.
  2. In the first environment you are migrating the form from, download the form by finding the form in the list of forms and clicking `Download Form`. The form will be saved in `JSON` format on your computer.
  3. Go to the target environment:
   - If there is no previous version of that form in the target environment, you only need to upload the downloaded form on the `Forms` page through the `Upload Form` button.
   - If there is a previous version of that form in the target environment, you need first delete the previous version of the form and then upload the downloaded form. Please backup the previous version of the form before deleting it by downloading and saving it to your computer.
  4. Add the necessary workflow and then publish the form if that is the desired behaviour. 

### Creating a duplicate form
 1. For this work you need a `designer` role.
 2. Download the form you want to duplicate and save it to your computer. The form will be saved in `JSON` format on your computer.
 3. Open the `JSON` file (in a text editor or an online text editor compatible with `JSON` format) and change the following fields. For example, if the form you're duplicating is called `Telework` then change the following fields and save the file:
   - `title`: change it to something else like `Telework-test-1`.
   - `name`: change it to something else like `Telework-test-1`.
   - `path`: change it to something else like `Telework-test-1`.
4. Upload the file to the `Forms` page through the `Upload Form` button. You the will see the new form along with the old form in the list of forms. 
5. Add the necessary workflow and then publish the form if that is the desired behaviour. You can assign the same workflow to the duplicated form or assign a different workflow.