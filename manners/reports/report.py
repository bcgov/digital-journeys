#!/usr/bin/env python3

import os
import sys
import pandas as pd

import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

from collections import defaultdict



# download nltk corpus (first time only)
import nltk

if not 'nltk_data' in os.listdir():
    nltk.download('all')


report_file:str = sys.argv[1]

df = pd.read_csv(report_file, sep='\t')


def preprocess_text(text):

  # Tokenize the text

  tokens = word_tokenize(text.lower())

  # Remove stop words

  filtered_tokens = [token for token in tokens if token not in stopwords.words('english')]

  # Lemmatize the tokens

  lemmatizer = WordNetLemmatizer()

  lemmatized_tokens = [lemmatizer.lemmatize(token) for token in filtered_tokens]

  # Join the tokens back into a string

  processed_text = ' '.join(lemmatized_tokens)

  return processed_text


df['processedText'] = df['oldValue'].apply(preprocess_text)

analyzer = SentimentIntensityAnalyzer()


# create get_sentiment function

def get_sentiment(text):

    scores = analyzer.polarity_scores(text)
    
    return 'positive' if scores['pos'] > 0 else 'negative'

# apply get_sentiment function

df['sentiment'] = df['processedText'].apply(get_sentiment)

def load_nrc_lexicon(filepath):
    emotion_lexicon = defaultdict(set)
    with open(filepath, 'r') as file:
        for line in file:
            word, emotion, association = line.strip().split('\t')
            if int(association) == 1:
                emotion_lexicon[word].add(emotion)
    return emotion_lexicon


# Detect emotions in a sentence
def detect_emotions(text, lexicon):
    tokens = nltk.word_tokenize(text.lower())
    emotion_counts = defaultdict(int)
    for token in tokens:
        for emotion in lexicon.get(token, []):
            emotion_counts[emotion] += 1
    #return max(emotion_counts, key=emotion_counts.get) if emotion_counts else 'neutral'
    return ", ".join([x for x in emotion_counts.keys()])

lexicon = load_nrc_lexicon('NRC-Emotion-Lexicon-Wordlevel-v0.92.txt')

df['emotion'] = df['processedText'].apply(lambda x: detect_emotions(x, lexicon))

print(df[['processedText', 'sentiment', 'emotion']])

df.to_csv(report_file, sep='\t', index=False)

