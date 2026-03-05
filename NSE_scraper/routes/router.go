package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/krishnaGauss/ExDate/NSE_scraper/controllers"
)

func RegisterRoutes(r *gin.Engine, db *pgxpool.Pool) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "OK",
		})
	})

	v1 := r.Group("/v1")
	v1.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Welcome to the NSE Scraper API",
		})
	})

	// Initialize Controllers with dependencies
	infoController := controllers.NewInfoController(db)

	v1.GET("/info", infoController.GetInfo)
}
