import { getRheaPriceInNear } from './getRheaPriceInNear';
import { getNearPriceInUsdt } from './getNearPriceInUsdt';

export async function getNearRheaPriceInUsdt(): Promise<{ 
  price: number; 
  inversePrice: number;
  timestamp: number;
}> {
  try {
    const [rheaInNear, nearInUsdt] = await Promise.all([
      getRheaPriceInNear(),
      getNearPriceInUsdt()
    ]);

    const rheaInUsdt = rheaInNear * nearInUsdt;
    const usdtInRhea = 1 / rheaInUsdt;
    
    return {
      price: rheaInUsdt,
      inversePrice: usdtInRhea,
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error(`NEAR price error: ${error instanceof Error ? error.message : error}`);
  }
}