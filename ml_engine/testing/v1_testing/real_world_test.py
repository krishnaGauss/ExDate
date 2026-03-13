import pandas as pd
import yfinance as yf
import xgboost as xgb
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime
import sys

def run_mass_backtest(csv_filepath, model_filepath):
    print(f"Starting Automated AI Backtest Factory...")
    
    # 1. Load the target events and the AI model
    try:
        events_df = pd.read_csv(csv_filepath)
        total_records = len(events_df)
        print(f"📥 Loaded {total_records} dividend events to test.")
    except FileNotFoundError:
        print(f"Error: Could not find {csv_filepath}")
        return

    try:
        model = xgb.XGBRegressor()
        model.load_model(model_filepath)
        print("AI Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    # Memory cache so we don't spam Yahoo Finance for the same stock twice
    history_cache = {}
    
    results = []
    mae_band = 5.32 # Using the MAE you calculated earlier to form our confidence band

    # Tracking counters
    successful_tests = 0
    skipped_records = 0
    error_records = 0

    print("\nProcessing historical events...\n")
    
    # 2. Loop through every single event in the CSV
    for index, row in events_df.iterrows():
        # --- Native Terminal Progress Bar ---
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
            
            # Fetch or retrieve cached history
            if yahoo_ticker not in history_cache:
                # Suppress Yahoo Finance errors so they don't mess up our progress bar
                stock = yf.Ticker(yahoo_ticker)
                hist = stock.history(period="max")
                if not hist.empty:
                    hist.index = hist.index.tz_localize(None)
                history_cache[yahoo_ticker] = hist
                
            hist = history_cache[yahoo_ticker]
            
            if hist.empty:
                skipped_records += 1
                continue
                
            # Parse the date and find the closest trading day (in case of weekends)
            target_date = datetime.strptime(ex_date_str, "%Y-%m-%d")
            valid_dates = hist.index[hist.index >= target_date]
            
            if len(valid_dates) == 0:
                skipped_records += 1
                continue
                
            actual_ex_date = valid_dates[0]
            div_index = hist.index.get_loc(actual_ex_date)

            # Need at least 1 day of prior data
            if div_index < 1:
                skipped_records += 1
                continue

            # 3. Simulate "Standing on the day BEFORE the Ex-Date"
            pre_drop_price = hist['Close'].iloc[div_index - 1]
            latest_volume = hist['Volume'].iloc[div_index - 1]
            
            if pre_drop_price <= 0:
                skipped_records += 1
                continue
                
            yield_percent = (dividend_amount / pre_drop_price) * 100

            # 4. Construct Payload (V1 4-Feature format)
            payload = pd.DataFrame([{
                'Pre_Drop_Price': pre_drop_price,
                'Dividend_Amount': dividend_amount,
                'Yield_Percent': yield_percent,
                'Volume_On_ExDate': latest_volume
            }])

            # 5. Get AI Prediction
            prediction = model.predict(payload)[0]
            
            min_days = max(1, int(round(prediction - (mae_band / 2))))
            max_days = int(round(prediction + (mae_band / 2)))

            # 6. Calculate ACTUAL Reality
            recovered = False
            actual_days = 0
            
            for j in range(div_index, len(hist)):
                if hist['Close'].iloc[j] >= pre_drop_price:
                    recovered = True
                    actual_days = j - div_index
                    break
                    
            # If it hasn't recovered yet, we skip logging it for accuracy metrics 
            # (or we can cap it at 100 for visualization)
            if recovered and actual_days <= 100:
                # Did the actual days fall inside our predicted Confidence Band?
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
            # If ANYTHING goes wrong (math error, missing column, API failure), 
            # catch it here and move to the next record seamlessly.
            error_records += 1
            continue

    print() # Print a newline after the progress bar is done

    # --- Analytics & Reporting ---
    if not results:
        print("Warning: No valid recovered events found to backtest.")
        return
        
    results_df = pd.DataFrame(results)
    
    total_tested = len(results_df)
    correct_predictions = results_df['Is_Accurate'].sum()
    overall_accuracy = (correct_predictions / total_tested) * 100
    average_error = results_df['Absolute_Error'].mean()
    
    print("\n==================================================")
    print("BACKTEST FACTORY RESULTS")
    print("==================================================")
    print(f"Total Records in CSV:     {total_records}")
    print(f"Successfully Backtested:  {successful_tests}")
    print(f"Skipped (No Data/Trap):   {skipped_records}")
    print(f"Errors Caught & Handled:  {error_records}")
    print("--------------------------------------------------")
    print(f"Overall Accuracy (Fell inside confidence band): {overall_accuracy:.2f}%")
    print(f"Average Real-World Error: {average_error:.2f} Days")
    print("==================================================\n")

    # --- Plotting the Graph ---
    print("Generating Accuracy Graph...")
    
    plt.figure(figsize=(10, 6))
    plt.style.use('dark_background')
    
    actuals = results_df['Actual_Days']
    preds = results_df['Predicted_Days']
    
    # Scatter plot of all predictions
    plt.scatter(actuals, preds, alpha=0.6, c='#3b82f6', edgecolors='w', linewidth=0.5, label='Dividend Event')
    
    # Plot the "Perfect Accuracy" line (y = x)
    max_val = max(max(actuals), max(preds))
    plt.plot([0, max_val], [0, max_val], color='#22c55e', linestyle='--', linewidth=2, label='Perfect Prediction')
    
    # Plot the Confidence Band (+/- MAE)
    plt.fill_between([0, max_val], 
                     [0 - (mae_band/2), max_val - (mae_band/2)], 
                     [0 + (mae_band/2), max_val + (mae_band/2)], 
                     color='#22c55e', alpha=0.15, label='Confidence Band')

    plt.title('DiviDrop AI: Predicted Recovery vs. Actual Recovery (Trading Days)', fontsize=14, pad=15)
    plt.xlabel('Actual Historical Recovery Time (Days)', fontsize=12)
    plt.ylabel('AI Predicted Recovery Time (Days)', fontsize=12)
    plt.legend(loc='upper left')
    plt.grid(True, alpha=0.2, linestyle='--')
    
    # Save the graph as an image
    graph_filename = 'ai_backtest_accuracy.png'
    plt.savefig(graph_filename, dpi=300, bbox_inches='tight')
    print(f"Graph successfully saved as {graph_filename}")

if __name__ == "__main__":
    # Ensure these file names match your actual files!
    run_mass_backtest('extracted_dividends.csv', 'dividend_recovery_model.json')