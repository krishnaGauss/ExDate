package model

type CorporateAction struct {
	Symbol     string `json:"symbol"`
	Comp       string `json:"comp"`
	ExDate     string `json:"exDate"`
	Subject    string `json:"subject"`
	RecordDate string `json:"recDate"`
	FaceValue  string `json:"faceVal"`
	Series     string `json:"series"`
}

type Dividend struct {
	ID              int     `json:"id"`
	Symbol          string  `json:"symbol"`
	CompanyName     string  `json:"company_name"`
	ExDate          string  `json:"ex_date"`
	RawAction       string  `json:"raw_action"`
	DividendAmount  float64 `json:"dividend_amount"`
	LivePrice       float64 `json:"live_price"`
	CalculatedYield float64 `json:"calculated_yield"`
}
