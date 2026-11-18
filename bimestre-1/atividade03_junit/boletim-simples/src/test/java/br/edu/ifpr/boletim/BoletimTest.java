package br.edu.ifpr.boletim;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class BoletimTest {

    @Test
    void deveAprovarAlunoComMediaOito() {
        Boletim boletim = new Boletim();
        String resultado = boletim.verificarSituacao(8);
        assertEquals("APROVADO", resultado);
    }

    @Test
    void deveRecuperarNotaAlunoComMediaQuatro() {
        Boletim boletim = new Boletim();
        String resultado = boletim.verificarSituacao(4);
        assertEquals("RECUPERACAO", resultado);
    }

    @Test
    void deveReprovarAlunoComMediaDois() {
        Boletim boletim = new Boletim();
        String resultado = boletim.verificarSituacao(2);
        assertEquals("REPROVADO", resultado);
    }

    @Test
    void deveCalcularMediaIgualCinco() {
        Boletim boletim = new Boletim();
        double resultado = boletim.calcularMedia(5,5);
        assertEquals(5,resultado);
    }

    @Test
    void deveAprovarNoLimiteExatoSete() {
        Boletim boletim = new Boletim();
        assertEquals("APROVADO", boletim.verificarSituacao(7));
    }

    @Test
    void deveColocarEmRecuperacaoLogoAbaixoDeSete() {
        Boletim boletim = new Boletim();
        assertEquals("RECUPERACAO", boletim.verificarSituacao(6.9));
    }

    @Test
    void deveReprovarLogoAbaixoDeQuatro() {
        Boletim boletim = new Boletim();
        assertEquals("REPROVADO", boletim.verificarSituacao(3.9));
    }

    @Test
    void deveCalcularMediaComParteDecimal() {
        Boletim boletim = new Boletim();
        assertEquals(7.5, boletim.calcularMedia(7, 8), 0.0001);
    }

    @Test
    void deveCalcularMediaZeroQuandoAmbasNotasSaoZero() {
        Boletim boletim = new Boletim();
        assertEquals(0.0, boletim.calcularMedia(0, 0), 0.0001);
    }

    @Test
    void deveContarZeroAprovadosEmArrayVazio() {
        Boletim boletim = new Boletim();
        assertEquals(0, boletim.contarAprovados(new double[] {}));
    }

    @Test
    void deveContarUmAprovadoComUnicoElementoAcimaDoLimite() {
        Boletim boletim = new Boletim();
        assertEquals(1, boletim.contarAprovados(new double[] {8}));
    }

    @Test
    void deveContarZeroAprovadosComUnicoElementoAbaixoDoLimite() {
        Boletim boletim = new Boletim();
        assertEquals(0, boletim.contarAprovados(new double[] {6.5}));
    }

    @Test
    void deveContarAprovadosMisturandoAprovadosENaoAprovados() {
        Boletim boletim = new Boletim();
        assertEquals(2, boletim.contarAprovados(new double[] {8, 5, 7, 3}));
    }
}
