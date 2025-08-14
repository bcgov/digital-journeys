#!/usr/bin/env python3

import os
import sys
import pandas as pd

import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

from sqlalchemy import create_engine

from collections import defaultdict

# download nltk corpus (first time only)
import nltk

if not 'nltk_data' in os.listdir():
    nltk.download('all')


report_file:str = sys.argv[1]

df = pd.read_csv(report_file, sep='\t')


def preprocess_text(text):

  tokens = word_tokenize(str(text).lower())

  filtered_tokens = [token for token in tokens if token not in stopwords.words('english')]

  lemmatizer = WordNetLemmatizer()

  lemmatized_tokens = [lemmatizer.lemmatize(token) for token in filtered_tokens]

  processed_text = ' '.join(lemmatized_tokens)

  return processed_text

analyzer = SentimentIntensityAnalyzer()

def get_sentiment(text):

    scores = analyzer.polarity_scores(text)
    
    return 'positive' if scores['pos'] > 0 else 'negative'

def load_nrc_lexicon(filepath):
    emotion_lexicon = defaultdict(set)
    with open(filepath, 'r') as file:
        for line in file:
            word, emotion, association = line.strip().split('\t')
            if int(association) == 1:
                emotion_lexicon[word].add(emotion)
    return emotion_lexicon


def detect_emotions(text, lexicon):
    tokens = nltk.word_tokenize(str(text).lower())
    emotion_counts = defaultdict(int)
    for token in tokens:
        for emotion in lexicon.get(token, []):
            emotion_counts[emotion] += 1
    return max(emotion_counts, key=emotion_counts.get) if emotion_counts else 'neutral'
    #return ", ".join([x for x in emotion_counts.keys()])

def get_flagged_words(tokens):
    
    flagged_words = [
        "bully", "bullies", "bullied", "bullying",
        "harass", "harasses", "harassed", "harassing", "harassment",
        "abuse", "abuses", "abused", "abusing", "abusive",
        "threaten", "threatens", "threatened", "threatening", "threat",
        "discriminate", "discriminates", "discriminated", "discriminating", "discrimination",
        "insult", "insults", "insulted", "insulting", "insultingness",
        "offend", "offends", "offended", "offending", "offensive",
        "demean", "demeans", "demeaned", "demeaning",
        "belittle", "belittles", "belittled", "belittling",
        "intimidating", "intimidate", "intimidates", "intimidated", "intimidation",
        "racist", "racism", "sexist", "sexism", "homophobic", "homophobia",
    ]

    words = [token for token in tokens if str(token).lower() in flagged_words]

    return ', '.join(words)

lexicon = load_nrc_lexicon('NRC-Emotion-Lexicon-Wordlevel-v0.92.txt')

fields = [
            'whatDoYouAppreciateMostAboutNameSLeadershipStyle1', 
            'whatAdviceWouldYouGiveToHelpThemBecomeAnEvenBetterLeader', 
            'whatIsYourGreatestStrengthAsALeader',
            'whatAdviceWouldYouGiveToHelpThemBecomeAnEvenBetterLeader2'
        ]

for field in fields:
    df[f'{field}_processedText'] = df[f'{field}_newValue'].apply(preprocess_text)
    df[f'{field}_sentiment'] = df[f'{field}_processedText'].apply(get_sentiment)
    df[f'{field}_emotion'] = df[f'{field}_processedText'].apply(lambda x: detect_emotions(x, lexicon))
    df[f'{field}_flagged'] = df[f'{field}_processedText'].apply(lambda x: get_flagged_words(x.split()))

print(df)

df.to_csv(report_file, sep='\t', index=False)

con = create_engine('sqlite:///../superset/report.db')

df.to_sql('report', con, if_exists='replace', index=False)
