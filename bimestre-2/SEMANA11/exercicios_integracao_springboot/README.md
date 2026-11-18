# Testes de integração com Spring Boot e JUnit 5

Projeto com Java 17, Maven, Spring Boot 3.3.13, Spring Data JPA, H2, JUnit 5 e MockMvc.

## Testes implementados

- CT01: cadastra Teclado por 150 e busca o registro no repositório.
- CT02: rejeita nome em branco e confirma que não houve novo registro.
- CT03: cadastra Mouse por 80, atualiza para 95 e consulta o preço salvo.
- CT04: cadastra Mouse pela API e verifica HTTP 200 e os campos do JSON.
- CT05: cadastra pela API, obtém o ID e consulta o produto por GET.

Os testes não substituem `ProdutoRepository` nem `ProdutoService` por mocks.

## Execução

```bash
mvn test
```

Os cinco casos foram implementados. A execução oficial é feita pelo workflow `Testes Java` do repositório. O resultado deve ser conferido na aba Actions após cada execução.

## Perguntas de discussão

**Por que usar `repository.findById()`?** Porque consultar o repositório confere o registro acessível pela camada de persistência, em vez de verificar apenas o objeto devolvido pelo serviço.

**O que `@Transactional` faz após o teste?** Por padrão, o Spring desfaz as alterações da transação ao terminar cada método de teste, evitando interferência entre os testes.

**Quais componentes o MockMvc testa?** Controller, Service, Repository e banco H2, usando a configuração real do Spring Boot.

**Por que não precisa de servidor HTTP?** Porque o MockMvc executa requisições simuladas pelo mecanismo MVC dentro do contexto de testes, sem abrir uma porta de rede.

**Qual é a diferença de um teste unitário do controller?** Aqui são usadas as dependências reais do contexto Spring e a persistência H2. Em um teste unitário, as dependências do controller poderiam ser substituídas por objetos simulados.
