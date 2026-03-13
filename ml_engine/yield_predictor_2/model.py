import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import (
    train_test_split,
    RandomizedSearchCV,
    TimeSeriesSplit,
    cross_val_score,
)
from sklearn.metrics import mean_absolute_error, r2_score, mean_absolute_percentage_error
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore')


# Feature Configuration
FEATURES = [
    'Yield_Percent',
    'Volume_On_ExDate',
    'Price_Drop_Percent',
    'Log_Price',
    'Volatility_20d',
    'Return_5d_Before',
    'Volume_Ratio',
    'Day_of_Week',
    'Month',
]

# Hyperparameter Search Space
PARAM_DISTRIBUTIONS = {
    'n_estimators': [100, 200, 300, 500, 800],
    'learning_rate': [0.01, 0.03, 0.05, 0.1, 0.15],
    'max_depth': [3, 4, 5, 6, 7, 8],
    'min_child_weight': [1, 3, 5, 7],
    'subsample': [0.6, 0.7, 0.8, 0.9, 1.0],
    'colsample_bytree': [0.6, 0.7, 0.8, 0.9, 1.0],
    'gamma': [0, 0.1, 0.2, 0.3],
    'reg_alpha': [0, 0.01, 0.1, 1.0],
    'reg_lambda': [1.0, 1.5, 2.0, 5.0],
}


def load_and_clean(csv_path: str = 'ml_dividend_dataset2.csv') -> pd.DataFrame:
    """Load dataset and apply cleaning rules."""
    print("Initializing DiviDrop AI Quant Model v2...")

    try:
        df = pd.read_csv(csv_path)
        print(f"Loaded {len(df)} historical dividend events.")
    except FileNotFoundError:
        print(f"Error: {csv_path} not found.")
        raise

    original_len = len(df)

    # Drop rows with NaN in any feature column (safety net for bad data)
    df = df.dropna(subset=FEATURES + ['TARGET_Recovery_Days'])
    print(f"🧹 Dropped {original_len - len(df)} rows with missing feature values.")

    # Filter extreme outliers: cap at 100 days (value traps)
    outlier_count = len(df[df['TARGET_Recovery_Days'] > 100])
    df = df[df['TARGET_Recovery_Days'] <= 100]
    print(f"Filtered out {outlier_count} extreme outliers (Value Traps > 100 days).")

    # Sort by Ex_Date for proper time-series splitting
    if 'Ex_Date' in df.columns:
        df = df.sort_values('Ex_Date').reset_index(drop=True)
        print("Sorted dataset chronologically for time-series validation.")

    print(f"Final dataset: {len(df)} samples, {len(FEATURES)} features.\n")
    return df


def cross_validate_model(X: pd.DataFrame, y: pd.Series) -> None:
    """Run TimeSeriesSplit cross-validation."""
    print("Running 5-Fold TimeSeriesSplit Cross-Validation...")

    base_model = xgb.XGBRegressor(
        objective='reg:squarederror',
        n_estimators=200,
        learning_rate=0.05,
        max_depth=5,
        random_state=42,
        verbosity=0,
    )

    tscv = TimeSeriesSplit(n_splits=5)
    mae_scores = []
    r2_scores = []

    for fold, (train_idx, test_idx) in enumerate(tscv.split(X), 1):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

        base_model.fit(X_train, y_train, verbose=False)
        preds = base_model.predict(X_test)

        fold_mae = mean_absolute_error(y_test, preds)
        fold_r2 = r2_score(y_test, preds)
        mae_scores.append(fold_mae)
        r2_scores.append(fold_r2)
        print(f"   Fold {fold}: MAE = {fold_mae:.2f} days, R2 = {fold_r2:.4f}")

    print(f"\n   MAE:  {np.mean(mae_scores):.2f} +/- {np.std(mae_scores):.2f} days")
    print(f"   R2:   {np.mean(r2_scores):.4f} +/- {np.std(r2_scores):.4f}\n")


def tune_hyperparameters(X_train: pd.DataFrame, y_train: pd.Series) -> xgb.XGBRegressor:
    """Use RandomizedSearchCV to find optimal hyperparameters."""
    print("Tuning Hyperparameters with RandomizedSearchCV (100 iterations, 5-fold CV)...")

    search = RandomizedSearchCV(
        estimator=xgb.XGBRegressor(objective='reg:squarederror', random_state=42, verbosity=0),
        param_distributions=PARAM_DISTRIBUTIONS,
        n_iter=100,
        scoring='neg_mean_absolute_error',
        cv=TimeSeriesSplit(n_splits=5),
        random_state=42,
        verbose=0,
        n_jobs=-1,
    )

    search.fit(X_train, y_train)

    print("Best Hyperparameters Found:")
    for param, value in search.best_params_.items():
        print(f"      {param}: {value}")
    print(f"Best CV MAE: {-search.best_score_:.2f} days\n")

    return search.best_estimator_


def evaluate_model(model: xgb.XGBRegressor, X_test: pd.DataFrame, y_test: pd.Series) -> None:
    """Evaluate the final model on the hold-out test set."""
    predictions = model.predict(X_test)

    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    mask = y_test > 0
    if mask.sum() > 0:
        mape = mean_absolute_percentage_error(y_test[mask], predictions[mask])
    else:
        mape = float('nan')

    print("=" * 60)
    print("FINAL EVALUATION ON HOLD-OUT TEST SET")
    print(f"MAE:   {mae:.2f} days")
    print(f"R2:    {r2:.4f}")
    print(f"MAPE:  {mape:.2%}")
    print("=" * 60)


def plot_feature_importance(model: xgb.XGBRegressor, feature_names: list) -> None:
    """Print and save feature importance chart."""
    print("\nFeature Importance:")
    importance = model.feature_importances_
    sorted_idx = np.argsort(importance)[::-1]

    for rank, idx in enumerate(sorted_idx, 1):
        bar = "█" * int(importance[idx] * 50)
        print(f"   {rank}. {feature_names[idx]:>20s}: {importance[idx]*100:5.1f}%  {bar}")

    # Save chart
    plt.figure(figsize=(10, 6))
    plt.barh(
        [feature_names[i] for i in sorted_idx[::-1]],
        [importance[i] for i in sorted_idx[::-1]],
        color='#4FC3F7',
    )
    plt.xlabel('Importance')
    plt.title('XGBoost Feature Importance - Dividend Recovery Predictor v2')
    plt.tight_layout()
    plt.savefig('feature_importance_v2.png', dpi=150)
    print("\nFeature importance chart saved as feature_importance_v2.png")


def train_recovery_model():
    """Main training pipeline."""

    # 1. Load & clean
    df = load_and_clean()

    X = df[FEATURES]
    y = df['TARGET_Recovery_Days']

    # 2. Cross-validate with baseline to see where we stand
    cross_validate_model(X, y)

    # 3. Time-series aware train/test split (last 20% as test)
    split_index = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_index], X.iloc[split_index:]
    y_train, y_test = y.iloc[:split_index], y.iloc[split_index:]
    print(f"Dataset Split - Train: {len(X_train)} samples | Test: {len(X_test)} samples\n")

    # 4. Hyperparameter tuning
    best_model = tune_hyperparameters(X_train, y_train)

    # 5. Final evaluation
    evaluate_model(best_model, X_test, y_test)

    # 6. Feature importance
    plot_feature_importance(best_model, FEATURES)

    # 7. Export model
    model_filename = 'dividend_recovery_model_v2.json'
    best_model.save_model(model_filename)
    print(f"\nModel saved as {model_filename}.")

    return best_model


if __name__ == "__main__":
    train_recovery_model()
