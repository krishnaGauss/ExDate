package main

import (
	"context"
	"log"
	"net/http"
	"net/http/cookiejar"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/krishnaGauss/ExDate/NSE_scraper/db"
	"github.com/krishnaGauss/ExDate/NSE_scraper/scraper"
	"golang.org/x/net/publicsuffix"
)

func main() {
	log.Println("Initializing NSE Scraper...")

	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found or failed to load. Falling back to system environment variables.")
	}

	ctx := context.Background()

	// Initializing db connection
	dbpool, err := db.InitDB(ctx)
	if err != nil {
		log.Printf("Failed to initialize database: %v", err)
		os.Exit(1)
	}
	defer dbpool.Close()
	log.Println("Database connection established.")

	// initializing cookie jar with public suffix list to ensure security against TLD
	jar, err := cookiejar.New(&cookiejar.Options{PublicSuffixList: publicsuffix.List})
	if err != nil {
		log.Fatalf("Failed to create cookie jar: %v", err)
	}

	client := &http.Client{
		Jar:     jar,
		Timeout: 30 * time.Second,
	}

	// Create and run the scraper
	s := scraper.New(client, dbpool)

	err = s.ScrapeCorporateActions(ctx)
	if err != nil {
		log.Fatalf("Scraper encountered an error: %v", err)
	}
}
