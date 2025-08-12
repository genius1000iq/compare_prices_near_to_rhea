import { getAnonymousAccount, getTokenMetadata, getPoolPrice } from './nearUtils';

const RHEA = 'token.rhealab.near';
const WNEAR = 'wrap.near';
const RHEA_NEAR_POOL = 6458;

export async function getRheaPriceInNear(): Promise<number> {
  const account = await getAnonymousAccount();
  
  const [rheaMeta, wnearMeta] = await Promise.all([
    getTokenMetadata(account, RHEA),
    getTokenMetadata(account, WNEAR)
  ]);

  return getPoolPrice(
    account,
    RHEA_NEAR_POOL,
    RHEA,
    WNEAR,
    rheaMeta.decimals,
    wnearMeta.decimals
  );
}