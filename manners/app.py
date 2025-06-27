from flask import Flask, request, jsonify, Response  # Importing Flask and related modules for handling HTTP requests and responses
from flask_cors import CORS  # Importing CORS to allow cross-origin requests
import os  # Importing the OS module for environment variable access
from dotenv import load_dotenv  # Importing dotenv to load environment variables from a .env file
from openai import AzureOpenAI  # Importing the AzureOpenAI client from OpenAI
import json
import re
import ast
from better_profanity import profanity

import logging
from logging import Logger

from typing import Any, Generator, Final

load_dotenv()  # Load environment variables from .env file

# Initialize global variables for logging, Azure OpenAI client, and Flask application

log: Logger = None # Initialize the logger variable
client: Any = None # Initialize the Azure OpenAI client variable
controller: Flask | None = None  # Initialize the Flask application variable

AZURE_OPENAI_ENDPOINT: Final[str] = os.getenv("AZURE_OPENAI_ENDPOINT")  # Retrieve the Azure OpenAI endpoint from environment variables
AZURE_OPENAI_KEY: Final[str] = os.getenv("AZURE_OPENAI_API_KEY")  # Retrieve the Azure OpenAI API key from environment variables
AZURE_OPENAI_DEPLOYMENT: Final[str] = os.getenv("AZURE_OPENAI_DEPLOYMENT")  # Retrieve the Azure OpenAI deployment name
AZURE_OPENAI_VERSION: Final[str] = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-21")  # Retrieve the Azure OpenAI API version, defaulting to a specific version if not set
API_KEY: Final[str] = os.getenv("API_KEY", "")  # Retrieve the API key for authentication, defaulting to an empty string if not set
FLASK_PROTOCOL: Final[str] = os.getenv("FLASK_PROTOCOL", "https")  # Retrieve the protocol (http or https) for the Flask application, defaulting to http

def init(): 
  
  global client
  global controller
  global log

  log = logging.getLogger(__name__)

  log_level: str = logging.INFO

  if os.getenv("FLASK_DEBUG", "false").lower() == "true":
    log_level = logging.DEBUG

  logging.basicConfig(level=log_level)

  controller = Flask(__name__)  # Initialize the Flask application
  CORS(controller, resources={r"/*": {"origins": "*"}}, supports_credentials=True)  # Enable CORS for all origins

  # Initialize the Azure OpenAI client with the provided credentials and endpoint
  client = AzureOpenAI(
    api_key=AZURE_OPENAI_KEY,
    api_version=AZURE_OPENAI_VERSION,
    azure_endpoint=AZURE_OPENAI_ENDPOINT
  )

  profanity.load_censor_words()

init()  # Call the initialization function to set up the Azure OpenAI client

@controller.before_request
def before_request() -> Response | None:
  if request.method == 'OPTIONS':
    # Handle preflight requests for CORS
    response: Response = Response(status=204)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE' # Allow specific methods    
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'  # Allow specific headers  
    return response
  
  if request.method == 'POST':
    # Check for authentication before processing the request
    if not check_auth(request):
      return jsonify({'error': 'Unauthorized'}), 401
  
# Function to check if the request has the required authentication
# Returns True if authenticated, False otherwise.
def check_auth(request: Any) -> bool:

  # Check if the request has the required authentication
  if 'Authorization' not in request.headers or request.headers['Authorization'] != 'Bearer ' + API_KEY:
    log.warning("Unauthorized access attempt detected. Request headers: %s", request.headers)
    return False  # Unauthorized access, return False
  
  return True  # Authorized access, return True

# Define functions to interact with the Azure OpenAI chat service.
# These functions support both streaming and non-streaming responses.
# call_llm_chat_stream yields response chunks as they are received.
# call_llm_chat returns the complete response after processing.
# Both functions handle errors and raise exceptions as needed.

def call_llm_chat_stream(messages: list[dict[str, str]], max_tokens: int = 1000, temperature: float = 0.7, n: int = 1) -> Generator[str, None, None]: 

  try:

    response: Any = client.chat.completions.create(
      model=AZURE_OPENAI_DEPLOYMENT,
      messages=messages,
      max_tokens=max_tokens,
      temperature=temperature,
      n=n,
      stream=True
    )

    for chunk in response:
      
      if len(chunk.choices) > 0:
        yield chunk.choices[0].delta.content

      else:
        yield ""

  except Exception as e:

    log.error(f"Error calling LLM: {e}")
    raise RuntimeError(e)

def call_llm_chat(messages: list[dict[str, str]], max_tokens: int = 1000, temperature: float = 0.7, n: int = 1) -> str:
  
  try:

    response: Any = client.chat.completions.create(
      model=AZURE_OPENAI_DEPLOYMENT,
      messages=messages,
      max_tokens=max_tokens,
      temperature=temperature,
      n=n,
      stream=False
    )

    return response.choices[0].message.content.strip()
      
  except Exception as e:
    # If there is an error calling the LLM, log it and raise a RuntimeError
    log.error(f"Error calling LLM: {e}")
    raise RuntimeError(e)

