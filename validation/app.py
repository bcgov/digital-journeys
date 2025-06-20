from flask import Flask, request, jsonify, Response  # ...existing code...
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

log: Logger = logging.getLogger(__name__)

log_level: str = logging.INFO

if os.getenv("VALIDATE_DEBUG", "false").lower() == "true":
  log_level = logging.DEBUG

logging.basicConfig(level=log_level)


AZURE_OPENAI_ENDPOINT: Final[str] = os.getenv("AZURE_OPENAI_ENDPOINT")  # Retrieve the Azure OpenAI endpoint from environment variables
AZURE_OPENAI_KEY: Final[str] = os.getenv("AZURE_OPENAI_API_KEY")  # Retrieve the Azure OpenAI API key from environment variables
AZURE_OPENAI_DEPLOYMENT: Final[str] = os.getenv("AZURE_OPENAI_DEPLOYMENT")  # Retrieve the Azure OpenAI deployment name

app = Flask(__name__)  # Initialize the Flask application
CORS(app)  # Enable CORS for all origins

# Initialize the Azure OpenAI client with the provided credentials and endpoint
client: Any = AzureOpenAI(
  api_key=AZURE_OPENAI_KEY,
  api_version="2024-10-21",
  azure_endpoint=AZURE_OPENAI_ENDPOINT
)

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

  return app.response_class(generate(), mimetype='application/json')

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

@app.route('/sanitise', methods=['POST'])
def snts() -> Response:
   
    data: dict[str, object] | None = request.get_json()
    if not data or 'text' not in data or len(data['text'].strip()) == 0:
      # No text found in the request
      return jsonify({'error': 'No text provided.'}), 400

    streaming: bool = request.args.get('streaming', 'false').lower() == 'true'
    user_text: str = data['text']

    # Craft the system message to instruct the LLM to sanitise the text
    system_message: dict[str, str] = {
        "role": "system",
        "content": """
                    ## Writing Assistant Prompt: Natural Tone Rewriting

                    You are a writing assistant helping an author refine character descriptions in a novel. Your job is to rewrite sentences that are overly hateful, abusive, or harsh, making them more natural and suitable for a wider audience—without losing the emotional weight or critique. If the original sentence is already appropriate, return it exactly as is.

                    ---

                    ### Guidelines

                    1. **Understand the Intent**  
                      - Identify what the sentence is trying to express. Is it frustration with a character’s behavior, personality, or a situation? Keep that core message intact.

                    2. **Soften the Tone**  
                      - Replace extreme or demeaning language with more thoughtful, natural phrasing. Keep the critique, but make it sound like something a real person might say or think.

                    3. **Keep the Emotion**  
                      - Don’t water it down. Keep the frustration, disappointment, or intensity—just express it in a more grounded, less aggressive way.

                    4. **Respect the Context**  
                      - Make sure the rewrite fits the scene, the character’s voice, and the overall tone of the story.

                    5. **Don’t Rewrite If It’s Fine**  
                      - If the sentence is already appropriate and not overly harsh, return it unchanged.

                    6. **Be Brief**  
                      - Try to keep the rewrite about the same length as the original.

                    ---

                    ### Output Format

                    - Return a **single rewritten sentence** (or the original if no change is needed).

                    ---

                    ### Example

                    **Original**:  
                    He was a lazy, pathetic excuse for a human being who ruined everything he touched.

                    **Rewritten**:  
                    He lacked drive and often left things worse than he found them.

                    ---

                    ### Notes

                    - Keep the emotional depth and critique—don’t neutralize it.
                    - Use natural, conversational language.
                    - Stay true to the author’s voice and the story’s tone.
                    - This is fictional content and should not be applied to real people or situations.

                    """
    }
    user_message: dict[str, str] = {
        "role": "user",
        "content": user_text
    }

    if streaming is True:
      
      return streaming_response(system_message, user_message)
    
    elif not streaming:
      
      return static_response(system_message, user_message)

@app.route('/style', methods=['POST'])
def style() -> Response:

  data: dict[str, object] | None = request.get_json()
  if not data or 'text' not in data or len(data['text'].strip()) == 0:
    # No text found in the request
    return jsonify({'error': 'No text provided.'}), 400

  streaming: bool = request.args.get('streaming', 'false').lower() == 'true'
  user_text: str = data['text']
  style: str = data['style']

  # Craft the system message to instruct the LLM to sanitise the text
  system_message: dict[str, str] = {
      "role": "system",
      "content": f"""
                  ## Writing Assistant Prompt: Style Rewriting

                  You are a writing assistant helping an author refine character descriptions in a novel. Your job is to rewrite sentences in the style of a **{style}**

                  """
  }
  user_message: dict[str, str] = {
      "role": "user",
      "content": user_text
  }

  if streaming is True:
    
    return streaming_response(system_message, user_message)
  
  elif not streaming:
    
    return static_response(system_message, user_message)

@app.route('/profanity', methods=['POST'])
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

@app.route('/script')
def serve_script() -> tuple[str, int, dict[str, str]]:

  API_ROOT: str = request.headers.get('HOST')

  head: str = f"""
    // MindYourManners.js - A JavaScript utility for handling profanity, sanitisation, and style rewriting
    // This script provides functions to interact with a backend service for text processing.

    // API_ROOT is set to: {API_ROOT}
    const api = "{API_ROOT}";
  """

  js_code: str = """
    
    const MindYourManners = {
      debouncers: {},
      errors: {},
      responses: {},
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

        this.mindYourMannersComponent = this.mindYourMannersComponent || instance.root.getComponent("mindYourMannersComponent");

        const evt = ([...arguments].pop() || [{}])[0] || {};
        const { changed={instance: {}} } = evt;

        if ( instance.id !== changed.instance.id ) return;
       
        const componentKey = instance.component.key;

        //console.log("InputHelper.create() called with parameters:", input);

        const bounce = this.debouncers[instance.id] || _.debounce( (...args) => { 

          const inputText = args[0];
          if ( inputText == null || inputText.length < 1 ) return;

          const req = fetch(`${document.location.protocol}//${api}/${service}?streaming=${streaming}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
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
          
        }, 2000);

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
                  return;
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

            console.log("Stream finished.");
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
        .catch(error => console.error("Error:", error));
      },

      setResponseValue: function(componentKey, value) {

        this.responses[componentKey] = value;
        this.mindYourMannersComponent.setValue(performance.now());
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
    profanity.load_censor_words()
    app.run(host='0.0.0.0', port=5005, debug=True)
