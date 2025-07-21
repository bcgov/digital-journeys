from better_profanity import Profanity
from better_profanity.varying_string import VaryingString

from better_profanity.utils import (
    
    read_wordlist
)

class EvenBetterProfanity(Profanity):
    """
    A subclass of Profanity that allows for additional functionality.
    This class can be extended to add more features or override existing ones.
    """

    def __init__(self, *args, **kwargs):
      print("Initializing EvenBetterProfanity with custom functionality.")
      super().__init__(*args, **kwargs)
      
    def add_censor_words(self, custom_words):
      if not isinstance(custom_words, (list, tuple, set)):
          raise TypeError(
              "Function 'add_censor_words' only accepts list, tuple or set."
          )
      
      custom_words = self.add_suffixes_to_word_list(custom_words)

      for w in custom_words:
          self.CENSOR_WORDSET.append(VaryingString(w, char_map=self.CHARS_MAPPING))
          
    def load_censor_words(self, custom_words=None, **kwargs):
      """Generate a set of words that need to be censored."""
      print("Loading custom censor words.")
      # Replace the words from `profanity_wordlist.txt` with a custom list
      custom_words = custom_words or read_wordlist(self._default_wordlist_filename)
      custom_words = self.add_suffixes_to_word_list(custom_words)
      self._populate_words_to_wordset(custom_words, **kwargs)

    def add_suffixes_to_word_list(self, custom_words):
        
      custom_words = [[word, word + "s", word + "ing", word + "er", word + "ers"] for word in custom_words if word]  # Append (ing, s, er, ers) to each word
      flattened_custom_words = [item for sublist in custom_words for item in sublist]
      custom_words = set(flattened_custom_words)  # Convert to a set for faster lookups

      return custom_words