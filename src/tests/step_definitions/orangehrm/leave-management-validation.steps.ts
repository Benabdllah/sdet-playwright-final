import { Given as Angenommen, When as Wenn, Then as Dann } from '@cucumber/cucumber';

// SALDO-VALIDIERUNGS-SPEZIFISCHE STEPS

Angenommen('mein Jahresurlaub-Saldo beträgt {int} Tage', async function (this: any, days: number) {
  this.log(`📝 Jahresurlaub-Saldo auf ${days} Tage gesetzt`, 'info');
});
