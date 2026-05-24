/* SentimentAnalyzer-AI — App Logic */
document.addEventListener('DOMContentLoaded', () => {
    // Tabs
    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.tab-view').forEach(t => t.classList.remove('active'));
            pill.classList.add('active');
            document.getElementById(pill.dataset.tab).classList.add('active');
        });
    });

    // Sentiment analyzer (keyword-based)
    const positiveWords = ['love', 'amazing', 'great', 'fantastic', 'excellent', 'awesome', 'wonderful', 'best', 'happy', 'perfect', 'beautiful', 'brilliant', 'outstanding', 'impressive', 'superb', 'delighted', 'incredible', 'enjoy', 'thank', 'good', 'nice', 'well', 'recommend', 'satisfied', 'pleased'];
    const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'worst', 'bad', 'poor', 'ugly', 'disappointed', 'disgusting', 'waste', 'boring', 'annoying', 'frustrating', 'broken', 'slow', 'useless', 'never', 'angry', 'sad', 'fail', 'problem', 'issue', 'error', 'crash'];

    function analyzeSentiment(text) {
        const lower = text.toLowerCase();
        const words = lower.split(/\s+/);
        let posCount = 0, negCount = 0;

        words.forEach(w => {
            const clean = w.replace(/[^a-z]/g, '');
            if (positiveWords.includes(clean)) posCount++;
            if (negativeWords.includes(clean)) negCount++;
        });

        const total = Math.max(posCount + negCount, 1);
        const pos = Math.min(100, Math.round((posCount / Math.max(words.length * 0.15, 1)) * 100));
        const neg = Math.min(100, Math.round((negCount / Math.max(words.length * 0.15, 1)) * 100));
        const neu = Math.max(0, 100 - pos - neg);

        // Normalize
        const sum = pos + neg + neu || 1;
        return {
            positive: Math.round(pos / sum * 100),
            neutral: Math.round(neu / sum * 100),
            negative: Math.round(neg / sum * 100),
            score: (pos - neg) / Math.max(words.length, 1),
        };
    }

    function updateGauge(sentiment) {
        const avg = sentiment.positive - sentiment.negative;
        const angle = -90 + ((avg + 100) / 200) * 180;
        const needle = document.getElementById('gauge-needle');
        needle.setAttribute('transform', `rotate(${angle}, 100, 110)`);

        // Update gauge segments
        document.getElementById('gauge-negative').style.opacity = sentiment.negative > 0 ? 0.3 + (sentiment.negative / 100) * 0.7 : 0.2;
        document.getElementById('gauge-neutral').style.opacity = sentiment.neutral > 0 ? 0.3 + (sentiment.neutral / 100) * 0.7 : 0.2;
        document.getElementById('gauge-positive').style.opacity = sentiment.positive > 0 ? 0.3 + (sentiment.positive / 100) * 0.7 : 0.2;

        // Label
        const label = document.getElementById('gauge-label');
        if (sentiment.positive > sentiment.negative * 2) {
            label.textContent = 'Positive';
            label.className = 'gauge-label positive';
        } else if (sentiment.negative > sentiment.positive * 2) {
            label.textContent = 'Negative';
            label.className = 'gauge-label negative';
        } else {
            label.textContent = 'Mixed';
            label.className = 'gauge-label neutral';
        }

        // Bars
        document.getElementById('pos-bar').style.width = sentiment.positive + '%';
        document.getElementById('neu-bar').style.width = sentiment.neutral + '%';
        document.getElementById('neg-bar').style.width = sentiment.negative + '%';
        document.getElementById('pos-val').textContent = sentiment.positive + '%';
        document.getElementById('neu-val').textContent = sentiment.neutral + '%';
        document.getElementById('neg-val').textContent = sentiment.negative + '%';

        // Indicators
        const indicators = [];
        if (sentiment.positive > 60) indicators.push({ text: 'Strong positive tone', cls: 'positive' });
        if (sentiment.negative > 60) indicators.push({ text: 'Strong negative tone', cls: 'negative' });
        if (sentiment.neutral > 50) indicators.push({ text: 'Mostly neutral', cls: 'neutral' });
        if (sentiment.positive > 40 && sentiment.negative > 20) indicators.push({ text: 'Mixed signals', cls: 'neutral' });

        const text = document.getElementById('text-input').value.toLowerCase();
        if (text.includes('!')) indicators.push({ text: 'Exclamation marks', cls: 'positive' });
        if (text.includes('?')) indicators.push({ text: 'Contains questions', cls: 'neutral' });
        if (/\b(all caps|CAPS)\b/.test(text) || text === text.toUpperCase() && text.length > 5) {
            indicators.push({ text: 'ALL CAPS detected', cls: 'negative' });
        }
        if (text.includes('but') || text.includes('however') || text.includes('although')) {
            indicators.push({ text: 'Contrast words found', cls: 'neutral' });
        }

        if (indicators.length === 0) indicators.push({ text: 'No strong indicators', cls: 'neutral' });

        document.getElementById('indicators').innerHTML = indicators.map(i =>
            `<span class="indicator ${i.cls}">${i.text}</span>`
        ).join('');
    }

    // Analyze button
    document.getElementById('analyze-btn').addEventListener('click', () => {
        const text = document.getElementById('text-input').value.trim();
        if (!text) return;
        const sentiment = analyzeSentiment(text);
        updateGauge(sentiment);
    });

    // Character count
    document.getElementById('text-input').addEventListener('input', (e) => {
        document.getElementById('char-count').textContent = e.target.value.length;
    });

    // Sample button
    const samples = [
        "I absolutely love this product! The quality is amazing and customer service was fantastic. Best purchase I've made this year!",
        "Terrible experience. The product broke after one day and customer support was completely useless. Very disappointed.",
        "It's okay, nothing special. Does what it's supposed to do but nothing impressive. Average product for the price.",
        "Just received my order and I'm so impressed! The packaging was beautiful and the product exceeds all expectations. Highly recommend!",
        "Worst purchase ever. Don't waste your money. The product is slow, buggy, and the instructions are confusing. Awful experience."
    ];

    document.getElementById('sample-btn').addEventListener('click', () => {
        document.getElementById('text-input').value = samples[Math.floor(Math.random() * samples.length)];
        document.getElementById('char-count').textContent = document.getElementById('text-input').value.length;
    });

    // Social Feed
    const posts = [
        { avatar: '👩‍💻', user: 'TechReview Pro', handle: '@techreviewpro', platform: 'twitter', time: '2m ago', text: 'Just tried the new AI-powered editor and it\'s absolutely incredible! The code suggestions are spot on. Game changer for productivity! 🚀', sentiment: 'positive', score: 92 },
        { avatar: '👨‍🎨', user: 'Design Daily', handle: '@designdaily', platform: 'twitter', time: '5m ago', text: 'This software update broke half my plugins. Frustrating experience. The QA team needs to do better. #frustrated', sentiment: 'negative', score: -78 },
        { avatar: '🏢', user: 'Sarah Miller', handle: 'sarah.miller', platform: 'linkedin', time: '12m ago', text: 'Excited to announce our team has reached a new milestone. Grateful for everyone\'s hard work and dedication over the past quarter.', sentiment: 'positive', score: 85 },
        { avatar: '📱', user: 'AppFan2024', handle: 'appfan2024', platform: 'reddit', time: '18m ago', text: 'The new update is decent. Some nice features but nothing revolutionary. It works fine for basic tasks.', sentiment: 'neutral', score: 12 },
        { avatar: '🎮', user: 'GameStream Live', handle: '@gamestreamlive', platform: 'twitter', time: '25m ago', text: 'Horrible lag issues tonight. The streaming quality is terrible and the app keeps crashing. Worst streaming experience ever.', sentiment: 'negative', score: -85 },
        { avatar: '📚', user: 'BookWorm Reads', handle: '@bookwormreads', platform: 'reddit', time: '30m ago', text: 'This book recommendation algorithm is fantastic! Found three amazing books I never would have discovered. Love it! 📖', sentiment: 'positive', score: 88 },
        { avatar: '💼', user: 'Startup Founder', handle: 'startupfounder', platform: 'linkedin', time: '35m ago', text: 'Mixed results from our latest experiment. Some positive indicators but also some concerning trends we need to address.', sentiment: 'neutral', score: 15 },
        { avatar: '🎵', user: 'Music Critic', handle: '@musiccritic', platform: 'twitter', time: '40m ago', text: 'Absolutely stunning album! Every track is a masterpiece. This is going to be the album of the year, no doubt about it!', sentiment: 'positive', score: 95 },
    ];

    document.getElementById('feed-list').innerHTML = posts.map(p => `
        <div class="feed-post">
            <div class="feed-header">
                <div class="feed-avatar">${p.avatar}</div>
                <div>
                    <div class="feed-user">${p.user}</div>
                    <div class="feed-handle">${p.handle}</div>
                </div>
                <span class="feed-platform ${p.platform}">${p.platform}</span>
                <span class="feed-time">${p.time}</span>
            </div>
            <div class="feed-text">${p.text}</div>
            <div class="feed-sentiment ${p.sentiment}">
                ${p.sentiment === 'positive' ? '😊' : p.sentiment === 'negative' ? '😠' : '😐'}
                ${p.sentiment.charAt(0).toUpperCase() + p.sentiment.slice(1)} (${Math.abs(p.score)}%)
            </div>
        </div>
    `).join('');

    // Mini chart
    const miniData = [65, 72, 58, 81, 45, 92, 78, 63, 88, 71, 55, 84, 69, 93, 76];
    document.getElementById('mini-chart').innerHTML = miniData.map(v => {
        const color = v > 70 ? 'var(--positive)' : v > 40 ? 'var(--neutral)' : 'var(--negative)';
        return `<div class="mini-bar" style="height: ${v}%; background: ${color}"></div>`;
    }).join('');

    // Topics
    document.getElementById('topics-list').innerHTML = [
        ['#TechLaunch', '12.4K mentions'],
        ['#AIUpdate', '8.7K mentions'],
        ['#ProductReview', '6.2K mentions'],
        ['#CustomerService', '3.1K mentions'],
        ['#SoftwareBug', '2.8K mentions'],
    ].map(([tag, count]) => `
        <div class="topic-item">
            <span class="topic-name">${tag}</span>
            <span class="topic-mentions">${count}</span>
        </div>
    `).join('');

    // Trend Chart
    const trendData = [
        { pos: 62, neu: 25, neg: 13 },
        { pos: 58, neu: 28, neg: 14 },
        { pos: 71, neu: 20, neg: 9 },
        { pos: 65, neu: 22, neg: 13 },
        { pos: 54, neu: 30, neg: 16 },
        { pos: 68, neu: 21, neg: 11 },
        { pos: 73, neu: 18, neg: 9 },
        { pos: 60, neu: 27, neg: 13 },
        { pos: 77, neu: 16, neg: 7 },
        { pos: 70, neu: 20, neg: 10 },
        { pos: 63, neu: 24, neg: 13 },
        { pos: 81, neu: 14, neg: 5 },
        { pos: 75, neu: 17, neg: 8 },
        { pos: 69, neu: 21, neg: 10 },
        { pos: 84, neu: 12, neg: 4 },
    ];

    const trendYSteps = 5;
    document.getElementById('trend-y-axis').innerHTML = Array.from({ length: trendYSteps }, (_, i) => {
        return `<span>${100 - i * 25}%</span>`;
    }).join('');

    const trendHours = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM'];
    document.getElementById('trend-x-axis').innerHTML = trendHours.map(h => `<span>${h}</span>`).join('');

    function renderTrend() {
        document.getElementById('trend-area').innerHTML = `
            <div class="trend-bars">
                ${trendData.map(d => `
                    <div class="trend-bar-group">
                        <div class="trend-segment" style="height: ${d.pos}%; background: var(--positive)"></div>
                        <div class="trend-segment" style="height: ${d.neu}%; background: var(--neutral)"></div>
                        <div class="trend-segment" style="height: ${d.neg}%; background: var(--negative)"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTrend();

    const avgPos = Math.round(trendData.reduce((s, d) => s + d.pos, 0) / trendData.length);
    const avgNeg = Math.round(trendData.reduce((s, d) => s + d.neg, 0) / trendData.length);

    document.getElementById('trend-summary').textContent = `Average: ${avgPos}% positive, ${avgNeg}% negative`;

    document.getElementById('trend-stats').innerHTML = `
        <div class="trend-stat">
            <div class="trend-stat-val" style="color: var(--positive)">${avgPos}%</div>
            <div class="trend-stat-label">Avg Positive</div>
        </div>
        <div class="trend-stat">
            <div class="trend-stat-val" style="color: var(--neutral)">${100 - avgPos - avgNeg}%</div>
            <div class="trend-stat-label">Avg Neutral</div>
        </div>
        <div class="trend-stat">
            <div class="trend-stat-val" style="color: var(--negative)">${avgNeg}%</div>
            <div class="trend-stat-label">Avg Negative</div>
        </div>
        <div class="trend-stat">
            <div class="trend-stat-val" style="color: var(--accent)">${posts.length}</div>
            <div class="trend-stat-label">Posts Analyzed</div>
        </div>
    `;
});
