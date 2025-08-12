import { getBscRheaPriceInUsdt } from './bscCalculateRheaPriceInUsdt';
import { getNearRheaPriceInUsdt } from './nearCalculateRheaPriceInUsdt';

// Форматирование чисел для вывода
function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6
  });
}

// Расчет разницы в процентах
function calculateDifference(a: number, b: number): {
  difference: number;
  percentage: number;
  isHigher: boolean;
} {
  const diff = Math.abs(a - b);
  const percentage = (diff / Math.min(a, b)) * 100;
  return {
    difference: diff,
    percentage,
    isHigher: a > b
  };
}

async function main() {
  try {
    console.clear(); // очищаем консоль перед каждым выводом

    const [bscData, nearData] = await Promise.allSettled([
      getBscRheaPriceInUsdt(),
      getNearRheaPriceInUsdt()
    ]);

    const bscStatus = bscData.status === 'fulfilled' ? '✅' : '❌';
    const nearStatus = nearData.status === 'fulfilled' ? '✅' : '❌';

    console.log('═'.repeat(50));
    console.log('🔄 Сравнение цен RHEA/USDT между блокчейнами');
    console.log('═'.repeat(50));
    console.log(`BSC Status: ${bscStatus}\tNEAR Status: ${nearStatus}`);
    console.log('─'.repeat(50));

    if (bscData.status === 'fulfilled') {
      const { price, inversePrice, timestamp } = bscData.value;
      console.log(`📊 Binance Smart Chain (BSC):`);
      console.log(`  1 RHEA = ${formatPrice(price)} USDT`);
      console.log(`  1 USDT = ${formatPrice(inversePrice)} RHEA`);
      console.log(`  Timestamp: ${new Date(timestamp).toLocaleString()}`);
    } else {
      console.log('❌ Ошибка при получении цены BSC:', bscData.reason);
    }

    console.log('─'.repeat(50));

    if (nearData.status === 'fulfilled') {
      const { price, inversePrice, timestamp } = nearData.value;
      console.log(`🌐 NEAR Protocol:`);
      console.log(`  1 RHEA = ${formatPrice(price)} USDT`);
      console.log(`  1 USDT = ${formatPrice(inversePrice)} RHEA`);
      console.log(`  Timestamp: ${new Date(timestamp).toLocaleString()}`);
    } else {
      console.log('❌ Ошибка при получении цены NEAR:', nearData.reason);
    }

    if (bscData.status === 'fulfilled' && nearData.status === 'fulfilled') {
      const bscPrice = bscData.value.price;
      const nearPrice = nearData.value.price;

      const comparison = calculateDifference(bscPrice, nearPrice);

      console.log('═'.repeat(50));
      console.log('📈 Сравнение цен:');
      console.log('─'.repeat(50));

      if (comparison.difference > 0) {
        const higherChain = comparison.isHigher ? "BSC" : "NEAR";
        const lowerChain = comparison.isHigher ? "NEAR" : "BSC";
        const priceDiff = comparison.difference;

        // ANSI-цвета
        const reset = '\x1b[0m';
        const yellow = '\x1b[33m';
        const red = '\x1b[31m';
        const color =
          comparison.percentage >= 0.1 ? red :
          comparison.percentage >= 1 ? yellow :
          reset;
          
        console.log(`${color}Разница: ${formatPrice(priceDiff)} USDT`);
        console.log(`Процентная разница: ${comparison.percentage.toFixed(2)}%`);
        console.log(`Цена на ${higherChain} выше, чем на ${lowerChain}${reset}`);

        if (comparison.percentage > 2) {
          console.log(`${color}⚠️ Возможность арбитража!`);
          console.log(`  Купить на ${lowerChain}, продать на ${higherChain}`);
          console.log(`  Потенциальная прибыль: ~${comparison.percentage.toFixed(2)}%${reset}`);
        }
      } else {
        console.log('Цены идентичны');
      }
    }

    console.log('═'.repeat(50));
  } catch (error) {
    console.error('Критическая ошибка:', error instanceof Error ? error.message : error);
  }
}

// Запускаем функцию main() каждые 10 секунд
setInterval(main, 10000);

// Запускаем сразу при старте (без ожидания первой задержки)
main();
