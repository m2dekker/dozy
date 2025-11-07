/**
 * Trading Simulator
 * A browser-based trading simulator with historical price playback
 */

// ==================== STATE MANAGEMENT ====================

const state = {
    // Chart and data
    chart: null,
    candlestickSeries: null,
    allData: [],
    displayedData: [],
    currentIndex: 0,

    // Playback
    isPlaying: false,
    playbackSpeed: 2,
    playbackInterval: null,

    // Account
    initialBalance: 10000,
    balance: 10000,
    position: null, // { type: 'long' | 'short', entryPrice: number, size: number }

    // Statistics
    stats: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        trades: []
    }
};

// ==================== INITIALIZATION ====================

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Trading Simulator starting...');

    // Load data
    await loadData();

    // Initialize chart
    initChart();

    // Setup event listeners
    setupEventListeners();

    // Update UI
    updateUI();

    console.log('Trading Simulator ready!');
});

// ==================== DATA LOADING ====================

/**
 * Load historical price data from JSON file
 */
async function loadData() {
    try {
        const response = await fetch('data/sample_data.json');
        const jsonData = await response.json();

        state.allData = jsonData.data;

        // Update symbol info
        document.getElementById('symbol').textContent = jsonData.symbol || 'BTC/USD';
        document.getElementById('timeframe').textContent = jsonData.timeframe || '1m';

        console.log(`Loaded ${state.allData.length} candles`);

        // Show first few candles initially
        const initialCandles = Math.min(50, state.allData.length);
        state.displayedData = state.allData.slice(0, initialCandles);
        state.currentIndex = initialCandles;

    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load price data. Please check that data/sample_data.json exists.');
    }
}

// ==================== CHART SETUP ====================

/**
 * Initialize TradingView Lightweight Chart
 */
function initChart() {
    const container = document.getElementById('chart-container');

    // Create chart
    state.chart = LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: container.clientHeight,
        layout: {
            background: { color: 'transparent' },
            textColor: '#e0e0e0',
        },
        grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        timeScale: {
            borderColor: 'rgba(255, 255, 255, 0.2)',
            timeVisible: true,
            secondsVisible: false,
        },
    });

    // Create candlestick series
    state.candlestickSeries = state.chart.addCandlestickSeries({
        upColor: '#00ff88',
        downColor: '#ff4757',
        borderUpColor: '#00ff88',
        borderDownColor: '#ff4757',
        wickUpColor: '#00ff88',
        wickDownColor: '#ff4757',
    });

    // Set initial data
    state.candlestickSeries.setData(state.displayedData);

    // Handle window resize
    window.addEventListener('resize', () => {
        state.chart.applyOptions({
            width: container.clientWidth,
            height: container.clientHeight,
        });
    });
}

// ==================== PLAYBACK CONTROLS ====================

/**
 * Start playback
 */
function startPlayback() {
    if (state.isPlaying) return;

    // Check if we've reached the end
    if (state.currentIndex >= state.allData.length) {
        showSummaryModal();
        return;
    }

    state.isPlaying = true;

    // Update button states
    document.getElementById('play-btn').disabled = true;
    document.getElementById('pause-btn').disabled = false;

    // Calculate interval based on speed (base: 1000ms for 1x)
    const intervalMs = 1000 / state.playbackSpeed;

    // Start interval
    state.playbackInterval = setInterval(() => {
        addNextCandle();
    }, intervalMs);
}

/**
 * Pause playback
 */
function pausePlayback() {
    if (!state.isPlaying) return;

    state.isPlaying = false;

    // Update button states
    document.getElementById('play-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;

    // Clear interval
    if (state.playbackInterval) {
        clearInterval(state.playbackInterval);
        state.playbackInterval = null;
    }
}

/**
 * Change playback speed
 */
function changeSpeed(speed) {
    state.playbackSpeed = speed;

    // Update active button
    document.querySelectorAll('.btn-speed').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.speed) === speed) {
            btn.classList.add('active');
        }
    });

    // Restart playback if currently playing
    if (state.isPlaying) {
        pausePlayback();
        startPlayback();
    }
}

/**
 * Add next candle to chart
 */
function addNextCandle() {
    // Check if we've reached the end
    if (state.currentIndex >= state.allData.length) {
        pausePlayback();
        showSummaryModal();
        return;
    }

    // Add next candle
    const nextCandle = state.allData[state.currentIndex];
    state.displayedData.push(nextCandle);
    state.candlestickSeries.update(nextCandle);
    state.currentIndex++;

    // Update P&L if position is open
    if (state.position) {
        updatePnL(nextCandle.close);
    }

    // Update UI
    updateUI();
}

// ==================== TRADING LOGIC ====================

/**
 * Open a long position
 */
