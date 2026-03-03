package scraper

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/krishnaGauss/ExDate/NSE_scraper/db"
	"github.com/krishnaGauss/ExDate/NSE_scraper/fetchprice"
	"github.com/krishnaGauss/ExDate/NSE_scraper/model"
)

type Scraper struct {
	client *http.Client
	dbpool *pgxpool.Pool
}

func New(client *http.Client, dbpool *pgxpool.Pool) *Scraper {
	return &Scraper{
		client: client,
		dbpool: dbpool,
	}
}

func extractDividendAmount(subject string) string {
	re := regexp.MustCompile(`(?i)(?:rs\.?|re\.?)\s*([0-9]+\.?[0-9]*)`)
	matches := re.FindStringSubmatch(subject)
	if len(matches) > 1 {
		return matches[1]
	}
	return "NA"
}

// ScrapeCorporateActions fetches the corporate actions and processes dividends
func (s *Scraper) ScrapeCorporateActions(ctx context.Context) error {
	headers := map[string]string{
		"User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
		"Accept":          "*/*",
		"Accept-Language": "en-US,en;q=0.9",
	}

	log.Println("Visiting NSE Homepage for creating session and cookies")
	req1, err := http.NewRequestWithContext(ctx, "GET", "https://www.nseindia.com", nil)
	if err != nil {
		return fmt.Errorf("failed to create homepage request: %w", err)
	}
	for k, v := range headers {
		req1.Header.Set(k, v)
	}

	resp1, err := s.client.Do(req1)
	if err != nil {
		return fmt.Errorf("failed to reach NSE homepage: %w", err)
	}
	resp1.Body.Close()

	// hitting equity page for dividends info
	apiURL := "https://www.nseindia.com/api/corporates-corporateActions?index=equities"
	req2, err := http.NewRequestWithContext(ctx, "GET", apiURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create api request: %w", err)
	}

	for k, v := range headers {
		req2.Header.Set(k, v)
	}

	req2.Header.Set("Referer", "https://www.nseindia.com/companies-listing/corporate-filings-application")

	resp2, err := s.client.Do(req2)
	if err != nil {
		return fmt.Errorf("failed to fetch API: %w", err)
	}
	defer resp2.Body.Close()

	if resp2.StatusCode != 200 {
		log.Printf("NSE returned status code %d", resp2.StatusCode)
	}

	log.Printf("Fetched dividends successfully.\n")

	// parsing body
	bodyBytes, err := io.ReadAll(resp2.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	var allActions []model.CorporateAction
	if err := json.Unmarshal(bodyBytes, &allActions); err != nil {
		log.Printf("Failed to parse JSON: %v. Body sample: %s", err, string(bodyBytes[:100]))
	}

	var upcomingDividends []model.CorporateAction
	for _, action := range allActions {
		if action.Series == "EQ" && strings.Contains(strings.ToUpper(action.Subject), "DIVIDEND") {
			upcomingDividends = append(upcomingDividends, action)
		}
	}

	// output results
	fmt.Printf("\nSuccess, Found %d upcoming equity dividends.\n\n", len(upcomingDividends))

	for i := 0; i < len(upcomingDividends); i++ {
		div := upcomingDividends[i]
		amount := extractDividendAmount(div.Subject)

		// Fetch the live price using the fetchprice package
		livePrice := fetchprice.GetLivePrice(div.Symbol)

		fmt.Printf("%s (%s)\n", div.Symbol, div.Comp)
		fmt.Printf("Ex-Date: %s\n", div.ExDate)
		fmt.Printf("Raw Action: %s\n", div.Subject)
		fmt.Printf("Extracted Dividend: ₹%s\n", amount)
		if livePrice > 0 {
			fmt.Printf("Live Price: ₹%.2f\n", livePrice)

			// Optional: Calculate and print the yield if amount is valid
			if amtFloat, err := strconv.ParseFloat(amount, 64); err == nil && amtFloat > 0 {
				yield := (amtFloat / livePrice) * 100
				fmt.Printf("Calculated Yield: %.2f%%\n", yield)

				divModel := model.Dividend{
					Symbol:          div.Symbol,
					CompanyName:     div.Comp,
					ExDate:          div.ExDate,
					RawAction:       div.Subject,
					DividendAmount:  amtFloat,
					LivePrice:       livePrice,
					CalculatedYield: yield,
				}

				err = db.SaveDividend(ctx, s.dbpool, divModel)
				if err != nil {
					log.Printf("Failed to insert dividend for %s into DB: %v\n", div.Symbol, err)
				} else {
					fmt.Printf("Successfully saved %s to database.\n", div.Symbol)
				}
			}
		} else {
			fmt.Printf("Live Price: Unavailable\n")
		}
		fmt.Println()
	}

	return nil
}
