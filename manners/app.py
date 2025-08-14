from datetime import datetime
from flask import Flask, request, jsonify, Response  # Importing Flask and related modules for handling HTTP requests and responses
from flask_cors import CORS  # Importing CORS to allow cross-origin requests
import os  # Importing the OS module for environment variable access
from dotenv import load_dotenv  # Importing dotenv to load environment variables from a .env file
from openai import AzureOpenAI  # Importing the AzureOpenAI client from OpenAI
import json
import re
import ast
from string import Template
import hashlib

from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern

from presidio_analyzer.nlp_engine import NlpEngineProvider

from presidio_anonymizer import AnonymizerEngine, OperatorConfig # Importing the AnonymizerEngine for text anonymization

from even_better_profanity import EvenBetterProfanity

import logging
from logging import Logger

from typing import Any, Generator, Final

load_dotenv()  # Load environment variables from .env file

# Initialize global variables for logging, Azure OpenAI client, and Flask application

log: Logger = None # Initialize the logger variable
client: Any = None # Initialize the Azure OpenAI client variable
controller: Flask | None = None  # Initialize the Flask application variable
better_profanity: EvenBetterProfanity = None # Initialize the profanity filter
analyzer: AnalyzerEngine = None  # Initialize the Presidio analyzer engine for text analysis

AZURE_OPENAI_ENDPOINT: Final[str] = os.getenv("AZURE_OPENAI_ENDPOINT")  # Retrieve the Azure OpenAI endpoint from environment variables
AZURE_OPENAI_KEY: Final[str] = os.getenv("AZURE_OPENAI_API_KEY")  # Retrieve the Azure OpenAI API key from environment variables
AZURE_OPENAI_DEPLOYMENT: Final[str] = os.getenv("AZURE_OPENAI_DEPLOYMENT")  # Retrieve the Azure OpenAI deployment name
AZURE_OPENAI_VERSION: Final[str] = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-21")  # Retrieve the Azure OpenAI API version, defaulting to a specific version if not set
API_KEY: Final[str] = os.getenv("API_KEY", "")  # Retrieve the API key for authentication, defaulting to an empty string if not set
FLASK_PROTOCOL: Final[str] = os.getenv("FLASK_PROTOCOL", "https")  # Retrieve the protocol (http or https) for the Flask application, defaulting to http

# Function to initialize the Flask application, Azure OpenAI client, and profanity filter
def init() -> None:

  global client
  global controller
  global log
  global analyzer
  global better_profanity

  log = logging.getLogger(__name__)

  log_level: int = logging.INFO

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

  better_profanity = EvenBetterProfanity()  # Initialize the profanity filter

  configuration = {
      "nlp_engine_name": "spacy",
      "models": [{"lang_code": "en", "model_name": "en_core_web_lg"}]
  }

  provider = NlpEngineProvider(nlp_configuration=configuration)
  nlp_engine = provider.create_engine()

  analyzer = AnalyzerEngine(nlp_engine=nlp_engine, supported_languages=["en"])

  sin_recognizer = PatternRecognizer(supported_entity="SIN", patterns=[Pattern(name="SIN", regex=r"\d{3}-\d{3}-\d{3}", score=0.8)])
  analyzer.registry.add_recognizer(sin_recognizer)  # Add a custom recognizer for SIN (Social Insurance Number) patterns

  if ( "profanity_wordlist.txt" in os.listdir() ):

    with open("profanity_wordlist.txt", "r") as file:
      custom_words = [line.strip() for line in file if line.strip()]  # Read custom profanity words from a file, stripping whitespace
      better_profanity.add_censor_words(custom_words)  # Add custom profanity words to the censor list

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
  
  def generate() -> Generator[str, None, None]:
   
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

# Loads a prompt from a file and substitutes any variables with the provided keyword arguments.
def load_prompt(file_path: str, **kwargs) -> str:
    """
    Load a prompt from a file.
    """
    try:
      with open(f"prompts/{file_path}.md", 'r') as file:
        return Template(file.read()).safe_substitute(**kwargs)  # Use Template to allow for variable substitution if needed
      
    except FileNotFoundError:
      log.error(f"Prompt file {file_path} not found.")
      return "Prompt file not found."
    except Exception as e:
      log.error(f"Error loading prompt from {file_path}: {e}")
      return "Error loading prompt."

