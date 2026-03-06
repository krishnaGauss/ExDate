import { Dividend } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchData() {
    const response = await fetch(`${API_URL}/v1/info`);
    const data = await response.json();
    return data as Dividend[];
}