package fetchprice

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"
	"fmt"
)

type YahooResponse struct {
	Chart struct{
		Result []struct{
			Meta struct{
				RegularMarketPrice float64 `json:"regularMarketPrice"`
			} `json:"meta"`
		} `json:"result"`
	} `json:"chart"`
}

func GetLivePrice(symbol string) float64 {
	url := fmt.Sprintf("https://query1.finance.yahoo.com/v8/finance/chart/%s.NS?range=1d&interval=1m", symbol)

	client := &http.Client{Timeout: 10*time.Second}
	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Set("User-Agent", "Mozilla/5.0")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Accept-Language", "en-US,en;q=0.5")
	
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != 200{
		log.Printf("Failed to fetch price for %v. Error: %v\n", symbol, err)
		return 0.0
	}

	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	var result YahooResponse
	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		log.Printf("Failed to parse response for %v. Error: %v\n", symbol, err)
		return 0.0
	}

	if len(result.Chart.Result) > 0 {
		return result.Chart.Result[0].Meta.RegularMarketPrice
	}

	return 0.0

}