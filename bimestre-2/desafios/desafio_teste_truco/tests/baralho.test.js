'use strict';

const { criarCarta } = require('../src/carta');
const { criarBaralho, criarRng, embaralhar, distribuir, validarDistribuicao } = require('../src/baralho');

describe('Baralho — criação, embaralhamento e distribuição', () => {
  test('CT-BARALHO-01 — o baralho limpo tem 40 cartas únicas, sem 8, 9, 10 ou curingas', () => {
    const baralho = criarBaralho();
    expect(baralho).toHaveLength(40);
    const ids = new Set(baralho.map((c) => c.id));
    expect(ids.size).toBe(40);
    expect(baralho.some((c) => ['8', '9', '10', 'Curinga'].includes(c.valor))).toBe(false);
  });

  test('CT-BARALHO-02 — cada naipe aparece 10 vezes e cada valor aparece 4 vezes', () => {
    const baralho = criarBaralho();
    ['ouros', 'espadas', 'copas', 'paus'].forEach((naipe) => {
      expect(baralho.filter((c) => c.naipe === naipe)).toHaveLength(10);
    });
    ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'].forEach((valor) => {
      expect(baralho.filter((c) => c.valor === valor)).toHaveLength(4);
    });
  });

  test('CT-BARALHO-03 — embaralhar com a mesma semente produz a mesma ordem', () => {
    const original = criarBaralho();
    const a = embaralhar(original, criarRng(12345));
    const b = embaralhar(original, criarRng(12345));
    const c = embaralhar(original, criarRng(99999));
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect(a).not.toEqual(original);
  });

  test('CT-BARALHO-04 — embaralhar não altera o baralho original e preserva as 40 cartas', () => {
    const original = criarBaralho();
    const copia = original.slice();
    const misturado = embaralhar(original, criarRng(7));
    expect(original).toEqual(copia);
    expect(new Set(misturado.map((c) => c.id)).size).toBe(40);
  });

  test('CT-BARALHO-05 — a distribuição entrega 3 cartas a cada jogador e uma vira, começando à direita do carteador', () => {
    const baralho = criarBaralho();
    const { maos, vira, resto } = distribuir(baralho, 3);
    expect(maos).toHaveLength(4);
    maos.forEach((mao) => expect(mao).toHaveLength(3));
    expect(vira).toEqual(baralho[12]);
    expect(resto).toHaveLength(27);
    expect(maos[0][0]).toEqual(baralho[0]);
    expect(maos[1][0]).toEqual(baralho[1]);
    expect(maos[2][0]).toEqual(baralho[2]);
    expect(maos[3][0]).toEqual(baralho[3]);
  });

  test('CT-BARALHO-06 — cartas da mão, vira e resto são disjuntas e cobrem o baralho', () => {
    const baralho = embaralhar(criarBaralho(), criarRng(21));
    const { maos, vira, resto } = distribuir(baralho, 0);
    const ids = [...maos.flat(), vira, ...resto].map((c) => c.id);
    expect(ids).toHaveLength(40);
    expect(new Set(ids).size).toBe(40);
  });

  test('CT-BARALHO-07 — recusa baralho com tamanho diferente de 40 ou com cartas repetidas', () => {
    expect(() => distribuir(criarBaralho().slice(0, 39))).toThrow(/40 cartas/);
    const repetido = criarBaralho();
    repetido[10] = criarCarta('4', 'ouros');
    expect(() => distribuir(repetido)).toThrow(/cartas repetidas/);
  });

  test('CT-BARALHO-08 — validar distribuição rejeita mão com número errado de cartas, vira ausente ou carta repetida', () => {
    expect(() => validarDistribuicao({ maos: [[], [], [], []], vira: criarCarta('4', 'paus') }))
      .toThrow(/exatamente 3 cartas/);
    expect(() => validarDistribuicao({ maos: [[criarCarta('3', 'paus')], [], [], []] }))
      .toThrow(/vira é obrigatória/);
    expect(() => validarDistribuicao({
      maos: [
        [criarCarta('3', 'paus'), criarCarta('3', 'paus'), criarCarta('2', 'paus')],
        [criarCarta('A', 'paus'), criarCarta('K', 'paus'), criarCarta('J', 'paus')],
        [criarCarta('Q', 'paus'), criarCarta('7', 'paus'), criarCarta('6', 'paus')],
        [criarCarta('5', 'paus'), criarCarta('4', 'paus'), criarCarta('3', 'copas')],
      ],
      vira: criarCarta('2', 'copas'),
    })).toThrow(/Carta repetida/);
  });
});
