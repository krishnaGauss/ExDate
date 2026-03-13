import yfinance as yf
import pandas as pd
import numpy as np
import time

MAX_RECOVERY_CAP = 250  # Cap for non-recovered stocks (reduces survivorship bias)

def build_dividend_dataset():
    print("Starting Nifty 500 Dividend Data Pipeline (v2 — Enhanced Features)...")

    # 1. Load the official Nifty 500 list
    try:
        nifty500_df = pd.read_csv('ind_nifty500list.csv')
        tickers = nifty500_df['Symbol'].tolist()
    except FileNotFoundError:
        print("Error: ind_nifty500list.csv not found. Download it from niftyindices.com")
        return

    # Create an empty list to hold all our ML training rows
    ml_data = []

    # 2. Loop through every stock in the Nifty 500
    for i, symbol in enumerate(tickers):
        yahoo_ticker = f"{symbol}.NS"  # Must append .NS for Indian stocks
        print(f"[{i+1}/{len(tickers)}] Fetching 10-year history for {yahoo_ticker}...")

        try:
            stock = yf.Ticker(yahoo_ticker)

            # Fetch 10 years of daily data
            hist = stock.history(period="10y")

            if hist.empty:
                continue

            # Fetch the dividends for this stock
            dividends = stock.dividends

            if dividends.empty:
                continue

            # Pre-compute daily returns for the full history (used for volatility & momentum)
            hist.index = hist.index.tz_localize(None)
            hist['Daily_Return'] = hist['Close'].pct_change()

            # 3. The Algorithm: Find the Recovery Days + Engineered Features for each dividend
            for div_date, div_amount in dividends.items():
                # Convert timestamp to timezone-naive to match the history index
                div_date = div_date.tz_localize(None)

                # Ensure the dividend date exists in our historical price data
                if div_date not in hist.index:
                    continue

                # Get the integer index of the Ex-Date
                div_index = hist.index.get_loc(div_date)

                # Need at least 20 trading days of history before this date for features
                if div_index < 20:
                    continue

                # ── Core Price & Dividend Info ──
                pre_drop_price = hist.iloc[div_index - 1]['Close']
                ex_date_close = hist.iloc[div_index]['Close']
                yield_percent = (div_amount / pre_drop_price) * 100

                # ── Engineered Feature: Actual Price Drop % on Ex-Date ──
                price_drop_percent = ((pre_drop_price - ex_date_close) / pre_drop_price) * 100

                # ── Engineered Feature: Log Price (scale-invariant) ──
                log_price = round(np.log(pre_drop_price), 4)

                # ── Engineered Feature: 20-Day Volatility (std of daily returns) ──
                volatility_20d = hist['Daily_Return'].iloc[div_index - 20:div_index].std()

                # ── Engineered Feature: 5-Day Pre-Event Momentum ──
                price_5d_ago = hist.iloc[div_index - 5]['Close']
                return_5d_before = ((pre_drop_price - price_5d_ago) / price_5d_ago) * 100

                # ── Engineered Feature: Volume Ratio (ExDate vol / 20-day avg vol) ──
                avg_volume_20d = hist['Volume'].iloc[div_index - 20:div_index].mean()
                volume_on_exdate = hist.iloc[div_index]['Volume']
                volume_ratio = (volume_on_exdate / avg_volume_20d) if avg_volume_20d > 0 else 1.0

                # ── Engineered Feature: Calendar Effects ──
                day_of_week = div_date.weekday()   # 0=Mon, 4=Fri
                month = div_date.month             # 1-12

                # ── Find Recovery Days ──
                recovered = False
                recovery_days = MAX_RECOVERY_CAP  # Default: capped value for non-recovery

                # Look forward from the Ex-Date
                search_limit = min(div_index + MAX_RECOVERY_CAP, len(hist))
                for j in range(div_index, search_limit):
                    if hist.iloc[j]['Close'] >= pre_drop_price:
                        recovered = True
                        recovery_days = j - div_index
                        break

                # Include ALL events (recovered + capped non-recovered) to reduce survivorship bias
                ml_data.append({
                    'Symbol': symbol,
                    'Ex_Date': div_date.date(),
                    'Pre_Drop_Price': round(pre_drop_price, 2),
                    'Dividend_Amount': round(div_amount, 2),
                    'Yield_Percent': round(yield_percent, 2),
                    'Volume_On_ExDate': volume_on_exdate,
                    'Price_Drop_Percent': round(price_drop_percent, 4),
                    'Log_Price': log_price,
                    'Volatility_20d': round(volatility_20d, 6),
                    'Return_5d_Before': round(return_5d_before, 4),
                    'Volume_Ratio': round(volume_ratio, 4),
                    'Day_of_Week': day_of_week,
                    'Month': month,
                    'TARGET_Recovery_Days': recovery_days
                })

            # Sleep for 0.5 seconds so Yahoo doesn't block our IP for spamming
            time.sleep(0.5)

        except Exception as e:
            print(f"Error processing {yahoo_ticker}: {e}")
            continue

    # 4. Save to CSV for the ML Engine
    final_df = pd.DataFrame(ml_data)
    final_df.to_csv('ml_dividend_dataset.csv', index=False)

    print("\nPIPELINE COMPLETE!")
    print(f"Saved {len(final_df)} historical dividend events to ml_dividend_dataset.csv")
    print(f"Features: {list(final_df.columns)}")
    print("Ready for XGBoost Training v2!")

if __name__ == "__main__":
    build_dividend_dataset()