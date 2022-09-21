"""The forms flow API service."""
from flask_caching import Cache
cache = Cache() 

from formsflow_api.app import create_app

__version__ = "4.0.5"
