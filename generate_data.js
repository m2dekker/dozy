// Generate volatile BTC price data
const fs = require('fs');

function generateVolatileData() {
    const data = [];
    let currentPrice = 42000 + Math.random() * 2000; // Start between 42k-44k
    let timestamp = 1704067200; // Starting timestamp
    const numCandles = 500;

    // Trend state
    let trend = 'up'; // up, down, sideways
    let trendStrength = 0.5;
    let trendDuration = 0;

    for (let i = 0; i < numCandles; i++) {
        // Change trend occasionally
        if (trendDuration <= 0 || Math.random() < 0.02) {
            const rand = Math.random();
            if (rand < 0.35) {
                trend = 'up';
                trendStrength = 0.3 + Math.random() * 0.7;
            } else if (rand < 0.7) {
                trend = 'down';
                trendStrength = 0.3 + Math.random() * 0.7;
            } else {
                trend = 'sideways';
                trendStrength = 0.1 + Math.random() * 0.3;
            }
            trendDuration = 20 + Math.floor(Math.random() * 80);
        }
        trendDuration--;

        // Base volatility
        const baseVolatility = currentPrice * 0.002; // 0.2% base
        const volatility = baseVolatility * (1 + Math.random() * 2);

        // Trend movement
        let trendMove = 0;
        if (trend === 'up') {
            trendMove = volatility * trendStrength * (0.5 + Math.random());
        } else if (trend === 'down') {
            trendMove = -volatility * trendStrength * (0.5 + Math.random());
        } else {
            trendMove = volatility * (Math.random() - 0.5) * 0.3;
        }

        // Occasional big moves (spikes)
        if (Math.random() < 0.03) {
            const spike = (Math.random() - 0.5) * currentPrice * 0.015; // 1.5% spike
            trendMove += spike;
        }

        // Generate OHLC
        const open = currentPrice;
        const direction = Math.random() > 0.5 ? 1 : -1;

        // More volatile candles
        const bodySize = volatility * (0.5 + Math.random() * 2);
        const wickSize = volatility * (0.5 + Math.random() * 1.5);

        let close = open + trendMove + (direction * bodySize);
        let high = Math.max(open, close) + Math.random() * wickSize;
        let low = Math.min(open, close) - Math.random() * wickSize;

        // Ensure realistic spread
        if (high - low < currentPrice * 0.0005) {
            high = open + currentPrice * 0.001;
            low = open - currentPrice * 0.001;
        }

        // Volume variation
        const volume = 50 + Math.random() * 500;

        data.push({
            time: timestamp,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: parseFloat(volume.toFixed(1))
        });

        currentPrice = close;
        timestamp += 60; // 1 minute intervals
    }

    return data;
}

const jsonData = {
    symbol: "BTC/USD",
    timeframe: "1m",
    data: generateVolatileData()
};

console.log(JSON.stringify(jsonData, null, 2));