# Anonymizes sensitive information in the text using the Presidio Anonymizer.
# It replaces entities like PERSON, PHONE_NUMBER, EMAIL_ADDRESS, and DATE_TIME with generic placeholders
def anonymize(text: str) -> dict[str, Any]:

  engine: AnonymizerEngine = AnonymizerEngine()

  results: Any = analyzer.analyze(text=text, entities=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "DATE_TIME", "SIN"], language="en")

  anon_text: Any = engine.anonymize(text=text, 
                              analyzer_results=results, 
                              operators={
                                "DEFAULT": OperatorConfig("replace", {"new_value": "[REDACTED]"}), 
                                #"PHONE_NUMBER": OperatorConfig("mask", {"type": "mask", "masking_char" : "#", "chars_to_mask" : 12, "from_end" : True}),
                                "PHONE_NUMBER": OperatorConfig("replace", {"new_value": "[PHONE_NUMBER]"}),
                                "PERSON": OperatorConfig("replace", {"new_value": "[PERSON]"}), 
                                "DATE_TIME": OperatorConfig("replace", {"new_value": "[DATE]"}), 
                                "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": "[EMAIL]"}), 
                              }
  )

  #print(f"Anonymised text: {anon_text}")

  return { "text": anon_text.text, "changed": len(results) > 0 }  # Return the anonymized text and the analysis results

@controller.route('/sanitise', methods=['POST'])
def sanitise() -> Response:
   
    data: dict[str, object] | None = request.get_json()
    if not data or 'text' not in data or len(data['text'].strip()) == 0:
      # No text found in the request
      return jsonify({'error': 'No text provided.'}), 400

    streaming: bool = request.args.get('streaming', 'false').lower() == 'true'
    max_length: str = request.args.get('max_length', '10000')
    user_text: str = data['text']

    content: str = load_prompt("sanitise_v3", max_length=max_length)  # Load the sanitisation prompt from a file
      
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
  max_length: str = request.args.get('max_length', '10000')
  user_text: str = data['text']
  style: str = data['style']

  content: str = load_prompt("style", style=style, max_length=max_length)  # Load the style prompt from a file

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
def profanity() -> Response:

  data: dict[str, object] | None = request.get_json()

  if not data or 'text' not in data or len(data['text'].strip()) == 0:
    # No text found in the request
    return jsonify({'error': 'No text provided.'}), 400

  user_text: str = data['text']

  anon_result: dict[str, Any] = anonymize(user_text)  # Anonymize the text to remove any sensitive information
  user_text = anon_result['text']

  if ( not better_profanity.contains_profanity(user_text) and anon_result['changed'] == False ):
    # If no profanity is found, return the NOOP
    return jsonify({ "noop": True }), 200

  return jsonify( { "text": better_profanity.censor(user_text) } ), 200

@controller.route('/telemetry', methods=['POST'])
def telemetry() -> Response:
  """
  Endpoint to handle telemetry data sent from the frontend.
  """
  data: dict[str, Any] | None = request.get_json() or None

  if not data:
    return jsonify({'error': 'No telemetry data provided.'}), 400

  submission_id: str = data['submissionId']

  filename: str = f"./data/{submission_id}.json"

  existing_data: dict[str, Any] = {}

  try:
    with open(filename, "r") as f:
      existing_data = json.load(f)
      
  except:
    log.error(f"New file for telemetry data: {filename}")
    existing_data = {
      'metadata': {},
      'fields': {}
    }

  sub: str = data.get('sub', 'unknown')  # Get the 'sub' field from the data, defaulting to 'unknown' if not present
  existing_data['metadata']['sub'] = hashlib.sha256(b"{sub}").hexdigest()
  existing_data['metadata']['date'] = datetime.now().isoformat()
  existing_data['metadata']['formName'] = data['formName']
  existing_data['etc'] = data['etc']

  # Log the telemetry data for debugging purposes
  log.info(f"Telemetry data received: {data}")

  existing_data['fields'][data['componentKey']] = {

    'action': data['action'],
    'oldValue': anonymize(data.get('oldValue', '')).get('text', ''),
    'newValue': anonymize(data.get('newValue', '')).get('text', ''),
    'reasoning': data.get('reasoning', '')
  }

  with open(filename, "w") as f:
    f.write(json.dumps(existing_data))

  return jsonify({'status': 'success', 'message': 'Telemetry data received successfully.'}), 200

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

  js_code: str = ""

  with open("static/script.js", "r") as file:
    js_code = file.read()

  return head + js_code, 200, {'Content-Type': 'application/javascript'}


if __name__ == '__main__':
    # Run the Flask application on port 5005
    controller.run(host='0.0.0.0', port=5005, debug=True, use_reloader=True, extra_files=['./prompts/sanitise_v3.md', './prompts/style.md', './static/script.js'])
