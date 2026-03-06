package main

import (
	"context"
	"log"
	"net/http"
	"net/http/cookiejar"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	ginadapter "github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/krishnaGauss/ExDate/NSE_scraper/db"
	"github.com/krishnaGauss/ExDate/NSE_scraper/routes"
	"github.com/krishnaGauss/ExDate/NSE_scraper/scraper"
	"golang.org/x/net/publicsuffix"
)

var ginLambda *ginadapter.GinLambdaV2
var s *scraper.Scraper

func scrape(s *scraper.Scraper, ctx context.Context) {
	log.Println("Scraping NSE in background...")
	err := s.ScrapeCorporateActions(ctx)
	if err != nil {
		log.Printf("Scraper encountered an error: %v", err)
	}
}

// init() runs ONCE when the Lambda container "Cold Starts"
func init() {
	log.Println("Initializing NSE Scraper Lambda Container...")

	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found or failed to load. Falling back to system environment variables.")
	}

	ctx := context.Background()

	// 1. Initialise router
	router := gin.Default()
	config := cors.DefaultConfig()

	config.AllowOrigins = []string{
		os.Getenv("ALLOWED_URL"),
		"https://ex-date.vercel.app/",
	}

	config.AllowMethods = []string{
		"GET", "POST", "PUT", "DELETE", "OPTIONS",
	}

	config.AllowHeaders = []string{
		"Origin", "Content-Type", "Accept",
	}

	router.Use(cors.New(config))

	// 2. Initialise db connection
	dbpool, err := db.InitDB(ctx)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	log.Println("Database connection established.")

	routes.RegisterRoutes(router, dbpool)

	// 4. Wrap Gin in Lambda Adapter (No options needed here)
	ginLambda = ginadapter.NewV2(router)

	jar, err := cookiejar.New(&cookiejar.Options{PublicSuffixList: publicsuffix.List})
	if err != nil {
		log.Fatalf("Failed to create cookie jar: %v", err)
	}

	client := &http.Client{
		Jar:     jar,
		Timeout: 30 * time.Second,
	}

	// Store scraper globally so the Handler can trigger it later
	s = scraper.New(client, dbpool)
}

func Handler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	if req.Headers["secret-cron"] == "true" {
		log.Println("Received trigger from EventBridge Cron!")
		scrape(s, ctx)
		return events.APIGatewayV2HTTPResponse{
			StatusCode: 200,
			Body:       `{"status": "Scraping completed successfully"}`,
		}, nil
	}

	req.RawPath = strings.TrimPrefix(req.RawPath, "/default")
	return ginLambda.ProxyWithContext(ctx, req)
}

func main() {
	// Start the AWS Lambda listener
	lambda.Start(Handler)
}
