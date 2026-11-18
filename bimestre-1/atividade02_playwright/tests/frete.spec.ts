import { test, expect } from '@playwright/test';

async function preencherFrete(page, cep: string, valor: string) {
  await page.goto('/frete');
  await page.getByLabel('CEP').fill(cep);
  await page.getByLabel('Valor do pedido').fill(valor);
  await page.getByRole('button', { name: 'Calcular frete' }).click();
}

test.describe('calculadora de frete — caminhos válidos', () => {
  test('CEP iniciado por 8 e valor abaixo de R$ 200 cobra R$ 15,00', async ({ page }) => {
    await preencherFrete(page, '80000000', '199,99');

    const resultado = page.locator('#resultado');
    await expect(resultado).toBeVisible();
    await expect(resultado).toHaveText('Frete: R$ 15,00');
    await expect(resultado).toHaveAttribute('role', 'status');
  });

  test('CEP que não inicia por 8 e valor abaixo de R$ 200 cobra R$ 25,00', async ({ page }) => {
    await preencherFrete(page, '01000000', '150,00');

    const resultado = page.locator('#resultado');
    await expect(resultado).toHaveText('Frete: R$ 25,00');
    await expect(resultado).toHaveAttribute('role', 'status');
  });

  test('aceita valor com ponto decimal além de vírgula', async ({ page }) => {
    await preencherFrete(page, '80000000', '150.50');

    const resultado = page.locator('#resultado');
    await expect(resultado).toHaveText('Frete: R$ 15,00');
  });
});

test.describe('calculadora de frete — valores-limite do pedido (R$ 200,00)', () => {
  test('R$ 199,99 ainda cobra frete', async ({ page }) => {
    await preencherFrete(page, '01000000', '199,99');
    await expect(page.locator('#resultado')).toHaveText('Frete: R$ 25,00');
  });

  test('R$ 200,00 (limite) já é frete grátis', async ({ page }) => {
    await preencherFrete(page, '01000000', '200,00');
    const resultado = page.locator('#resultado');
    await expect(resultado).toHaveText('Frete grátis');
    await expect(resultado).toHaveAttribute('role', 'status');
  });

  test('R$ 200,01 é frete grátis', async ({ page }) => {
    await preencherFrete(page, '80000000', '200,01');
    await expect(page.locator('#resultado')).toHaveText('Frete grátis');
  });
});

test.describe('calculadora de frete — classes de equivalência inválidas', () => {
  test('CEP com menos de 8 dígitos é inválido', async ({ page }) => {
    await preencherFrete(page, '1234567', '100,00');
    const resultado = page.locator('#resultado');
    await expect(resultado).toHaveText('Dados inválidos');
    await expect(resultado).toHaveAttribute('role', 'alert');
  });

  test('CEP com mais de 8 dígitos é inválido', async ({ page }) => {
    await preencherFrete(page, '123456789', '100,00');
    await expect(page.locator('#resultado')).toHaveText('Dados inválidos');
  });

  test('CEP com letras é inválido', async ({ page }) => {
    await preencherFrete(page, '1234567A', '100,00');
    await expect(page.locator('#resultado')).toHaveText('Dados inválidos');
  });

  test('valor com três casas decimais é inválido', async ({ page }) => {
    await preencherFrete(page, '80000000', '10,123');
    await expect(page.locator('#resultado')).toHaveText('Dados inválidos');
  });

  test('valor igual a zero é inválido (não é maior que zero)', async ({ page }) => {
    await preencherFrete(page, '80000000', '0');
    await expect(page.locator('#resultado')).toHaveText('Dados inválidos');
  });

  test('valor vazio é inválido', async ({ page }) => {
    await preencherFrete(page, '80000000', '');
    await expect(page.locator('#resultado')).toHaveText('Dados inválidos');
  });

  test('valor não numérico é inválido', async ({ page }) => {
    await preencherFrete(page, '80000000', 'grátis');
    await expect(page.locator('#resultado')).toHaveText('Dados inválidos');
  });
});
