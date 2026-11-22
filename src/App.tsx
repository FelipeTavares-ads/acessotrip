import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { BareLayout, PageHeader, PartnerLayout, RouteFocus, TravelerLayout } from './components/Layout'
import { AcessoNaoPermitido, RequireAuth } from './components/Guard'
import { DominiosProvider } from './state/dominios'
import { SessionProvider } from './state/session'
import { StoreProvider } from './state/store'
import Landing from './pages/Landing'
import { Cadastro, Entrar } from './pages/Auth'
import { Buscar, Inicio, Resultados } from './pages/Search'
import { Avaliar, Local } from './pages/Place'
import { Favoritos, MinhasAvaliacoes, Necessidades, Perfil } from './pages/Account'
import { Roteiro, RoteiroSalvo } from './pages/Roteiro'
import {
  AvaliacoesParceiro,
  CadastroParceiro,
  Dashboard,
  EditarFicha,
  Notificacoes,
  Onboarding,
  Premium,
  Preview,
} from './pages/partner/Partner'

function NotFound() {
  return (
    <>
      <PageHeader title="Página não encontrada" lead="O endereço pode ter mudado ou não existe." />
      <Link to="/" className="font-semibold text-brand">
        Voltar para o início
      </Link>
    </>
  )
}

/*
 * Mapa telas × requisitos (PDF do PI):
 * RF01 /cadastro · RF02 /entrar · RF03 /perfil/necessidades · RF04–RF10 /inicio, /buscar, /resultados
 * RF11–RF13 /local/:id · RF14 /local/:id/avaliar · RF15 denúncia em /local/:id · RF26 /roteiro
 * RF16 /parceiro/cadastro · RF17 /parceiro/onboarding · RF18–RF20 /parceiro/ficha · RF21–RF22 /parceiro
 * RF23 /parceiro/notificacoes · RF24 /parceiro/premium · RF25 sem API (lacuna B2)
 */
export default function App() {
  return (
    <SessionProvider>
      <DominiosProvider>
        <BrowserRouter>
          <StoreProvider>
            <Routes>
              <Route element={<BareLayout />}>
                <Route index element={<Landing />} />
                <Route path="cadastro" element={<Cadastro />} />
                <Route path="entrar" element={<Entrar />} />
                <Route path="parceiro/cadastro" element={<CadastroParceiro />} />
                <Route path="acesso-restrito" element={<AcessoNaoPermitido />} />
              </Route>
              <Route element={<TravelerLayout />}>
                <Route path="inicio" element={<Inicio />} />
                <Route path="buscar" element={<Buscar />} />
                <Route path="resultados" element={<Resultados />} />
                <Route path="local/:id" element={<Local />} />
                <Route element={<RequireAuth perfil="VIAJANTE" />}>
                  <Route path="local/:id/avaliar" element={<Avaliar />} />
                  <Route path="favoritos" element={<Favoritos />} />
                  <Route path="minhas-avaliacoes" element={<MinhasAvaliacoes />} />
                  <Route path="perfil" element={<Perfil />} />
                  <Route path="perfil/necessidades" element={<Necessidades />} />
                  <Route path="roteiro" element={<Roteiro />} />
                  <Route path="roteiro/:id" element={<RoteiroSalvo />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="parceiro" element={<PartnerLayout />}>
                <Route element={<RequireAuth perfil="ESTABELECIMENTO" />}>
                  <Route index element={<Dashboard />} />
                  <Route path="onboarding" element={<Onboarding />} />
                  <Route path="ficha" element={<EditarFicha />} />
                  <Route path="preview" element={<Preview />} />
                  <Route path="premium" element={<Premium />} />
                  <Route path="avaliacoes" element={<AvaliacoesParceiro />} />
                  <Route path="notificacoes" element={<Notificacoes />} />
                </Route>
              </Route>
            </Routes>
            <RouteFocus />
          </StoreProvider>
        </BrowserRouter>
      </DominiosProvider>
    </SessionProvider>
  )
}
