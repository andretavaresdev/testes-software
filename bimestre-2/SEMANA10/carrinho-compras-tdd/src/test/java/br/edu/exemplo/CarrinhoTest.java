package br.edu.exemplo;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CarrinhoTest {
    @Test
    void carrinhoVazioDeveTerTotalZero() {
        Carrinho carrinho = new Carrinho();
        assertEquals(0, carrinho.getTotal(), 0.001);
    }

    @Test
    void deveAdicionarUmProduto() {
        Carrinho carrinho = new Carrinho();
        carrinho.adicionarProduto(new Produto("Teclado", 100));
        assertEquals(100, carrinho.getTotal(), 0.001);
    }

    @Test
    void deveSomarVariosProdutos() {
        Carrinho carrinho = new Carrinho();
        carrinho.adicionarProduto(new Produto("Teclado", 100));
        carrinho.adicionarProduto(new Produto("Mouse", 50));
        assertEquals(150, carrinho.getTotal(), 0.001);
    }

    @Test
    void deveRemoverProduto() {
        Carrinho carrinho = new Carrinho();
        Produto teclado = new Produto("Teclado", 100);
        Produto mouse = new Produto("Mouse", 50);
        carrinho.adicionarProduto(teclado);
        carrinho.adicionarProduto(mouse);
        carrinho.removerProduto(mouse);
        assertEquals(100, carrinho.getTotal(), 0.001);
    }

    @Test
    void naoDevePermitirPrecoNegativo() {
        assertThrows(IllegalArgumentException.class, () -> new Produto("Teclado", -100));
    }

    @Test
    void naoDeveAplicarDescontoAbaixoDe500() {
        Carrinho carrinho = new Carrinho();
        carrinho.adicionarProduto(new Produto("Teclado", 499.99));
        assertEquals(499.99, carrinho.getTotal(), 0.001);
    }

    @Test
    void deveAplicarDescontoEm500() {
        Carrinho carrinho = new Carrinho();
        carrinho.adicionarProduto(new Produto("Teclado", 500));
        assertEquals(450, carrinho.getTotal(), 0.001);
    }

    @Test
    void deveAplicarDescontoAcimaDe500() {
        Carrinho carrinho = new Carrinho();
        carrinho.adicionarProduto(new Produto("Teclado", 500.01));
        assertEquals(450.009, carrinho.getTotal(), 0.001);
    }

    @Test
    void deveAplicarDescontoNaSomaDosProdutos() {
        Carrinho carrinho = new Carrinho();
        carrinho.adicionarProduto(new Produto("Teclado", 400));
        carrinho.adicionarProduto(new Produto("Mouse", 200));
        assertEquals(540, carrinho.getTotal(), 0.001);
    }
}