function openLong() {
    if (state.position) {
        alert('Close your current position first!');
        return;
    }

    const currentPrice = getCurrentPrice();
    if (!currentPrice) return;

    const positionSizePercent = parseFloat(document.getElementById('position-size').value);
    const positionSize = state.balance * positionSizePercent;

    state.position = {
        type: 'long',
        entryPrice: currentPrice,
        size: positionSize,
        contracts: positionSize / currentPrice
    };

    console.log('Opened LONG position:', state.position);
    updateUI();
}

/**
 * Open a short position
 */
function openShort() {
    if (state.position) {
        alert('Close your current position first!');
        return;
    }

    const currentPrice = getCurrentPrice();
    if (!currentPrice) return;

    const positionSizePercent = parseFloat(document.getElementById('position-size').value);
    const positionSize = state.balance * positionSizePercent;

    state.position = {
        type: 'short',
        entryPrice: currentPrice,
        size: positionSize,
        contracts: positionSize / currentPrice
    };

    console.log('Opened SHORT position:', state.position);
    updateUI();
}

/**
 * Close current position
 */
function closePosition() {
    if (!state.position) return;

    const currentPrice = getCurrentPrice();
    if (!currentPrice) return;

    // Calculate P&L
    let pnl = 0;
    if (state.position.type === 'long') {
        pnl = (currentPrice - state.position.entryPrice) * state.position.contracts;
    } else {
        pnl = (state.position.entryPrice - currentPrice) * state.position.contracts;
    }

    // Update balance
    state.balance += pnl;

    // Record trade
    const trade = {
        type: state.position.type,
        entryPrice: state.position.entryPrice,
        exitPrice: currentPrice,
        pnl: pnl,
        size: state.position.size
    };

    state.stats.trades.push(trade);
    state.stats.totalTrades++;
    state.stats.totalProfit += pnl;

    if (pnl > 0) {
        state.stats.winningTrades++;
    } else if (pnl < 0) {
        state.stats.losingTrades++;
    }

    console.log('Closed position:', trade);

    // Clear position
    state.position = null;

    // Update UI
    updateUI();
}

/**
 * Get current price (latest candle close)
 */
function getCurrentPrice() {
    if (state.displayedData.length === 0) return null;
    return state.displayedData[state.displayedData.length - 1].close;
}

/**
 * Update P&L for open position
 */
function updatePnL(currentPrice) {
    if (!state.position) return;

    let pnl = 0;
    if (state.position.type === 'long') {
        pnl = (currentPrice - state.position.entryPrice) * state.position.contracts;
    } else {
        pnl = (state.position.entryPrice - currentPrice) * state.position.contracts;
    }

    // Update UI with unrealized P&L
    const pnlElement = document.getElementById('pnl');
    const pnlPercentElement = document.getElementById('pnl-percent');

    pnlElement.textContent = `$${pnl.toFixed(2)}`;
    pnlPercentElement.textContent = `${((pnl / state.position.size) * 100).toFixed(2)}%`;

    // Update colors
    if (pnl > 0) {
        pnlElement.className = 'value profit';
        pnlPercentElement.className = 'value profit';
    } else if (pnl < 0) {
        pnlElement.className = 'value loss';
        pnlPercentElement.className = 'value loss';
    } else {
        pnlElement.className = 'value neutral';
        pnlPercentElement.className = 'value neutral';
    }
}

// ==================== UI UPDATES ====================

/**
 * Update all UI elements
 */
function updateUI() {
    updateAccountPanel();
    updateProgressInfo();
    updateStatisticsPanel();
    updateTradingButtons();
}

/**
 * Update account panel
 */
function updateAccountPanel() {
    // Balance
    document.getElementById('balance').textContent = `$${state.balance.toFixed(2)}`;

    // Position
    const positionElement = document.getElementById('position');
    if (state.position) {
        positionElement.textContent = state.position.type.toUpperCase();
        positionElement.className = state.position.type === 'long' ? 'value profit' : 'value loss';
    } else {
        positionElement.textContent = 'None';
        positionElement.className = 'value neutral';
    }

    // Entry Price
    const entryPriceElement = document.getElementById('entry-price');
    if (state.position) {
        entryPriceElement.textContent = `$${state.position.entryPrice.toFixed(2)}`;
    } else {
        entryPriceElement.textContent = '-';
    }

    // P&L
    if (!state.position) {
        document.getElementById('pnl').textContent = '$0.00';
        document.getElementById('pnl').className = 'value neutral';
        document.getElementById('pnl-percent').textContent = '0.00%';
        document.getElementById('pnl-percent').className = 'value neutral';
    }
}

/**
 * Update progress info
 */
function updateProgressInfo() {
    const progressText = document.getElementById('progress-text');
    progressText.textContent = `${state.currentIndex} / ${state.allData.length} candles`;
}

/**
 * Update statistics panel
 */
