import yfinance as yf
import pandas as pd
import numpy as np
import xgboost as xgb
from datetime import datetime

def backtest_past_dividend(symbol, ex_date_str, dividend_amount):
    print(f"\nTIME TRAVEL INFERENCE: {symbol} on {ex_date_str}")
    print("-" * 60)

    # 1. Fetch 5 years of historical data to ensure we have enough context
    yahoo_ticker = f"{symbol}.NS"
    stock = yf.Ticker(yahoo_ticker)
    hist = stock.history(period="5y")

    if hist.empty:
        print(f"Error: Failed to fetch data for {yahoo_ticker}")
        return

    # Remove timezone info so we can easily match the string dates
    hist.index = hist.index.tz_localize(None)
    ex_date = datetime.strptime(ex_date_str, "%Y-%m-%d")

    # 2. Find the exact row for this Ex-Date in history
    if ex_date not in hist.index:
        print(f"Error: {ex_date_str} is not a valid trading day in the dataset.")
        print("Ensure the date falls on a weekday and is not a market holiday.")
        return

    div_index = hist.index.get_loc(ex_date)

    if div_index < 30:
        print("Error: Not enough historical data prior to this date to calculate rolling features.")
        return

    # 3. Simulate "Standing on the day BEFORE the Ex-Date"
    pre_drop_price = hist['Close'].iloc[div_index - 1]
    latest_volume = hist['Volume'].iloc[div_index - 1]

    # Calculate exactly what the model expects
    yield_percent = (dividend_amount / pre_drop_price) * 100
    log_price = np.log(pre_drop_price)
    
    # We use yield as the proxy for the expected drop (matching our live script)
    expected_price_drop_pct = yield_percent 

    # Rolling Momentum & Risk Features (strictly up to the day BEFORE)
    price_5d_ago = hist['Close'].iloc[div_index - 6]
    return_5d_before = ((pre_drop_price - price_5d_ago) / price_5d_ago) * 100

    daily_returns = hist['Close'].iloc[:div_index].pct_change().dropna()
    volatility_20d = daily_returns.tail(20).std() * np.sqrt(252) * 100

    avg_volume_20d = hist['Volume'].iloc[div_index-21:div_index-1].mean()
    volume_ratio = latest_volume / avg_volume_20d if avg_volume_20d > 0 else 1.0

    # 4. Construct Payload (matching your exact trained order)
    payload = pd.DataFrame([{
        'Yield_Percent': yield_percent,
        'Volume_On_ExDate': latest_volume,
        'Price_Drop_Percent': expected_price_drop_pct,
        'Log_Price': log_price,
        'Volatility_20d': volatility_20d,
        'Return_5d_Before': return_5d_before,
        'Volume_Ratio': volume_ratio,
        'Day_of_Week': ex_date.weekday(),
        'Month': ex_date.month
    }])

    # 5. Load Model and Predict
    try:
        model = xgb.XGBRegressor()
        model.load_model('dividend_recovery_model_v2.json')
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    prediction = model.predict(payload)[0]
    
    # Apply your MAE for the confidence band
    mae = 5.32 
    min_days = max(1, int(round(prediction - (mae / 2))))
    max_days = int(round(prediction + (mae / 2)))

    # 6. Calculate the ACTUAL TRUTH (What really happened)
    recovered = False
    actual_days = 0
    
    # Look forward from the Ex-Date to see when the price crossed the pre-drop line
    for j in range(div_index, len(hist)):
        if hist['Close'].iloc[j] >= pre_drop_price:
            recovered = True
            actual_days = j - div_index
            break

    # 7. Print the Verdict
    print(f"Pre-Drop Price (Day Before): ₹{pre_drop_price:.2f}")
    print(f"Dividend Declared: ₹{dividend_amount} (Yield: {yield_percent:.2f}%)")
    print("\nAI PREDICTION (Blind to the future):")
    print(f"   ➤ Estimated Recovery: {prediction:.1f} Days")
    print(f"   ➤ Confidence Band: {min_days} to {max_days} Trading Days")
    
    print("\nACTUAL HISTORICAL REALITY:")
    if recovered:
        if actual_days == 0:
            print(f"   Recovered on the EXACT SAME DAY! (Extreme buying pressure)")
        else:
            print(f"   Recovered in exactly {actual_days} trading days.")
            
        # Check if the AI was right
        if min_days <= actual_days <= max_days:
            print("   VERDICT: BULLSEYE! The AI predicted the exact window.")
        else:
            off_by = abs(prediction - actual_days)
            print(f"   🤔 VERDICT: AI missed by {off_by:.1f} days.")
    else:
        days_stuck = len(hist) - 1 - div_index
        print(f"   ❌ YIELD TRAP: It has been {days_stuck} days and it STILL hasn't recovered!")

    print("============================================================\n")


if __name__ == "__main__":
    # Let's test it against some famous historical dividends
    
    # ITC Interim Dividend - Ex-Date: Feb 8, 2024 (Amount: ₹6.25)
    backtest_past_dividend(symbol="IOC", ex_date_str="2025-12-18", dividend_amount=5.00)
    
    # Vedanta Massive Dividend - Ex-Date: April 6, 2023 (Amount: ₹20.50)
    backtest_past_dividend(symbol="JARO",ex_date_str="2026-01-16", dividend_amount=2.00)