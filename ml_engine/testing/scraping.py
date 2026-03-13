import json
import re
import csv
from datetime import datetime

def extract_dividend_data_to_csv(json_filepath, csv_filepath):
    print(f"Loading data from {json_filepath}...")
    
    try:
        with open(json_filepath, 'r') as file:
            data = json.load(file)
    except FileNotFoundError:
        print(f"Error: Could not find the file '{json_filepath}'")
        return
    except json.JSONDecodeError:
        print("Error: The file is not a valid JSON.")
        return

    # Regex pattern to find the Rupee amount
    # It looks for "Rs", "Rs.", "Re", "Re." followed by optional spaces, then a number
    amount_pattern = re.compile(r'(?i)(?:rs\.?|re\.?|rupees?)\s*([0-9]+\.?[0-9]*)')
    
    extracted_dividends = []

    for item in data:
        # 1. Filter out bonds/ETFs and non-dividend events
        series = item.get("series", "")
        subject = item.get("subject", "")
        
        if series == "EQ" and "DIVIDEND" in subject.upper():
            symbol = item.get("symbol", "UNKNOWN")
            raw_date = item.get("exDate", "")
            
            # 2. Extract the amount using Regex
            match = amount_pattern.search(subject)
            amount = float(match.group(1)) if match else 0.0
            
            # Skip if we couldn't find a valid amount
            if amount == 0.0:
                continue
            
            # 3. Standardize the Date Format (from DD-MMM-YYYY to YYYY-MM-DD)
            formatted_date = raw_date
            try:
                if raw_date and raw_date != "-":
                    date_obj = datetime.strptime(raw_date, "%d-%b-%Y")
                    formatted_date = date_obj.strftime("%Y-%m-%d")
                else:
                    continue # Skip if there is no ex-date assigned yet
            except ValueError:
                continue # Skip if date parsing fails

            # 4. Append clean record
            extracted_dividends.append({
                "symbol": symbol,
                "ex_date": formatted_date,
                "dividend_amount": amount,
                "raw_subject": subject # Keep for manual auditing just in case
            })

    print(f"Successfully extracted {len(extracted_dividends)} valid dividend records.")
    
    # 5. Export directly to CSV for the ML testing engine
    print(f"Saving results to {csv_filepath}...")
    
    with open(csv_filepath, mode='w', newline='', encoding='utf-8') as csv_file:
        fieldnames = ['symbol', 'ex_date', 'dividend_amount', 'raw_subject']
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        
        writer.writeheader()
        for record in extracted_dividends:
            writer.writerow(record)
            
    print("Pipeline complete! Data is ready for the AI backtesting script.")

if __name__ == "__main__":
    # Define input and output files
    input_file = 'sample.json'
    output_file = 'extracted_dividends.csv'
    
    # Run the extraction and CSV generation
    extract_dividend_data_to_csv(input_file, output_file)