function updateStatisticsPanel() {
    document.getElementById('stat-trades').textContent = state.stats.totalTrades;
    document.getElementById('stat-wins').textContent = state.stats.winningTrades;
    document.getElementById('stat-losses').textContent = state.stats.losingTrades;

    // Win rate
    const winRate = state.stats.totalTrades > 0
        ? (state.stats.winningTrades / state.stats.totalTrades * 100).toFixed(2)
        : '0.00';
    document.getElementById('stat-winrate').textContent = `${winRate}%`;

    // Total profit
    const profitElement = document.getElementById('stat-profit');
    profitElement.textContent = `$${state.stats.totalProfit.toFixed(2)}`;
    if (state.stats.totalProfit > 0) {
        profitElement.className = 'profit';
    } else if (state.stats.totalProfit < 0) {
        profitElement.className = 'loss';
    } else {
        profitElement.className = 'neutral';
    }

    // Return percentage
    const returnPercent = ((state.balance - state.initialBalance) / state.initialBalance * 100).toFixed(2);
    const returnElement = document.getElementById('stat-return');
    returnElement.textContent = `${returnPercent}%`;
    if (returnPercent > 0) {
        returnElement.className = 'profit';
    } else if (returnPercent < 0) {
        returnElement.className = 'loss';
    } else {
        returnElement.className = 'neutral';
    }
}

/**
 * Update trading button states
 */
function updateTradingButtons() {
    const longBtn = document.getElementById('long-btn');
    const shortBtn = document.getElementById('short-btn');
    const closeBtn = document.getElementById('close-btn');

    if (state.position) {
        longBtn.disabled = true;
        shortBtn.disabled = true;
        closeBtn.disabled = false;
    } else {
        longBtn.disabled = false;
        shortBtn.disabled = false;
        closeBtn.disabled = true;
    }
}

// ==================== SESSION MANAGEMENT ====================

/**
 * Show summary modal
 */
function showSummaryModal() {
    const modal = document.getElementById('summary-modal');

    // Calculate final stats
    const finalBalance = state.balance;
    const totalPnL = finalBalance - state.initialBalance;
    const returnPercent = (totalPnL / state.initialBalance * 100).toFixed(2);
    const winRate = state.stats.totalTrades > 0
        ? (state.stats.winningTrades / state.stats.totalTrades * 100).toFixed(2)
        : '0.00';

    // Update modal content
    document.getElementById('summary-balance').textContent = `$${finalBalance.toFixed(2)}`;

    const pnlElement = document.getElementById('summary-pnl');
    pnlElement.textContent = `$${totalPnL.toFixed(2)}`;
    pnlElement.className = totalPnL >= 0 ? 'profit' : 'loss';

    const returnElement = document.getElementById('summary-return');
    returnElement.textContent = `${returnPercent}%`;
    returnElement.className = returnPercent >= 0 ? 'profit' : 'loss';

    document.getElementById('summary-trades').textContent = state.stats.totalTrades;
    document.getElementById('summary-winrate').textContent = `${winRate}%`;
    document.getElementById('summary-wins').textContent = state.stats.winningTrades;
    document.getElementById('summary-losses').textContent = state.stats.losingTrades;

    // Show modal
    modal.classList.add('show');
}

/**
 * Hide summary modal
 */
function hideSummaryModal() {
    const modal = document.getElementById('summary-modal');
    modal.classList.remove('show');
}

/**
 * Replay with new session
 */
async function replaySession() {
    // Close position if open
    if (state.position) {
        closePosition();
    }

    // Pause playback
    pausePlayback();

    // Reset state
    state.balance = state.initialBalance;
    state.position = null;
    state.stats = {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        trades: []
    };

    // Reload data (this will shuffle or load new data in future versions)
    await loadData();

    // Reset chart
    state.candlestickSeries.setData(state.displayedData);

    // Hide modal
    hideSummaryModal();

    // Update UI
    updateUI();

    console.log('Session restarted');
}

// ==================== EVENT LISTENERS ====================

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Playback controls
    document.getElementById('play-btn').addEventListener('click', startPlayback);
    document.getElementById('pause-btn').addEventListener('click', pausePlayback);

    // Speed controls
    document.querySelectorAll('.btn-speed').forEach(btn => {
        btn.addEventListener('click', () => {
            const speed = parseInt(btn.dataset.speed);
            changeSpeed(speed);
        });
    });

    // Trading controls
    document.getElementById('long-btn').addEventListener('click', openLong);
    document.getElementById('short-btn').addEventListener('click', openShort);
    document.getElementById('close-btn').addEventListener('click', closePosition);

    // Session controls
    document.getElementById('replay-btn').addEventListener('click', replaySession);
    document.getElementById('close-modal-btn').addEventListener('click', replaySession);
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format number as currency
 */
function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
}

/**
 * Format number as percentage
 */
function formatPercent(value) {
    return `${value.toFixed(2)}%`;
}

console.log('Script loaded successfully!');
