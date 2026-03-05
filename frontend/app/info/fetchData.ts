import { Dividend } from "./types";

export async function fetchData() {
    const response = await fetch("http://localhost:8080/v1/info");
    const data = await response.json();
    return data as Dividend[];
}