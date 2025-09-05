const MindYourManners = {
  v: 202508081,
  debouncers: {},
  errors: {},
  responses: {},
  delay: 2000, // Default delay for debouncing
  busyWith: null,
  store: {},
  init() {

    if ( window.Formio && window.Formio.forms ) {
      const form = Object.values(window.Formio.forms)[0];

      if ( form != null ) {

        const formId = form.form.parentFormId;
        
        if ( MindYourManners.store[formId] == null ) {

          MindYourManners.store = {};

          console.log("Creating new MindYourManners instance for form:", formId);
          this.form = form;
          this.submissionId = performance.now();
          

          this.mindYourMannersComponent = this.getFieldFromName("mindYourMannersComponent");

          if ( this.mindYourMannersComponent == null ) {
            console.error("MindYourMannersComponent not found in the form.");
            return;
          }

          try {

            const m = JSON.parse(this.mindYourMannersComponent.getValue());
            this.constants = m.constants;
            this.includedFields = m.includedFields;

            console.log("Included fields ", this.includedFields);

          } catch {
            this.constants = {};
          }

          MindYourManners.store[formId] = this;
        }
      }
      else {
        console.error("Could not find Formio form instance.");
      }
    } else {
      console.error("Formio is not available or forms are not initialized.");
    }

  },

  getConstantValue: function(key) {

    if ( this.constants == null ) return key;

    return this.constants[key] || key;
  },
  getFieldFromName: function(key) {
    return this.form.root.getComponent(key);
  },
  accept: function(form, target, action="accept") {

    const strip = (text) => text ? text.replace(/^\s+|\s+$/g, '') : '';

    if ( target.startsWith("FIELD") ) {
      target = this.getConstantValue(target);
    }

    const component = form.getComponent(target);

    if ( component == null ) {
      console.error(`Could not find target at ${target}`);
      return;
    }

    const componentKey = component.key;

    const parts = (this.responses[componentKey] || "").split(/(?:\*{0,})Reasoning:?(?:\*{0,})/);

    const oldValue = component.getValue();

    const formName = component.root.form ? component.root.form.name : "Unknown Form";

    if ( action == "accept" ) {
      component.setValue(strip(parts[0]));
    }

    delete this.responses[componentKey];
    this.redraw();

    this.telemetry(action, formName, componentKey, { oldValue, newValue: component.getValue(), reasoning: strip(parts[1])});
  },
  reject: function(form, target) {

    this.accept(form, target, "reject");
  },
  telemetry: function(action, formName, componentKey, data) {

    //console.log(`Telemetry action: ${action}, formName: ${formName}, componentKey: ${componentKey}`, data);

    const { sub } = JSON.parse(localStorage.getItem("UserDetails") || "{ \"sub\": \"unknown\" }");

    const etc = {};
    
    (this.includedFields || []).forEach(f => {
      f = f.trim();
      const field = this.getFieldFromName(f);

      if ( field != null ) {
        etc[field.key] = field.getValue();
      }

    });

    //console.log("Telemetry etc:", etc);

    fetch(`${protocol}://${api}/telemetry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        submissionId: this.submissionId,
        sub,
        formName,
        action,
        componentKey,
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
        reasoning: data.reasoning || null,
        etc
      })
    });

  },
  profanity: function(instance, input, params, ...arguments) {
  
    this.create("profanity", false, instance, input, params, ...arguments)
  },
  sanitise: function(streaming, instance, input, params, ...arguments) {

    this.create("sanitise", streaming, instance, input, params, ...arguments)
  },
  style: function(streaming, style, instance, input, params, ...arguments) {
  
    params = Object.assign({ style }, params || {});
    this.create("style", streaming, instance, input, params, ...arguments)
  },
  create: function(service, streaming, instance, input, params, ...arguments) {

    if ( !api || !service || !instance ) {
      console.error("Missing required parameters for InputHelper.create()");
      console.error("api, service, instance. ", api, service, instance);
      return;
    }

    const evt = ([...arguments].pop() || [{}])[0] || {};
    const { changed={instance: {}} } = evt;

    if ( instance.id !== changed.instance.id ) return;
    
    if ( this.mindYourMannersComponent == null ) {
      console.error("MindYourMannersComponent not found in the form.");
      return;
    }

    const componentKey = instance.component.key;

    if ( params.maxLength && input && input.length > params.maxLength ) {
      
      this.handleError(componentKey, { code: "max_length_exceeded" });
      return false;
    }      

    const bounce = this.debouncers[instance.id] || _.debounce( (...args) => { 

      const inputText = args[0];
      if ( inputText == null || inputText.length < 1 ) {

        return this.setResponseValue(componentKey, null);
      };

      this.setBusyWith(componentKey);

      const req = fetch(`${protocol}://${api}/${service}?streaming=${streaming}&max_length=${params.maxLength}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify(Object.assign({
            text: inputText
          }, params || {}))
      });

      //console.log("Request sent to AI service:", req);

      if ( streaming ) {

        this.handleStreamingResponse(req, componentKey);

      } else {
        this.handleResponse(req, componentKey);
      }
      
    }, this.delay || 2000);

    this.debouncers[instance.id] = this.debouncers[instance.id] || bounce;

    bounce(input);

  },
  handleStreamingResponse: function(request, componentKey) {

    request.then(async response => {

      const reader = response.body.getReader(),
        decoder = new TextDecoder();
      
      const parts = [];
      while (true) {

        const { value, done } = await reader.read();
        if ( value ) {

          const chunks = decoder.decode(value, { stream: true }).split('\n');

          for (const chunk of chunks) {
            if ( chunk.trim() === "" ) continue; // Skip empty chunks
          
            try {
              const parsedChunk = JSON.parse(chunk);
              if ( parsedChunk.error ) {
              
                this.handleError(componentKey, parsedChunk);
                return this.setBusyWith(null);
              }
              if ( parsedChunk.text ) {
                //console.log("Parsed chunk:", parsedChunk.text);
                parts.push(parsedChunk.text);
                this.setResponseValue(componentKey, parts.join(''));
              }
            } catch (e) {
              //console.error("Failed to parse chunk:", e);
              //console.error("Raw chunk:", chunk);
              this.handleError(componentKey, { code: "parse_error" });
              return this.setBusyWith(null);
            } 
          }
        }

        if ( done ) {

          //console.log("Stream finished.");
          this.setBusyWith(null);
          break;
        }
      }
    })
    .catch(error => {
      console.error("Error:", error);
      this.handleError(componentKey, { code: "service_unavailable" });
      return this.setBusyWith(null);
    })
    .finally(() => {
      this.setBusyWith(null);
    });
  },
  
  handleResponse: function(request, componentKey) {

    request
    .then(response => response.json())
    .then(result => { 
      //console.log("Result, ", result);
      if ( result.error ) {
        
        this.handleError(componentKey, parsedChunk);
        return;
      }

      if ( result.noop ) {
        console.log("No operation performed, returning original input.");
        return;
      }

      this.setResponseValue(componentKey, result.text);
    
    })
    .catch(error => {
      console.error("Error:", error);
      this.handleError(componentKey, { code: "parse_error" });
      return this.setBusyWith(null);
    })
    .finally(() => {
      this.setBusyWith(null);
    });
  },

  setBusyWith: function(componentKey) {
    this.busyWith = componentKey;
    this.errors[componentKey] = null; // Clear any previous errors for this component
    this.responses[componentKey] = null; // Clear any previous responses for this component
    this.redraw();
    //console.log("Setting busy with:", componentKey);
  },

  isBusyWith: function(componentKey) {

    if ( !this.busyWith ) return false;

    return this.busyWith == componentKey;
  },

  setResponseValue: function(componentKey, value) {

    this.responses[componentKey] = value;
    this.redraw();
  },

  getResponseValue: function(componentKey, prefix="&#10023; ") {

    if ( componentKey.startsWith("FIELD") ) {
      componentKey = this.getConstantValue(componentKey);
    }

    if ( this.isBusyWith(componentKey) ) return prefix + "...";
    
    if ( !this.responses[componentKey] ) return "";

    return prefix + (this.responses[componentKey] || ""); 
  },

  isVisible: function(componentKey) {

    if ( componentKey.startsWith("FIELD") ) {
      componentKey = this.getConstantValue(componentKey);
    }

    if ( this.isBusyWith(componentKey) ) return true;

    return this.hasResponse(componentKey) === true || ( this.errors[componentKey] !== null && this.errors[componentKey] !== undefined );
  },

  hasResponse: function(componentKey) {

    if ( componentKey.startsWith("FIELD") ) {
      componentKey = this.getConstantValue(componentKey);
    }

    if ( this.responses[componentKey] == null || !this.responses[componentKey] ) return false;

    return this.responses[componentKey].length > 0;
  },

  handleError: function(componentKey, err) {

    console.error("An error occurred in :", componentKey, err);

    if ( err.code == "content_filter" ) {

      this.errors[componentKey] = "The content you provided does not meet the guidelines for this service. Please try rephrasing or using different words.";

    } else if ( err.code == "max_length_exceeded" ) {

      this.errors[componentKey] = "The input text exceeds the maximum allowed length. Please shorten your input and try again.";
    
    } else if ( err.code == "invalid_request" ) {

      this.errors[componentKey] = "The request was invalid. Please check your input and try again.";
    
    } else if ( err.code == "service_unavailable" ) {

      this.errors[componentKey] = "The service is currently unavailable. Please try again later.";
    
    } else if ( err.code == "parse_error" ) {

      this.errors[componentKey] = "Unexpected response received from server. Please try again later.";
    
    } else {

      this.errors[componentKey] = "An unexpected error occurred. Please try again later.";
    }

    this.redraw();
  },
  redraw: function() {

    const m = {
      constants: this.constants,
      includedFields: this.includedFields,
      v: performance.now()
    }

    this.mindYourMannersComponent.setValue(JSON.stringify(m));
  }
};
