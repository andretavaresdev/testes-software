import { test, expect } from '@playwright/test';

async function preencherSenha(page, senha: string, confirmacao: string) {
  await page.goto('/senha');
  await page.getByLabel('Nova senha').fill(senha);
  await page.getByLabel('Confirmar senha').fill(confirmacao);
  await page.getByRole('button', { name: 'Cadastrar senha' }).click();
}

test.describe('cadastro de senha — caminho válido', () => {
  test('senha forte com confirmação igual é cadastrada e limpa o formulário', async ({ page }) => {
    await preencherSenha(page, 'Abcdef12', 'Abcdef12');

    const resultado = page.locator('#resultado');
    await expect(resultado).toBeVisible();
    await expect(resultado).toHaveText('Senha cadastrada');
    await expect(resultado).toHaveAttribute('role', 'status');
    await expect(page.getByLabel('Nova senha')).toHaveValue('');
    await expect(page.getByLabel('Confirmar senha')).toHaveValue('');
  });
});

test.describe('cadastro de senha — valores-limite de tamanho', () => {
  test('8 caracteres (limite mínimo) é aceito', async ({ page }) => {
    await preencherSenha(page, 'Abcdef12', 'Abcdef12');
    await expect(page.locator('#resultado')).toHaveText('Senha cadastrada');
  });

  test('7 caracteres (abaixo do mínimo) é recusado', async ({ page }) => {
    await preencherSenha(page, 'Abcdef1', 'Abcdef1');
    const resultado = page.locator('#resultado');
    await expect(resultado).toHaveText('Senha fora do padrão');
    await expect(resultado).toHaveAttribute('role', 'alert');
  });

  test('20 caracteres (limite máximo) é aceito', async ({ page }) => {
    const senha = 'Abcdefghij1234567890'.slice(0, 20);
    await preencherSenha(page, senha, senha);
    await expect(page.locator('#resultado')).toHaveText('Senha cadastrada');
  });

  test('21 caracteres (acima do máximo) é recusado', async ({ page }) => {
    const senha = 'Abcdefghij123456789012'.slice(0, 21);
    await preencherSenha(page, senha, senha);
    await expect(page.locator('#resultado')).toHaveText('Senha fora do padrão');
  });
});

test.describe('cadastro de senha — classes de equivalência inválidas', () => {
  test('sem letra maiúscula é recusado', async ({ page }) => {
    await preencherSenha(page, 'abcdefg1', 'abcdefg1');
    await expect(page.locator('#resultado')).toHaveText('Senha fora do padrão');
  });

  test('sem letra minúscula é recusado', async ({ page }) => {
    await preencherSenha(page, 'ABCDEFG1', 'ABCDEFG1');
    await expect(page.locator('#resultado')).toHaveText('Senha fora do padrão');
  });

  test('sem dígito é recusado', async ({ page }) => {
    await preencherSenha(page, 'Abcdefgh', 'Abcdefgh');
    await expect(page.locator('#resultado')).toHaveText('Senha fora do padrão');
  });

  test('com espaço é recusado', async ({ page }) => {
    await preencherSenha(page, 'Abc def1', 'Abc def1');
    await expect(page.locator('#resultado')).toHaveText('Senha fora do padrão');
  });
});

test.describe('cadastro de senha — confirmação divergente', () => {
  test('formato válido mas confirmação diferente não cadastra', async ({ page }) => {
    await preencherSenha(page, 'Abcdef12', 'Abcdef13');
    const resultado = page.locator('#resultado');
    await expect(resultado).toHaveText('As senhas não coincidem');
    await expect(resultado).toHaveAttribute('role', 'alert');
  });
});
