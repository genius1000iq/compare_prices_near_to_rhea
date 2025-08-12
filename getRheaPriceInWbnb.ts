import { ethers } from 'ethers';

export async function getRheaPriceInWbnb(): Promise<number> {
  const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
  const V3_FACTORY = '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865';
  const RHEA = '0x4c067DE26475E1CeFee8b8d1f6E2266b33a2372E';
  const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
  const fee = 100;

  const ABI = {
    V3_FACTORY: ['function getPool(address tokenA, address tokenB, uint24 fee) view returns (address)'],
    ERC20: [
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)'
    ],
    POOL: [
      'function liquidity() view returns (uint128)',
      'function slot0() view returns (uint160 sqrtPriceX96, int24, uint16, uint16, uint16, uint8, bool)',
      'function token0() view returns (address)',
      'function token1() view returns (address)'
    ]
  };

  const factoryV3 = new ethers.Contract(V3_FACTORY, ABI.V3_FACTORY, provider);
  const poolAddress = await factoryV3.getPool(RHEA, WBNB, fee);

  if (poolAddress === ethers.ZeroAddress) {
    throw new Error('Пул RHEA/WBNB не найден');
  }

  const pool = new ethers.Contract(poolAddress, ABI.POOL, provider);
  const [liquidity, slot0, token0, token1] = await Promise.all([
    pool.liquidity(),
    pool.slot0(),
    pool.token0(),
    pool.token1()
  ]);

  if (liquidity === 0n) {
    throw new Error('Пул не инициализирован');
  }

  const sqrtPriceX96 = BigInt(slot0.sqrtPriceX96);
  const price = Number(sqrtPriceX96 ** 2n) / Number(2n ** 192n);

  const [rheaDecimals, wbnbDecimals] = await Promise.all([
    new ethers.Contract(RHEA, ABI.ERC20, provider).decimals(),
    new ethers.Contract(WBNB, ABI.ERC20, provider).decimals()
  ]);

  const isRheaToken0 = token0.toLowerCase() === RHEA.toLowerCase();
  const factor = 10 ** Number(rheaDecimals) / 10 ** Number(wbnbDecimals);
  
  return isRheaToken0 
    ? price * factor 
    : (1 / price) * factor;
}