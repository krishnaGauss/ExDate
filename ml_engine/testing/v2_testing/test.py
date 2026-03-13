import pandas as pd
import yfinance as yf
import xgboost as xgb
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime
import sys
import warnings

# Suppress pandas warnings for cleaner terminal output
warnings.filterwarnings('ignore')

def run_mass_backtest_v2(csv_filepath, model_filepath):
    print(f"🏭 Starting V2 Quant AI Backtest Factory...")
    
    try:
        events_df = pd.read_csv(csv_filepath)
        total_records = len(events_df)
        print(f"📥 Loaded {total_records} dividend events to test.")
    except FileNotFoundError:
        print(f"❌ Error: Could not find {csv_filepath}")
        return

    try:
        model = xgb.XGBRegressor()
        model.load_model(model_filepath)
        print("🧠 V2 AI Model (9-Feature) loaded successfully.")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return

    history_cache = {}
    results = []
    mae_band = 5.32 

    successful_tests = 0
    skipped_records = 0
    error_records = 0

    print("\n⏳ Processing historical events...\n")
    
    for index, row in events_df.iterrows():
        progress = (index + 1) / total_records
        bar_length = 40
        filled_length = int(bar_length * progress)
        bar = '█' * filled_length + '-' * (bar_length - filled_length)
        sys.stdout.write(f'\r[{bar}] {progress*100:.1f}% ({index+1}/{total_records} records)')
        sys.stdout.flush()

        try:
            symbol = row['symbol']
            ex_date_str = row['ex_date']
            dividend_amount = float(row['dividend_amount'])
            
            yahoo_ticker = f"{symbol}.NS"
            
            if yahoo_ticker not in history_cache:
                stock = yf.Ticker(yahoo_ticker)
                hist = stock.history(period="max")
                if not hist.empty:
                    hist.index = hist.index.tz_localize(None)
                history_cache[yahoo_ticker] = hist
                
            hist = history_cache[yahoo_ticker]
            
            if hist.empty:
                skipped_records += 1
                continue
                
            target_date = datetime.strptime(ex_date_str, "%Y-%m-%d")
            valid_dates = hist.index[hist.index >= target_date]
            
            if len(valid_dates) == 0:
                skipped_records += 1
                continue
                
            actual_ex_date = valid_dates[0]
            div_index = hist.index.get_loc(actual_ex_date)

            if div_index < 21:
                skipped_records += 1
                continue

            # --- Extract V2 Features ---
            pre_drop_price = hist['Close'].iloc[div_index - 1]
            latest_volume = hist['Volume'].iloc[div_index - 1]
            
            if pre_drop_price <= 0:
                skipped_records += 1
                continue
                
            yield_percent = (dividend_amount / pre_drop_price) * 100
            expected_price_drop_pct = yield_percent 
            log_price = np.log(pre_drop_price)
            
            price_5d_ago = hist['Close'].iloc[div_index - 6]
            return_5d_before = ((pre_drop_price - price_5d_ago) / price_5d_ago) * 100
            
            daily_returns = hist['Close'].iloc[div_index-21:div_index].pct_change().dropna()
            volatility_20d = daily_returns.std() * np.sqrt(252) * 100
            
            avg_volume_20d = hist['Volume'].iloc[div_index-21:div_index-1].mean()
            volume_ratio = latest_volume / avg_volume_20d if avg_volume_20d > 0 else 1.0
            
            month = target_date.month
            day_of_week = target_date.weekday()

            # --- Construct Payload in EXACT V2 Order ---
            # FIX: Matches the exact order demanded by the error message!
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

            # Get AI Prediction
            prediction = model.predict(payload)[0]
            
            min_days = max(1, int(round(prediction - (mae_band / 2))))
            max_days = int(round(prediction + (mae_band / 2)))

            # Calculate ACTUAL Reality
            recovered = False
            actual_days = 0
            
            for j in range(div_index, len(hist)):
                if hist['Close'].iloc[j] >= pre_drop_price:
                    recovered = True
                    actual_days = j - div_index
                    break
                    
            if recovered and actual_days <= 100:
                is_accurate = min_days <= actual_days <= max_days
                
                results.append({
                    'Symbol': symbol,
                    'Predicted_Days': prediction,
                    'Actual_Days': actual_days,
                    'Is_Accurate': is_accurate,
                    'Absolute_Error': abs(prediction - actual_days)
                })
                successful_tests += 1
            else:
                skipped_records += 1

        except Exception as e:
            # We will leave this print statement here just in case something else breaks!
            print(f"\n⚠️ Crash on {symbol}: {e}")
            error_records += 1
            continue

    print() # Newline after progress bar

    # --- Analytics & Reporting ---
    if not results:
        print("⚠️ No valid recovered events found to backtest.")
        return
        
    results_df = pd.DataFrame(results)
    
    total_tested = len(results_df)
    correct_predictions = results_df['Is_Accurate'].sum()
    overall_accuracy = (correct_predictions / total_tested) * 100
    average_error = results_df['Absolute_Error'].mean()
    
    print("\n==================================================")
    print("🏆 V2 BACKTEST FACTORY RESULTS")
    print("==================================================")
    print(f"Total Records in CSV:     {total_records}")
    print(f"Successfully Backtested:  {successful_tests}")
    print(f"Skipped (No Data/Trap):   {skipped_records}")
    print(f"Errors Caught & Handled:  {error_records}")
    print("--------------------------------------------------")
    print(f"Overall Accuracy:         {overall_accuracy:.2f}% (Inside +/- 2.6 days)")
    print(f"Average Real-World Error: {average_error:.2f} Days")
    print("==================================================\n")

    # --- Plotting the Graph ---
    print("📊 Generating Accuracy Graph...")
    
    plt.figure(figsize=(10, 6))
    plt.style.use('dark_background')
    
    actuals = results_df['Actual_Days']
    preds = results_df['Predicted_Days']
    
    plt.scatter(actuals, preds, alpha=0.6, c='#a855f7', edgecolors='w', linewidth=0.5, label='Dividend Event')
    
    max_val = max(max(actuals), max(preds))
    plt.plot([0, max_val], [0, max_val], color='#22c55e', linestyle='--', linewidth=2, label='Perfect Prediction')
    
    plt.fill_between([0, max_val], 
                     [0 - (mae_band/2), max_val - (mae_band/2)], 
                     [0 + (mae_band/2), max_val + (mae_band/2)], 
                     color='#22c55e', alpha=0.15, label='Confidence Band')

    plt.title('DiviDrop V2 AI: Predicted vs. Actual Recovery (Trading Days)', fontsize=14, pad=15)
    plt.xlabel('Actual Historical Recovery Time (Days)', fontsize=12)
    plt.ylabel('AI Predicted Recovery Time (Days)', fontsize=12)
    plt.legend(loc='upper left')
    plt.grid(True, alpha=0.2, linestyle='--')
    
    graph_filename = 'v2_ai_backtest_accuracy.png'
    plt.savefig(graph_filename, dpi=300, bbox_inches='tight')
    print(f"✅ Graph successfully saved as {graph_filename}")

if __name__ == "__main__":
    run_mass_backtest_v2('extracted_dividends.csv', 'dividend_recovery_model_v2.json')