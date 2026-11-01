from flask import Flask
from nltk.sentiment import SentimentIntensityAnalyzer
import json
from pathlib import Path
import shutil
import nltk

lexicon_archive = Path(__file__).parent / "sentiment" / "vader_lexicon.zip"
lexicon_root = Path(__file__).parent / "nltk_data"
sentiment_data = lexicon_root / "sentiment"
sentiment_data.mkdir(parents=True, exist_ok=True)
expected_archive = sentiment_data / "vader_lexicon.zip"
if not expected_archive.exists():
    shutil.copyfile(lexicon_archive, expected_archive)
nltk.data.path.insert(0, str(lexicon_root))
app = Flask("Sentiment Analyzer")
sia = SentimentIntensityAnalyzer()


@app.get('/')
def home():
    return "Welcome to the Sentiment Analyzer. \
    Use /analyze/text to get the sentiment"


@app.get('/analyze/<input_txt>')
def analyze_sentiment(input_txt):

    scores = sia.polarity_scores(input_txt)
    print(scores)
    pos = float(scores['pos'])
    neg = float(scores['neg'])
    neu = float(scores['neu'])
    res = "positive"
    print("pos neg nue ", pos, neg, neu)
    if (neg > pos and neg > neu):
        res = "negative"
    elif (neu > neg and neu > pos):
        res = "neutral"
    res = json.dumps({"sentiment": res})
    print(res)
    return res


if __name__ == "__main__":
    app.run(debug=True)
