// SentimentAnalyzer-AI — Full Sentiment Analysis Tool
// ============================================================

const sentimentHistory = JSON.parse(localStorage.getItem('sa_history') || '[]');
let lastAnalysis = null;

// ---- Sentiment Dictionaries ----
const POSITIVE_WORDS = new Set([
  'good','great','excellent','amazing','wonderful','fantastic','awesome','love','loved','best',
  'happy','beautiful','perfect','brilliant','outstanding','superb','nice','like','liked','enjoy',
  'pleased','impressive','remarkable','incredible','delightful','magnificent','splendid','terrific',
  'fabulous','awesome','phenomenal','stellar','exceptional','superior','top-notch','first-rate',
  'positive','upbeat','cheerful','glad','thrilled','excited','grateful','satisfied','comfortable',
  'recommend','recommended','pleasant','smooth','fast','quick','efficient','reliable','quality',
  'elegant','stylish','innovative','creative','fun','entertaining','refreshing','charming','warm',
  'friendly','helpful','supportive','kind','generous','caring','gentle','patient','tolerant'
]);

const NEGATIVE_WORDS = new Set([
  'bad','terrible','awful','horrible','worst','hate','hated','poor','ugly','boring','slow',
  'disappointing','disappointed','frustrating','frustrated','annoying','annoyed','useless',
  'broken','defective','waste','problem','issue','fail','failed','failure','crash','crashed',
  'error','bug','glitch','laggy','lag','expensive','overpriced','cheap','uncomfortable','painful',
  'difficult','confusing','complicated','messy','ugly','rude','unfriendly','unhelpful',
  'mediocre','average','bland','dull','lacking','insufficient','inadequate','subpar',
  'horrendous','dreadful','atrocious','abysmal','disgraceful','pathetic','lousy','crappy',
  'refund','complaint','unacceptable','neglect','neglected','dangerous','unsafe','risk'
]);

const INTENSIFIERS = new Set([
  'very','extremely','incredibly','absolutely','totally','completely','utterly','really',
  'truly','highly','deeply','remarkably','exceedingly','thoroughly','particularly','especially'
]);

const NEGATORS = new Set([
  'not',"don't","doesn't","didn't","wasn't","weren't","isn't","aren't","no","never",
  'neither','nor','hardly','barely','scarcely',"couldn't","wouldn't","shouldn't"
]);

// ---- Aspect Categories ----
const ASPECT_KEYWORDS = {
  'Quality': ['quality','material','build','construction','craftsmanship','finish','durable','durability','solid'],
  'Service': ['service','staff','support','help','representative','agent','team','response','customer'],
  'Price': ['price','cost','value','expensive','cheap','affordable','worth','money','budget','overpriced'],
  'Performance': ['performance','speed','fast','slow','quick','efficient','powerful','responsive','lag'],
  'Design': ['design','look','style','appearance','aesthetic','beautiful','ugly','elegant','sleek'],
  'Usability': ['easy','difficult','intuitive','confusing','user-friendly','complicated','simple','convenient','accessible'],
  'Delivery': ['delivery','shipping','arrived','fast','late','delayed','packaging','package','transit'],
  'Reliability': ['reliable','reliability','consistent','dependable','stable','break','broken','defective']
};

// ---- Preset Texts ----
const PRESETS = {
  positive: "I absolutely love this product! The quality is outstanding and the design is beautiful. The customer service team was incredibly helpful when I had questions. It arrived quickly and the packaging was perfect. Highly recommend to anyone looking for something excellent. Best purchase I've made this year!",
  negative: "Very disappointed with this purchase. The product arrived damaged and the quality is terrible. Customer service was unhelpful and rude when I tried to get a refund. It's overpriced for what you get. The design looks cheap and it stopped working after just two days. Avoid this at all costs.",
  mixed: "The product itself is actually quite good and the design is sleek. Performance is impressive and it's very fast. However, the price is a bit expensive for what you get. Shipping was delayed and the packaging could be better. Customer support was okay but not great. Overall, decent but room for improvement.",
  neutral: "The product was delivered on Tuesday. It comes in three colors and has a one-year warranty. The specifications include 8GB RAM and 256GB storage. It weighs approximately 1.5 pounds and measures 12 by 8 inches. The manual provides setup instructions in multiple languages.",
  sarcastic: "Oh great, another 'premium' product that broke after one day. The 'customer service' that never responds is just the cherry on top. Nothing says 'quality' like a product that falls apart. Truly the best waste of money I've ever experienced. 10/10 would NOT recommend this disaster to anyone."
};

// ---- Initialization ----
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('historyModal').style.display = 'none';
});

