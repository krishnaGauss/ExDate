import { Dividend } from "./types";

export async function fetchData() {
    const response = await fetch("https://4t597dmn3a.execute-api.ap-south-1.amazonaws.com/default/v1/info");
    const data = await response.json();
    return data as Dividend[];
}