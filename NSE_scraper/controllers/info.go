package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/krishnaGauss/ExDate/NSE_scraper/model"
)

type InfoController struct {
	DB *pgxpool.Pool
}

func NewInfoController(db *pgxpool.Pool) *InfoController {
	return &InfoController{
		DB: db,
	}
}

func (ic *InfoController) GetInfo(c *gin.Context) {
	rows, err := ic.DB.Query(c.Request.Context(), "SELECT id, symbol, company_name, ex_date, raw_action, dividend_amount, live_price, calculated_yield FROM dividends;")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	defer rows.Close()

	var dividends []model.Dividend
	for rows.Next() {
		var dividend model.Dividend
		if err := rows.Scan(&dividend.ID, &dividend.Symbol, &dividend.CompanyName, &dividend.ExDate, &dividend.RawAction, &dividend.DividendAmount, &dividend.LivePrice, &dividend.CalculatedYield); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
		dividends = append(dividends, dividend)
	}
	c.JSON(http.StatusOK, dividends)
}