# Handles streaming responses from the LLM and yields each chunk as a JSON object.
def streaming_response(system_message: dict[str, str], user_message: dict[str, str]) -> Response:
  
  def generate():
   
    try:
      for chunk in call_llm_chat_stream([system_message, user_message]):

        if chunk is not None:
          yield json.dumps({ 'text': chunk }) + '\n'  # Yield each chunk as a JSON object

    except Exception as e:
      log.error(f"Error during streaming: {e}")
      object_error: dict[str, str] = extract_error(e)
      yield json.dumps({'error': f'Failed to sanitise text.', 'original': object_error, 'code': object_error["code"]})

  return controller.response_class(generate(), mimetype='application/json')

# Handles non-streaming (static) responses from the LLM and returns the full response as JSON.
def static_response(system_message: dict[str, str], user_message: dict[str, str]) -> Response:
  
  try:
      
    sanitised_text: str = call_llm_chat([system_message, user_message])
    return jsonify({'text': sanitised_text}), 200

  except Exception as e:

    log.error(f"Error during sanitisation: {e}")  
    object_error: dict[str, str] = extract_error(e)

    return jsonify({'error': f'Failed to sanitise text.', 'original': object_error, 'code': object_error["code"]}), 500

# Extracts error information from an exception and returns it as a dictionary.
def extract_error(e: Exception) -> dict[str, str]:
  
  error: str = str(e)
  parts: list[str] = re.split(r'\s-\s', error)
  object_error: dict[str, str] = { 'code': 'Unknown', 'message': error }

  if len(parts) > 1:
    error = parts[0]
    try:
      tmp: Any = ast.literal_eval(parts[1])
      object_error = tmp.get('error', object_error)

    except Exception:  
      log.error(f"Failed to parse JSON from error parts: {parts[1]}")
      object_error = { 'code': 'Unknown', 'message': error }

  return object_error

def load_prompt(file_path: str) -> str:
    """
    Load a prompt from a file.
    """
    try:
      with open(f"prompts/{file_path}.md", 'r') as file:
        return file.read()
    except FileNotFoundError:
      log.error(f"Prompt file {file_path} not found.")
      return "Prompt file not found."
    except Exception as e:
      log.error(f"Error loading prompt from {file_path}: {e}")
      return "Error loading prompt."

@controller.route('/sanitise', methods=['POST'])
def sanitise() -> Response:
   
    data: dict[str, object] | None = request.get_json()
    if not data or 'text' not in data or len(data['text'].strip()) == 0:
      # No text found in the request
      return jsonify({'error': 'No text provided.'}), 400

    streaming: bool = request.args.get('streaming', 'false').lower() == 'true'
    user_text: str = data['text']

    content: str = load_prompt("sanitise")  # Load the sanitisation prompt from a file
      
    # Craft the system message to instruct the LLM to sanitise the text
    
    system_message: dict[str, str] = {
        "role": "system",
        "content": content
    }
    user_message: dict[str, str] = {
        "role": "user",
        "content": user_text
    }

    if streaming is True:
      
      return streaming_response(system_message, user_message)
    
    elif not streaming:
      
      return static_response(system_message, user_message)

@controller.route('/style', methods=['POST'])
def style() -> Response:

  data: dict[str, object] | None = request.get_json()
  if not data or 'text' not in data or len(data['text'].strip()) == 0:
    # No text found in the request
    return jsonify({'error': 'No text provided.'}), 400

  streaming: bool = request.args.get('streaming', 'false').lower() == 'true'
  user_text: str = data['text']
  style: str = data['style']

  content: str = load_prompt("style")  # Load the style prompt from a file
  content = content.replace("{style}", style)  # Replace the placeholder with the actual style

  # Craft the system message to instruct the LLM to sanitise the text
  system_message: dict[str, str] = {
      "role": "system",
      "content": content
  }
  user_message: dict[str, str] = {
      "role": "user",
      "content": user_text
  }

  if streaming is True:
    
    return streaming_response(system_message, user_message)
  
  elif not streaming:
    
    return static_response(system_message, user_message)

@controller.route('/profanity', methods=['POST'])
def prfnty() -> Response:

  data: dict[str, object] | None = request.get_json()
  if not data or 'text' not in data or len(data['text'].strip()) == 0:
    # No text found in the request
    return jsonify({'error': 'No text provided.'}), 400

  user_text: str = data['text']

  if ( not profanity.contains_profanity(user_text) ):
    # If no profanity is found, return the NOOP
    return jsonify({ "noop": True }), 200

  return jsonify( { "text": profanity.censor(user_text) } ), 200

