# 💬 SentimentAnalyzer-AI

> Real-time sentiment analysis with multi-dimensional scoring, social media monitoring, and trend visualization — powered by MiMo V2.5

## Why This Exists

Understanding how people feel about your product, brand, or message has never been more critical — or more difficult. Social media generates billions of opinions daily across Twitter, Reddit, reviews, forums, and comment sections. Manual sentiment tracking is impossible at this scale, and naive keyword-based approaches fail catastrophically on sarcasm, context-dependent language, and nuanced emotional expressions.

SentimentAnalyzer-AI goes beyond simple positive/negative classification. Powered by MiMo V2.5's deep language understanding, it captures the full spectrum of sentiment — including mixed emotions, confidence levels, aspect-level opinions, and temporal trends. It understands that "This product is sick" might be a compliment and "Great, another update that breaks everything" is dripping with sarcasm.

The platform is designed for product managers, brand strategists, social media teams, and researchers who need to monitor public opinion in real time. Track sentiment across platforms, detect emerging crises before they trend, understand which features users love or hate, and measure the impact of campaigns — all through an intuitive social-media-themed dashboard.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   SentimentAnalyzer-AI Pipeline                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │              │    │              │    │              │      │
│  │  Text Input  │───▶│ Preprocessor │───▶│  Sentiment   │      │
│  │  (Social,    │    │   Engine     │    │    Model     │      │
│  │   Reviews)   │    │              │    │              │      │
│  │              │    │              │    │              │      │
│  └──────────────┘    └──────────────┘    └──────┬───────┘      │
│                                                 │              │
│                                                 ▼              │
│                  ┌──────────────┐    ┌──────────────┐          │
│                  │              │    │              │          │
│                  │ Aggregation  │───▶│  Dashboard   │          │
│                  │   Engine     │    │  & Feed      │          │
│                  │              │    │              │          │
│                  └──────────────┘    └──────────────┘          │
│                                                                 │
│  Input: Raw text (reviews, posts, comments)                     │
│  Output: Sentiment scores + Trends + Social feed                 │
└─────────────────────────────────────────────────────────────────┘
```

## Token Consumption Model

| Pipeline Stage          | Tokens per Run | Description                                          |
|-------------------------|----------------|------------------------------------------------------|
| ✂️ Preprocessor          | 50K            | Tokenization, cleaning, language detection, encoding |
| 🧠 Sentiment Model      | 300K           | Multi-class classification, aspect extraction, NER   |
| 📊 Aggregation & Viz    | 150K           | Trend computation, gauge rendering, feed generation  |
| **Total**               | **500K**       | End-to-end sentiment analysis pipeline               |

## Features

- **Text Input Analysis** — Paste text or enter comments for instant multi-dimensional sentiment scoring
- **Sentiment Gauge** — Semi-circular visual gauge showing positive/negative/neutral breakdown in real time
- **Trend Charts** — Track sentiment over time with CSS-based sparklines and area charts
- **Social Feed Monitor** — Live stream of posts with per-message sentiment tags and color coding
- **Aspect-Level Analysis** — Identifies sentiment toward specific features, topics, or entities within text
- **Sarcasm Detection** — Advanced understanding of irony, sarcasm, and context-dependent language
- **Multi-Platform Scoring** — Aggregate sentiment across Twitter, Reddit, reviews, and custom sources
- **Crisis Detection** — Alerts when negative sentiment spikes beyond normal variance thresholds
- **Social Media Theme** — Modern, colorful interface inspired by popular social platforms

## Tech Stack

- **Frontend** — Vanilla HTML5 / CSS3 / JavaScript (ES6+)
- **Styling** — Social-media-inspired CSS with gradients, cards, and animated gauges
- **Logic** — Client-side NLP processing, sentiment scoring, and chart rendering
- **AI Engine** — MiMo V2.5 by Nous Research
- **Deployment** — Static files, works in any modern browser

## Quick Start

```bash
# Clone the repository
git clone https://github.com/nousresearch/SentimentAnalyzer-AI.git
cd SentimentAnalyzer-AI

# Open directly in your browser
open index.html

# Or serve locally
python3 -m http.server 8080
# Navigate to http://localhost:8080
```

## Project Structure

```
SentimentAnalyzer-AI/
├── index.html          # Social dashboard with gauge, feed, & input panels
├── style.css           # Social media theme with gradient cards & animations
├── app.js              # NLP pipeline, sentiment engine, & visualization logic
└── README.md           # This file
```

---

> Built with MiMo V2.5 — [Nous Research](https://nousresearch.com)
