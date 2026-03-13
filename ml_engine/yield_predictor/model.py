import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import matplotlib.pyplot as plt

def train_recovery_model():
    print("Initializing DiviDrop AI Quant Model...")

    # Load the Dataset
    try:
        df = pd.read_csv('ml_dividend_dataset.csv')
        print(f"📥 Loaded {len(df)} historical dividend events.")
    except FileNotFoundError:
        print("Error: ml_dividend_dataset.csv not found.")
        return

    # Data Cleaning
    # If a stock took 3 years (800 trading days) to recover, it's a "Value Trap". 
    # That extreme outlier will confuse our ML model. We cap our training data to 
    # filter out stocks that recovered within a reasonable timeframe (e.g., 100 trading days).
    original_len = len(df)
    df = df[df['TARGET_Recovery_Days'] <= 100]
    print(f"Filtered out {original_len - len(df)} extreme outliers.")

    # Define Features (X) and Target (y)
    # We drop 'Symbol' and 'Ex_Date' because XGBoost only understands numbers, not text.
    features = ['Pre_Drop_Price', 'Dividend_Amount', 'Yield_Percent', 'Volume_On_ExDate']
    
    X = df[features]
    y = df['TARGET_Recovery_Days']

    # Split into Training (80%) and Testing (20%) Data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Build and Train the XGBoost Model
    print("\nTraining XGBoost Model...")
    model = xgb.XGBRegressor(
        objective='reg:squarederror',
        n_estimators=200,             # Number of decision trees
        learning_rate=0.05,           # How aggressively it learns
        max_depth=5,                  # Complexity of the trees
        random_state=42
    )
    
    model.fit(X_train, y_train)

    # Evaluate
    predictions = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, predictions)
    
    print("==================================================")
    print("TRAINING COMPLETE")
    print(f"Accuracy Metric (MAE): The model is off by an average of +/- {mae:.2f} days.")
    print("==================================================")

    # Feature Importance
    print("\nFeature Importance:")
    importance = model.feature_importances_
    for i, feature in enumerate(features):
        print(f"   -> {feature}: {importance[i]*100:.1f}%")

    # Export the Model
    model_filename = 'dividend_recovery_model.json'
    model.save_model(model_filename)
    print(f"\nModel saved as {model_filename}.")

if __name__ == "__main__":
    train_recovery_model()