// ---- Core Analysis ----
function analyzeText(text) {
  if (!text || text.trim().length === 0) {
    return { score: 0, sentiment: 'N/A', positive: 0, negative: 0, neutral: 0, keywords: [], aspects: {}, wordScores: [], rawScore: 0 };
  }

  const words = text.toLowerCase().replace(/[^a-z\s'-]/g, ' ').split(/\s+/).filter(w => w.length > 0);
  let totalScore = 0;
  let posCount = 0, negCount = 0, intCount = 0;
  const detectedKeywords = [];
  const wordScores = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let wordScore = 0;
    let type = 'neutral';
    const isNegated = i > 0 && NEGATORS.has(words[i - 1]);
    const isIntensified = i > 0 && INTENSIFIERS.has(words[i - 1]) || i > 1 && INTENSIFIERS.has(words[i - 2]);

    if (POSITIVE_WORDS.has(word)) {
      wordScore = isIntensified ? 1.5 : 1;
      if (isNegated) { wordScore = -wordScore; type = 'negative'; negCount++; }
      else { type = 'positive'; posCount++; }
      detectedKeywords.push({ word, type, score: wordScore });
    } else if (NEGATIVE_WORDS.has(word)) {
      wordScore = isIntensified ? -1.5 : -1;
      if (isNegated) { wordScore = Math.abs(wordScore); type = 'positive'; posCount++; }
      else { type = 'negative'; negCount++; }
      detectedKeywords.push({ word, type, score: wordScore });
    } else if (INTENSIFIERS.has(word)) {
      intCount++;
    } else {
      wordScore = 0;
    }

    totalScore += wordScore;
    wordScores.push({ word, score: wordScore, type });
  }

  // Normalize score to -1 to 1
  const maxPossible = Math.max(words.length, 1);
  const normalizedScore = Math.max(-1, Math.min(1, totalScore / Math.max(maxPossible * 0.3, 1)));

  // Calculate percentages
  const total = posCount + negCount + 1; // +1 for neutral base
  const posPct = Math.round((posCount / Math.max(total, 1)) * 100);
  const negPct = Math.round((negCount / Math.max(total, 1)) * 100);
  const neuPct = Math.max(0, 100 - posPct - negPct);

  // Determine overall sentiment
  let sentiment;
  if (normalizedScore > 0.15) sentiment = 'Positive';
  else if (normalizedScore < -0.15) sentiment = 'Negative';
  else sentiment = 'Neutral';

  // Aspect-based analysis
  const aspects = analyzeAspects(text);

  return {
    score: normalizedScore,
    sentiment,
    positive: posPct,
    negative: negPct,
    neutral: neuPct,
    keywords: detectedKeywords,
    aspects,
    wordScores,
    rawScore: totalScore,
    text
  };
}

function analyzeAspects(text) {
  const lowerText = text.toLowerCase();
  const results = {};

  Object.entries(ASPECT_KEYWORDS).forEach(([aspect, keywords]) => {
    const found = keywords.filter(k => lowerText.includes(k));
    if (found.length === 0) return;

    // Find sentences containing aspect keywords
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let aspectScore = 0;
    let sentenceCount = 0;

    sentences.forEach(sentence => {
      const sLower = sentence.toLowerCase();
      if (found.some(k => sLower.includes(k))) {
        const words = sLower.replace(/[^a-z\s'-]/g, ' ').split(/\s+/).filter(w => w.length > 0);
        let sentScore = 0;
        for (let i = 0; i < words.length; i++) {
          const isNegated = i > 0 && NEGATORS.has(words[i - 1]);
          const isIntensified = (i > 0 && INTENSIFIERS.has(words[i-1])) || (i > 1 && INTENSIFIERS.has(words[i-2]));
          if (POSITIVE_WORDS.has(words[i])) {
            sentScore += (isIntensified ? 1.5 : 1) * (isNegated ? -1 : 1);
          } else if (NEGATIVE_WORDS.has(words[i])) {
            sentScore += (isIntensified ? -1.5 : -1) * (isNegated ? -1 : 1);
          }
        }
        aspectScore += sentScore;
        sentenceCount++;
      }
    });

    if (sentenceCount > 0) {
      const normalized = Math.max(-1, Math.min(1, aspectScore / (sentenceCount * 2)));
      results[aspect] = { score: normalized, keywords: found, sentences: sentenceCount };
    }
  });

  return results;
}

// ---- Realtime Analysis ----
function analyzeRealtime() {
  const text = document.getElementById('textInput').value;
  const result = analyzeText(text);
  lastAnalysis = result;

  // Update score circle
  const circle = document.getElementById('scoreCircle');
  const scoreVal = document.getElementById('scoreValue');
  const scoreLbl = document.getElementById('scoreLabel');
  circle.className = 'score-circle ' + (result.score > 0.15 ? 'positive' : result.score < -0.15 ? 'negative' : 'neutral');
  scoreVal.textContent = result.score.toFixed(2);
  scoreLbl.textContent = result.sentiment;

  // Update breakdown bars
  document.getElementById('barPositive').style.width = result.positive + '%';
  document.getElementById('valPositive').textContent = result.positive + '%';
  document.getElementById('barNeutral').style.width = result.neutral + '%';
  document.getElementById('valNeutral').textContent = result.neutral + '%';
  document.getElementById('barNegative').style.width = result.negative + '%';
  document.getElementById('valNegative').textContent = result.negative + '%';

  // Keywords
  const kwSection = document.getElementById('keywordsSection');
  const kwList = document.getElementById('keywordsList');
  if (result.keywords.length > 0) {
    kwSection.style.display = 'block';
    // Remove duplicates, keep highest score
    const unique = {};
    result.keywords.forEach(k => {
      if (!unique[k.word] || Math.abs(k.score) > Math.abs(unique[k.word].score)) unique[k.word] = k;
    });
    kwList.innerHTML = Object.values(unique).map(k =>
      `<span class="keyword-tag ${k.type}">${k.word} (${k.score > 0 ? '+' : ''}${k.score.toFixed(1)})</span>`
    ).join('');
  } else {
    kwSection.style.display = 'none';
  }

  // Aspects
  const aspSection = document.getElementById('aspectSection');
  const aspList = document.getElementById('aspectList');
  const aspectKeys = Object.keys(result.aspects);
  if (aspectKeys.length > 0) {
    aspSection.style.display = 'block';
    aspList.innerHTML = aspectKeys.map(asp => {
      const data = result.aspects[asp];
      const pct = ((data.score + 1) / 2 * 100).toFixed(0);
      const color = data.score > 0.15 ? '#4ade80' : data.score < -0.15 ? '#f87171' : '#60a5fa';
      return `<div class="aspect-item">
        <span class="aspect-name">${asp}</span>
        <div class="aspect-bar-bg">
          <div class="aspect-bar-center"></div>
          ${data.score >= 0
            ? `<div class="aspect-bar-pos" style="width:${(data.score/2*100).toFixed(0)}%;left:50%"></div>`
            : `<div class="aspect-bar-neg" style="width:${(Math.abs(data.score)/2*100).toFixed(0)}%;right:50%"></div>`
          }
        </div>
        <span class="aspect-score" style="color:${color}">${data.score > 0 ? '+' : ''}${data.score.toFixed(2)}</span>
      </div>`;
    }).join('');
  } else {
    aspSection.style.display = 'none';
  }

  // Word highlighting
  const hlSection = document.getElementById('highlightSection');
  const hlText = document.getElementById('highlightedText');
  if (text.trim().length > 0 && result.wordScores.length > 0) {
    hlSection.style.display = 'block';
    hlText.innerHTML = result.wordScores.map(ws => {
      const cls = ws.type === 'positive' ? 'hl-pos' : ws.type === 'negative' ? 'hl-neg' : ws.score !== 0 ? 'hl-int' : '';
      return cls ? `<span class="${cls}">${esc(ws.word)}</span>` : esc(ws.word);
    }).join(' ');
  } else {
    hlSection.style.display = 'none';
  }

  // Auto-save to history (debounced)
  clearTimeout(analyzeRealtime._debounce);
  analyzeRealtime._debounce = setTimeout(() => {
    if (text.trim().length > 10) {
      saveToHistory(text, result);
    }
  }, 2000);
}

// ---- Comparison Mode ----
function toggleCompare() {
  const panel = document.getElementById('comparePanel');
  const btn = document.getElementById('btnCompare');
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    btn.classList.add('btn-primary');
    btn.textContent = '🔀 Compare ON';
  } else {
    panel.style.display = 'none';
    btn.classList.remove('btn-primary');
    btn.textContent = '🔀 Compare Mode';
  }
}

function analyzeComparison() {
  const textA = document.getElementById('compareTextA').value;
  const textB = document.getElementById('compareTextB').value;
  const container = document.getElementById('compareResults');

  if (!textA.trim() && !textB.trim()) {
    container.innerHTML = '<p class="placeholder">Enter both texts to compare.</p>';
    return;
  }

  const resultA = analyzeText(textA);
  const resultB = analyzeText(textB);

  const diff = Math.abs(resultA.score - resultB.score);
  let verdict = '';
  if (diff < 0.1) verdict = 'Both texts have <strong>similar</strong> sentiment.';
  else if (resultA.score > resultB.score) verdict = `<strong>Text A</strong> is more positive by ${diff.toFixed(2)}`;
  else verdict = `<strong>Text B</strong> is more positive by ${diff.toFixed(2)}`;

  const colorA = resultA.score > 0.15 ? '#4ade80' : resultA.score < -0.15 ? '#f87171' : '#60a5fa';
  const colorB = resultB.score > 0.15 ? '#4ade80' : resultB.score < -0.15 ? '#f87171' : '#60a5fa';

  container.innerHTML = `
    <div class="compare-row">
      <div class="compare-card">
        <div class="cc-label">Text A</div>
        <div class="cc-score" style="color:${colorA}">${resultA.score.toFixed(2)}</div>
        <div class="cc-label2">${resultA.sentiment}</div>
      </div>
      <div style="font-size:24px;color:#64748b">⚡</div>
      <div class="compare-card">
        <div class="cc-label">Text B</div>
        <div class="cc-score" style="color:${colorB}">${resultB.score.toFixed(2)}</div>
        <div class="cc-label2">${resultB.sentiment}</div>
      </div>
    </div>
    <div class="compare-row">
      <div class="compare-card" style="min-width:100px">
        <div class="cc-label">A Positive</div>
        <div class="cc-score" style="color:#4ade80;font-size:18px">${resultA.positive}%</div>
      </div>
      <div class="compare-card" style="min-width:100px">
        <div class="cc-label">A Negative</div>
        <div class="cc-score" style="color:#f87171;font-size:18px">${resultA.negative}%</div>
      </div>
      <div class="compare-card" style="min-width:100px">
        <div class="cc-label">B Positive</div>
        <div class="cc-score" style="color:#4ade80;font-size:18px">${resultB.positive}%</div>
      </div>
      <div class="compare-card" style="min-width:100px">
        <div class="cc-label">B Negative</div>
        <div class="cc-score" style="color:#f87171;font-size:18px">${resultB.negative}%</div>
      </div>
    </div>
    <div class="compare-verdict">${verdict}</div>`;
}

// ---- Presets ----
function loadPreset() {
  const key = document.getElementById('presetSelect').value;
  if (PRESETS[key]) {
    document.getElementById('textInput').value = PRESETS[key];
    analyzeRealtime();
  }
}

// ---- History ----
function saveToHistory(text, result) {
  const entry = {
    text: text.substring(0, 200),
    score: result.score,
    sentiment: result.sentiment,
    timestamp: Date.now()
  };
  // Avoid duplicates
  const last = sentimentHistory[0];
  if (last && last.text === entry.text) return;
  sentimentHistory.unshift(entry);
  if (sentimentHistory.length > 100) sentimentHistory.length = 100;
  localStorage.setItem('sa_history', JSON.stringify(sentimentHistory));
}

function showHistory() {
  const list = document.getElementById('historyList');
  if (sentimentHistory.length === 0) {
    list.innerHTML = '<p class="placeholder">No analysis history yet.</p>';
  } else {
    list.innerHTML = sentimentHistory.map(h => {
      const color = h.score > 0.15 ? '#4ade80' : h.score < -0.15 ? '#f87171' : '#60a5fa';
      const time = new Date(h.timestamp).toLocaleString();
      return `<div class="history-entry">
        <span class="history-text" title="${esc(h.text)}">${esc(h.text)}</span>
        <span class="history-score" style="color:${color}">${h.score.toFixed(2)}</span>
        <span class="history-time">${time}</span>
      </div>`;
    }).join('');
  }
  document.getElementById('historyModal').style.display = 'flex';
}

function closeHistory() {
  document.getElementById('historyModal').style.display = 'none';
}

// ---- Export ----
function exportAnalysis() {
  const text = document.getElementById('textInput').value;
  const result = analyzeText(text);
  const exportData = {
    text: result.text,
    analysis: {
      score: result.score,
      sentiment: result.sentiment,
      positive_pct: result.positive,
      negative_pct: result.negative,
      neutral_pct: result.neutral,
      raw_score: result.rawScore
    },
    keywords: result.keywords,
    aspects: result.aspects,
    timestamp: new Date().toISOString(),
    method: 'keyword-based-sentiment-analysis',
    dictionary_size: { positive: POSITIVE_WORDS.size, negative: NEGATIVE_WORDS.size }
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sentiment_analysis_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearAll() {
  document.getElementById('textInput').value = '';
  document.getElementById('scoreValue').textContent = '0.00';
  document.getElementById('scoreLabel').textContent = 'N/A';
  document.getElementById('scoreCircle').className = 'score-circle';
  document.getElementById('barPositive').style.width = '0%';
  document.getElementById('barNeutral').style.width = '0%';
  document.getElementById('barNegative').style.width = '0%';
  document.getElementById('valPositive').textContent = '0%';
  document.getElementById('valNeutral').textContent = '0%';
  document.getElementById('valNegative').textContent = '0%';
  document.getElementById('keywordsSection').style.display = 'none';
  document.getElementById('aspectSection').style.display = 'none';
  document.getElementById('highlightSection').style.display = 'none';
  lastAnalysis = null;
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
