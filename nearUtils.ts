import { connect, keyStores, Account } from 'near-api-js';

export async function getAnonymousAccount(): Promise<Account> {
  const near = await connect({
    networkId: 'mainnet',
    nodeUrl: 'https://rpc.mainnet.near.org',
    walletUrl: 'https://wallet.near.org',
    helperUrl: 'https://helper.mainnet.near.org',
    headers: {},
    deps: { keyStore: new keyStores.InMemoryKeyStore() },
  });
  return new Account(near.connection, 'anonymous');
}

export async function getTokenMetadata(account: Account, token: string) {
  return account.viewFunction(token, 'ft_metadata', {});
}

export async function getPoolPrice(
  account: Account,
  poolId: number,
  tokenIn: string,
  tokenOut: string,
  decimalsIn: number,
  decimalsOut: number
): Promise<number> {
  // Используем BigInt для точного представления больших чисел
  const amountIn = (10n ** BigInt(decimalsIn)).toString();
  
  try {
    const amountOut: string = await account.viewFunction('v2.ref-finance.near', 'get_return', {
      pool_id: poolId,
      token_in: tokenIn,
      amount_in: amountIn,
      token_out: tokenOut,
    });

    // Конвертируем BigInt в число с плавающей точкой
    const amountOutBigInt = BigInt(amountOut);
    return Number(amountOutBigInt) / 10 ** decimalsOut;
  } catch (err) {
    console.error('Ошибка в getPoolPrice:', { 
      poolId, 
      tokenIn, 
      tokenOut,
      amountIn,
      decimalsIn,
      decimalsOut
    });
    throw err;
  }
}