import { Formio } from 'react-formio';

const FieldsetComponent = Formio.Components.components.fieldset;

/**
 * Create a Header component and extend from the HTMLComponent.
 */
export default class MindYourMannersComponent extends FieldsetComponent {
  /**
   * Define the default schema to change the type and tag and label. 
   */
  static schema(...extend) {
    
    return super.schema({
      label: 'Header',
     "components": [
    
          {
            "label": "[Field label here]",
            "autoExpand": false,
            "tableView": true,
            "validate": {
              "custom": "valid = ( MindYourManners.errors[\"<FIELD_ID>\"] || true )",
              "maxLength": 1000
            },
            "key": "<FIELD_ID>",
            "logic": [
              {
                "name": "Sanitize user input",
                "trigger": {
                  "type": "event",
                  "event": "change"
                },
                "actions": [
                  {
                    "name": "Sanitize",
                    "type": "customAction",
                    "customAction": "const streaming = true;\n\nMindYourManners.sanitise(streaming, instance, input, {maxLength: 1000}, ...arguments);\n\nreturn value;\n"
                  }
                ]
              }
            ],
            "type": "textarea",
            "input": true
          },
          {
            "hidden": true,
            "key": "fieldSet3",
            "customConditional": "show = MindYourManners.isVisible(\"<FIELD_ID>\");",
            "type": "fieldset",
            "label": "Field Set",
            "input": false,
            "tableView": false,
            "components": [
              {
                "label": "HTML",
                "attrs": [
                  {
                    "attr": "",
                    "value": ""
                  }
                ],
                "content": "{{ MindYourManners.getResponseValue(\"<FIELD_ID>\") }}",
                "refreshOnChange": true,
                "key": "html",
                "type": "htmlelement",
                "input": false,
                "tableView": false
              },
              {
                "label": "Columns",
                "columns": [
                  {
                    "components": [
                      {
                        "label": "Accept",
                        "action": "custom",
                        "showValidations": false,
                        "theme": "info",
                        "size": "sm",
                        "hidden": true,
                        "tableView": false,
                        "key": "submit3",
                        "conditional": {
                          "show": true,
                          "when": "suggestedTextInput"
                        },
                        "customConditional": "",
                        "type": "button",
                        "custom": "MindYourManners.accept(form, '<FIELD_ID>');",
                        "input": true
                      }
                    ],
                    "width": 1,
                    "offset": 0,
                    "push": 0,
                    "pull": 0,
                    "size": "md",
                    "currentWidth": 1
                  },
                  {
                    "components": [
                      {
                        "label": "Reject",
                        "action": "custom",
                        "showValidations": false,
                        "theme": "info",
                        "size": "sm",
                        "hidden": true,
                        "tableView": false,
                        "key": "submit6",
                        "conditional": {
                          "show": true,
                          "when": "suggestedTextInput"
                        },
                        "customConditional": "",
                        "type": "button",
                        "custom": "MindYourManners.reject(form, '<FIELD_ID>');",
                        "input": true
                      }
                    ],
                    "width": 1,
                    "offset": 0,
                    "push": 0,
                    "pull": 0,
                    "size": "md",
                    "currentWidth": 1
                  }
                ],
                "key": "columns2",
                "type": "columns",
                "input": false,
                "tableView": false,
                "customConditional": "show = MindYourManners.hasResponse('<FIELD_ID>');"
              }
            ]
          }
        ]
    
    }, ...extend);

  }

  render(/*element*/) {
      // Here's where you add your HTML to get put up.
      // 
      const tpl = "";
      // Note the use of the 'ref' tag, which is used later to find 
      // parts of your rendered element.
      
      // If you need to render the superclass,
      // you can do that with 
      // tpl+=super.render(element);

      // This wraps your template to give it the standard label and builder decorations         
      return Formio.Components.components.component.prototype.render.call(this, tpl);

    }
  
  static get builderInfo() {
    return {
      title: 'Mind Your Manners',
      group: 'basic',
      icon: 'code',
      documentation: '/userguide/#html-element-component',
      schema: this.schema()
    };
  }
}
