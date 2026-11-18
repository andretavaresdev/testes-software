package br.edu.exemplo;

import br.edu.exemplo.model.Produto;
import br.edu.exemplo.repository.ProdutoRepository;
import br.edu.exemplo.service.ProdutoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @Transactional
class ProdutoServiceIntegrationTest {
    @Autowired ProdutoService service;
    @Autowired ProdutoRepository repository;

    @Test
    void deveCadastrarERecuperarProduto() {
        Produto produto = service.cadastrar("Teclado", 150.0);
        assertNotNull(produto.getId());
        Produto salvo = repository.findById(produto.getId()).orElseThrow();
        assertEquals("Teclado", salvo.getNome());
        assertEquals(150.0, salvo.getPreco(), 0.001);
    }

    @Test
    void naoDevePersistirProdutoComNomeEmBranco() {
        long antes = repository.count();
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar("  ", 80.0));
        assertEquals(antes, repository.count());
    }

    @Test
    void deveAtualizarPrecoPersistido() {
        Produto produto = service.cadastrar("Mouse", 80.0);
        service.atualizarPreco(produto.getId(), 95.0);
        Produto atualizado = repository.findById(produto.getId()).orElseThrow();
        assertEquals(95.0, atualizado.getPreco(), 0.001);
    }
}
