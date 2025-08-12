import { getAnonymousAccount, getTokenMetadata, getPoolPrice } from './nearUtils';

const WNEAR = 'wrap.near';
const USDT = 'usdt.tether-token.near';
const NEAR_USDT_POOL = 5470;

export async function getNearPriceInUsdt(): Promise<number> {
  const account = await getAnonymousAccount();
  
  const [wnearMeta, usdtMeta] = await Promise.all([
    getTokenMetadata(account, WNEAR),
    getTokenMetadata(account, USDT)
  ]);

  return getPoolPrice(
    account,
    NEAR_USDT_POOL,
    WNEAR,
    USDT,
    wnearMeta.decimals,
    usdtMeta.decimals
  );
}