import yfinance as yf
import pandas as pd
import numpy as np
import xgboost as xgb
from datetime import datetime

def test_live_dividend_prediction(symbol, dividend_amount, ex_date_str):
    print(f"\nDIVIDROP AI: Live Inference for {symbol}")
    print("-" * 50)

    # 1. Fetch live market data (Last 2 months is enough for our rolling indicators)
    yahoo_ticker = f"{symbol}.NS"
    print(f"Fetching live market data for {yahoo_ticker}...")
    stock = yf.Ticker(yahoo_ticker)
    hist = stock.history(period="2mo")

    if hist.empty:
        print(f"Error: Failed to fetch data for {yahoo_ticker}")
        return

    # 2. Extract current market realities
    live_price = hist['Close'].iloc[-1]
    latest_volume = hist['Volume'].iloc[-1]
    
    # 3. Calculate the exact features your model requires
    # Date Features
    ex_date = datetime.strptime(ex_date_str, "%Y-%m-%d")
    month = ex_date.month
    day_of_week = ex_date.weekday()

    # Core Dividend Features
    yield_percent = (dividend_amount / live_price) * 100
    log_price = np.log(live_price)
    
    # For a future prediction, the expected price drop is exactly the dividend yield
    expected_price_drop_pct = yield_percent 

    # Rolling Momentum & Risk Features
    # 5-Day Return
    price_5d_ago = hist['Close'].iloc[-6]
    return_5d_before = ((live_price - price_5d_ago) / price_5d_ago) * 100

    # 20-Day Volatility (Annualized standard deviation of daily returns)
    daily_returns = hist['Close'].pct_change().dropna()
    volatility_20d = daily_returns.tail(20).std() * np.sqrt(252) * 100

    # Volume Ratio (Latest volume / 20-day average volume)
    avg_volume_20d = hist['Volume'].tail(20).mean()
    volume_ratio = latest_volume / avg_volume_20d if avg_volume_20d > 0 else 1.0

    # 4. Construct the Payload exactly as the model expects it
    # FIXED: The column order MUST perfectly match the training data order!
    payload = pd.DataFrame([{
        'Yield_Percent': yield_percent,
        'Volume_On_ExDate': latest_volume,
        'Price_Drop_Percent': expected_price_drop_pct,
        'Log_Price': log_price,
        'Volatility_20d': volatility_20d,
        'Return_5d_Before': return_5d_before,
        'Volume_Ratio': volume_ratio,
        'Day_of_Week': day_of_week,
        'Month': month
    }])

    print("\n🔬 Extracted Features:")
    for col in payload.columns:
        print(f"   ➤ {col}: {payload[col].iloc[0]:.2f}")

    # 5. Load the Brain and Predict
    try:
        model = xgb.XGBRegressor()
        model.load_model('dividend_recovery_model_v2.json')
    except Exception as e:
        print(f"\nError loading model: {e}")
        print("Ensure 'dividend_recovery_model_v2.json' is in the same folder.")
        return

    # Run the prediction
    prediction = model.predict(payload)[0]

    # Your MAE from training was ~5.32 days. We use this to build the Confidence Band.
    mae = 5.32
    min_days = max(1, int(round(prediction - (mae / 2)))) # Ensure it doesn't predict negative days
    max_days = int(round(prediction + (mae / 2)))

    # 6. The UI Output Translation
    print("\n==================================================")
    print(f"STOCK: {symbol} | DIVIDEND: ₹{dividend_amount} | PRICE: ₹{live_price:.2f}")
    print("==================================================")
    print(f"RAW AI PREDICTION: {prediction:.1f} Trading Days")
    
    print("\n📱 WHAT THE USER SEES IN THE UI:")
    if prediction < 10:
        print(f"   FAST RECOVERY EXPECTED: {min_days} to {max_days} Days")
    elif prediction < 30:
        print(f"   ⏳ MODERATE RECOVERY: {min_days} to {max_days} Days")
    else:
        print(f"   ⚠️ YIELD TRAP DETECTED: Capital locked for {min_days}+ Days")
    print("==================================================\n")

if __name__ == "__main__":
    # Example Test Case 1: ITC (Usually a fast recoverer)
    test_live_dividend_prediction(
        symbol="IOC", 
        dividend_amount=5.00, 
        ex_date_str="2025-12-18"
    )

    # Example Test Case 2: VEDL (Vedanta - High yield, usually slower recovery)
    test_live_dividend_prediction(
        symbol="JARO", 
        dividend_amount=2.00, 
        ex_date_str="2026-01-16"
    )