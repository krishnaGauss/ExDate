package db

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/krishnaGauss/ExDate/NSE_scraper/model"
)

func InitDB(ctx context.Context) (*pgxpool.Pool, error) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is not set")
	}

	dbpool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create database connection pool: %w", err)
	}

	// Ping the db
	if err := dbpool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return dbpool, nil
}

// SaveDividend inserts or updates a dividend record in the database
func SaveDividend(ctx context.Context, pool *pgxpool.Pool, div model.Dividend) error {
	query := `
		INSERT INTO dividends (symbol, company_name, ex_date, raw_action, dividend_amount, live_price, calculated_yield)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (symbol, ex_date) DO UPDATE 
		SET live_price = EXCLUDED.live_price, calculated_yield = EXCLUDED.calculated_yield;`

	_, err := pool.Exec(ctx, query,
		div.Symbol,
		div.CompanyName,
		div.ExDate,
		div.RawAction,
		div.DividendAmount,
		div.LivePrice,
		div.CalculatedYield,
	)

	return err
}
