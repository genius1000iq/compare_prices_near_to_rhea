import { getRheaPriceInWbnb } from './getRheaPriceInWbnb';
import { getWbnbPriceInUsdt } from './getWbnbPriceInUsdt';

export async function getBscRheaPriceInUsdt(): Promise<{ 
  price: number; 
  inversePrice: number;
  timestamp: number;
}> {
  try {
    const [rheaInWbnb, wbnbInUsdt] = await Promise.all([
      getRheaPriceInWbnb(),
      getWbnbPriceInUsdt()
    ]);

    const rheaInUsdt = rheaInWbnb * wbnbInUsdt;
    const usdtInRhea = 1 / rheaInUsdt;
    
    return {
      price: rheaInUsdt,
      inversePrice: usdtInRhea,
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error(`BSC price error: ${error instanceof Error ? error.message : error}`);
  }
}