@controller.route('/script')
def serve_script() -> tuple[str, int, dict[str, str]]:

  API_ROOT: str = request.headers.get('HOST')

  head: str = f"""
    // MindYourManners.js - A JavaScript utility for handling profanity, sanitisation, and style rewriting
    // This script provides functions to interact with a backend service for text processing.

    const api = "{API_ROOT}"; // API root URL for the backend service
    const apiKey = "{API_KEY}";  // API key for authentication
    const protocol = "{FLASK_PROTOCOL}";  // Protocol used for API requests, e.g., "http" or "https"
  """

  js_code: str = """
    
    const MindYourManners = {
      debouncers: {},
      errors: {},
      responses: {},
      delay: 2000, // Default delay for debouncing
      busyWith: null,
      accept: function(form, target) {

        const component = form.getComponent(target);

        if ( component == null ) {
          console.error(`Could not find target at ${target}`);
          return;
        }

        const componentKey = component.key;

        component.setValue(this.responses[componentKey] || "");
        delete this.responses[componentKey];
      },
      profanity: function(instance, input, ...arguments) {
      
        this.create("profanity", false, instance, input, {}, ...arguments)
      },
      sanitise: function(streaming, instance, input, ...arguments) {

        this.create("sanitise", streaming, instance, input, {}, ...arguments)
      },
      style: function(streaming, style, instance, input, ...arguments) {
      
        const params = { style };
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
       
        this.mindYourMannersComponent = this.mindYourMannersComponent || instance.root.getComponent("mindYourMannersComponent");
        const componentKey = instance.component.key;

        const bounce = this.debouncers[instance.id] || _.debounce( (...args) => { 

          const inputText = args[0];
          if ( inputText == null || inputText.length < 1 ) {

            return this.setResponseValue(componentKey, null);
          };

          this.setBusyWith(componentKey);

          const req = fetch(`${protocol}://${api}/${service}?streaming=${streaming}`, {
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
      handleStreamingResponse: async function(request, componentKey) {

        const reader = (await request).body.getReader(),
          decoder = new TextDecoder();

        const parts = [];
        while (true) {

          const { value, done } = await reader.read();
          if ( value ) {

            const chunks = decoder.decode(value, { stream: true }).split('\\n');

            for (const chunk of chunks) {
              if ( chunk.trim() === "" ) continue; // Skip empty chunks
            
              try {
                const parsedChunk = JSON.parse(chunk);
                if ( parsedChunk.error ) {
                
                  this.handleError(componentKey, parsedChunk);
                  return this.setBusyWith(null);
                }
                if ( parsedChunk.text ) {
                  parts.push(parsedChunk.text);
                  this.setResponseValue(componentKey, parts.join(''));
                }
              } catch (e) {
                console.error("Failed to parse chunk:", e);
                console.error("Raw chunk:", chunk);
              } 
            }
          }

          if ( done ) {

            //console.log("Stream finished.");
            this.setBusyWith(null);
            break;
          }
        }
      },
      
      handleResponse: function(request, componentKey) {

        request
        .then(response => response.json())
        .then(result => { 
          console.log("Result, ", result);
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
        .catch(error => console.error("Error:", error))
        .finally(() => {
          this.setBusyWith(null);
        });
      },

      setBusyWith: function(componentKey) {
        this.busyWith = componentKey;
        this.mindYourMannersComponent.setValue(performance.now());
        console.log("Setting busy with:", componentKey);
      },

      isBusyWith: function(componentKey) {

        if ( !this.busyWith ) return false;

        return this.busyWith == componentKey;
      },

      setResponseValue: function(componentKey, value) {

        this.responses[componentKey] = value;
        this.mindYourMannersComponent.setValue(performance.now());
      },

      getResponseValue: function(componentKey, prefix="&#10023; ") {

        if ( this.isBusyWith(componentKey) ) return prefix + "...";
       
        if ( !this.responses[componentKey] ) return "";

        return prefix + (this.responses[componentKey] || ""); 
      },

      isVisible: function(componentKey) {

        if ( this.isBusyWith(componentKey) ) return true;

        return this.hasResponse(componentKey) || this.errors[componentKey];
      },

      hasResponse: function(componentKey) {

        if ( !this.responses[componentKey] ) return false;

        return this.responses[componentKey].length > 0;
      },

      handleError: function(componentKey, error) {

        console.error("An error occurred:", error);

        if ( error.code == "content_filter" ) {

          this.errors[componentKey] = "The content you provided does not meet the guidelines for this service. Please try rephrasing or using different words.";
 
        }
        this.mindYourMannersComponent.setValue(performance.now());
      }
    };
  """
  return head + js_code, 200, {'Content-Type': 'application/javascript'}


if __name__ == '__main__':
    # Run the Flask application on port 5005
    controller.run(host='0.0.0.0', port=5005, debug=True)
