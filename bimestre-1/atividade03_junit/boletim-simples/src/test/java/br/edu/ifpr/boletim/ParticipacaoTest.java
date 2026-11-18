package br.edu.ifpr.boletim;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ParticipacaoTest {

    @Test
    void deveDarTresPontosQuandoEntregouEParticipou() {
        Participacao participacao = new Participacao();
        assertEquals(3, participacao.calcularPontos(true, true));
    }

    @Test
    void deveDarDoisPontosQuandoApenasEntregou() {
        Participacao participacao = new Participacao();
        assertEquals(2, participacao.calcularPontos(true, false));
    }

    @Test
    void deveDarUmPontoQuandoApenasParticipou() {
        Participacao participacao = new Participacao();
        assertEquals(1, participacao.calcularPontos(false, true));
    }

    @Test
    void deveDarZeroPontosQuandoNaoEntregouNemParticipou() {
        Participacao participacao = new Participacao();
        assertEquals(0, participacao.calcularPontos(false, false));
    }
}
