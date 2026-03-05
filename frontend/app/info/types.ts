export type Dividend = {
    id: number;
    symbol: string;
    company_name: string;
    ex_date: string;
    raw_action: string;
    dividend_amount: number;
    live_price: number;
    calculated_yield: number;
}