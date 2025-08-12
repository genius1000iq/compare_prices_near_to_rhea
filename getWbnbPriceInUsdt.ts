import { ethers } from 'ethers';

export async function getWbnbPriceInUsdt(): Promise<number> {
  const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
  const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
  const USDT = '0x55d398326f99059fF775485246999027B3197955';
  const POOL_ADDRESS = '0x172fcD41E0913e95784454622d1c3724f546f849';

  const POOL_ABI = [
    'function token0() view returns (address)',
    'function token1() view returns (address)',
    'function slot0() view returns (uint160 sqrtPriceX96, int24, uint16, uint16, uint16, uint8, bool)'
  ];

  const ERC20_ABI = ['function decimals() view returns (uint8)'];

  const pool = new ethers.Contract(POOL_ADDRESS, POOL_ABI, provider);
  const [slot0, token0] = await Promise.all([pool.slot0(), pool.token0()]);

  const sqrtPriceX96 = BigInt(slot0.sqrtPriceX96);
  const price = Number(sqrtPriceX96 ** 2n) / Number(2n ** 192n);

  const [wbnbDecimals, usdtDecimals] = await Promise.all([
    new ethers.Contract(WBNB, ERC20_ABI, provider).decimals(),
    new ethers.Contract(USDT, ERC20_ABI, provider).decimals()
  ]);

  const isWbnbToken0 = token0.toLowerCase() === WBNB.toLowerCase();
  const factor = 10 ** Number(wbnbDecimals) / 10 ** Number(usdtDecimals);
  
  return isWbnbToken0 
    ? price * factor 
    : (1 / price) * factor;
}