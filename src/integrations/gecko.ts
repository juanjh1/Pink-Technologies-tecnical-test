import "dotenv/config"
import { IntegrationResponseError } from '../exceptions/integration/integration.error.js';
import { PriceResponse } from '../types/coin.type.js';

export class Gecko{
  private key : string;
  private fullUrl: string;
  private baseUrl: string ="https://api.coingecko.com/api" ;
  private version: string = "v3"
  constructor(){
    this.key = process.env.GECKO_KEY!
    this.fullUrl = `${this.baseUrl}/${this.version}`
  }
  
  // this endpoint is just for test how works gecko it's not for production
  // and is unused in the aplication
  async ping(): Promise<{[key:string]:string}>{
    const authUrl = `${this.fullUrl}/ping`
    const response = await fetch(authUrl, {headers:{"x-cg-demo-api-key": this.key}})
    if(!response.ok){
      throw new IntegrationResponseError(`CoinGecko ping failed: ${response.status}`)
    }
    const result = await response.json()
    return result;
  }
  
  
  async getPrices(coins: string[]): Promise<PriceResponse[]> {
    const url = `${this.fullUrl}/simple/price?ids=${coins.join(",")}&vs_currencies=usd`

    const res = await fetch(url, {
      headers: {
        "x-cg-demo-api-key": this.key
      }
    })

    if (!res.ok) {
      throw new IntegrationResponseError("Error fetching prices")
    }

    const data = await res.json()

    return coins.map(coin => ({
      coin,
      price: data[coin]?.usd ?? 0,
      currency: "usd"
    }))
  }

}

export const geckoClient = new Gecko();
