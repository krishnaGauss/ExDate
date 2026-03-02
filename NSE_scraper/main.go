package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/cookiejar"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/krishnaGauss/ExDate/NSE_scraper/fetchprice"
	"golang.org/x/net/publicsuffix"
)

type CorporateAction struct {
	Symbol     string `json:"symbol"`
	Comp       string `json:"comp"`
	ExDate     string `json:"exDate"`
	Subject    string `json:"subject"`
	RecordDate string `json:"recDate"`
	FaceValue  string `json:"faceVal"`
	Series     string `json:"series"`
}

func extractDividendAmount(subject string) string {
	re := regexp.MustCompile(`(?i)(?:rs\.?|re\.?)\s*([0-9]+\.?[0-9]*)`)
	matches := re.FindStringSubmatch(subject)
	if len(matches) > 1 {
		return matches[1]
	}
	return "NA"
}

func main() {
	log.Println("Initializing NSE Scraper...")

	//initializing cookie jar with public suffix list to ensure security against TLD
	jar, err := cookiejar.New(&cookiejar.Options{PublicSuffixList: publicsuffix.List})
	if err != nil {
		log.Fatalf("Failed to create cookie jar: %v", err)
	}

	client := &http.Client{
		Jar:     jar,
		Timeout: 30 * time.Second,
	}

	//browser headers to avoid suspicion from akamai
	headers := map[string]string{
		"User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
		"Accept":          "*/*",
		"Accept-Language": "en-US,en;q=0.9",
	}

	log.Println("Visiting NSE Homepage for creating session and cookies")
	req1, _ := http.NewRequest("GET", "https://www.nseindia.com", nil)
	for k, v := range headers {
		req1.Header.Set(k, v)
	}

	resp1, err := client.Do(req1)
	if err != nil {
		log.Fatalf("Failed to reach NSE homepage: %v", err)
	}
	resp1.Body.Close()

	//hitting equity page for dividends info
	apiURL := "https://www.nseindia.com/api/corporates-corporateActions?index=equities"
	req2, _ := http.NewRequest("GET", apiURL, nil)

	for k, v := range headers {
		req2.Header.Set(k, v)
	}

	req2.Header.Set("Referer", "https://www.nseindia.com/companies-listing/corporate-filings-application")

	resp2, err := client.Do(req2)
	if err != nil {
		log.Fatalf("Failed to fetch API: %v", err)
	}
	defer resp2.Body.Close()

	if resp2.StatusCode != 200 {
		log.Fatalf("NSE returned status code %d", resp2.StatusCode)
	}

	log.Printf("Fetched dividends successfully. \n")

	//parsing body
	bodyBytes, _ := io.ReadAll(resp2.Body)

	var allActions []CorporateAction
	respBodyBytes := string(bodyBytes) // using a temporary string
	_ = respBodyBytes
	if err := json.Unmarshal(bodyBytes, &allActions); err != nil {
		// Log but don't strictly fail on parse error if structure is slightly off, some endpoints return wrappers
		log.Printf("Failed to parse JSON: %v. Body sample: %s", err, string(bodyBytes[:100]))
	}

	var upcomingDividends []CorporateAction
	for _, action := range allActions {
		if action.Series == "EQ" && strings.Contains(strings.ToUpper(action.Subject), "DIVIDEND") {
			upcomingDividends = append(upcomingDividends, action)
		}
	}

	//output results
	fmt.Printf("\nSuccess, Found %d upcoming equity dividends. \n\n", len(upcomingDividends))

	limit := len(upcomingDividends)

	for i := 0; i < limit; i++ {
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
			}
		} else {
			fmt.Printf("Live Price: Unavailable\n")
		}
		fmt.Println()
	}

}
