package main

import (
	"context"
	"log"
	"net/http"
	"net/http/cookiejar"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/krishnaGauss/ExDate/NSE_scraper/db"
	"github.com/krishnaGauss/ExDate/NSE_scraper/routes"
	"github.com/krishnaGauss/ExDate/NSE_scraper/scraper"
	"github.com/robfig/cron/v3"
	"golang.org/x/net/publicsuffix"
)

func scrape(s *scraper.Scraper, ctx context.Context){
	log.Println("Scraping NSE in background...")
	err := s.ScrapeCorporateActions(ctx)
	if err != nil {
		log.Printf("Scraper encountered an error: %v", err)
	}

}

func main() {
	log.Println("Initializing NSE Scraper...")

	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found or failed to load. Falling back to system environment variables.")
	}

	ctx := context.Background()

	//initialising router
	router := gin.Default()
	config:=cors.DefaultConfig()

	config.AllowOrigins = []string{
		os.Getenv("ALLOWED_URL"),
	}

	config.AllowMethods = []string{
		"GET", "POST", "PUT", "DELETE", "OPTIONS",
	}

	config.AllowHeaders = []string{
		"Origin", "Content-Type", "Accept",
	}

	router.Use(cors.New(config))



	// Initializing db connection
	dbpool, err := db.InitDB(ctx)
	if err != nil {
		log.Printf("Failed to initialize database: %v", err)
		os.Exit(1)
	}
	defer dbpool.Close()
	log.Println("Database connection established.")

	// Registering routes with the database dependency
	routes.RegisterRoutes(router, dbpool)

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

	c := cron.New(cron.WithLocation(time.Local))

	//the 11AM job
	_, err = c.AddFunc("0 11 * * *", func() {
		log.Println("Running scheduled 11:00 AM scrape...")
		scrape(s, ctx)
	})
	if err != nil {
		log.Fatalf("Failed to schedule 11 AM job: %v", err)
	}
	// Add the 4 PM job
	_, err = c.AddFunc("0 16 * * *", func() {
		log.Println("Running scheduled 4:00 PM scrape...")
		scrape(s, ctx)
	})
	if err != nil {
		log.Fatalf("Failed to schedule 4 PM job: %v", err)
	}

	c.Start()
	defer c.Stop()

	go scrape(s, ctx)

	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	//running server in a separate go routine
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)

	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx2, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx2); err != nil {
		log.Println("Server Shutdown:", err)
	}
	log.Println("Server exiting")

}
