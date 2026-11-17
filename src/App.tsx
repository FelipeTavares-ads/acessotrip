import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { BareLayout, PageHeader, PartnerLayout, RouteFocus, TravelerLayout } from './components/Layout'
import { StoreProvider } from './state/store'
import Landing from './pages/Landing'
import { Cadastro, Entrar, RecuperarSenha } from './pages/Auth'
import { Buscar, Inicio, Resultados } from './pages/Search'
import { Avaliar, Local } from './pages/Place'
import { Favoritos, MinhasAvaliacoes, Necessidades, Perfil } from './pages/Account'
import Roteiro from './pages/Roteiro'
import {
  AvaliacoesParceiro,
  CadastroParceiro,
  Dashboard,
  Empresa,
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

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<BareLayout />}>
            <Route index element={<Landing />} />
            <Route path="cadastro" element={<Cadastro />} />
            <Route path="entrar" element={<Entrar />} />
            <Route path="recuperar-senha" element={<RecuperarSenha />} />
            <Route path="parceiro/cadastro" element={<CadastroParceiro />} />
          </Route>
          <Route element={<TravelerLayout />}>
            <Route path="inicio" element={<Inicio />} />
            <Route path="buscar" element={<Buscar />} />
            <Route path="resultados" element={<Resultados />} />
            <Route path="local/:id" element={<Local />} />
            <Route path="local/:id/avaliar" element={<Avaliar />} />
            <Route path="favoritos" element={<Favoritos />} />
            <Route path="minhas-avaliacoes" element={<MinhasAvaliacoes />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="perfil/necessidades" element={<Necessidades />} />
            <Route path="roteiro" element={<Roteiro />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="parceiro" element={<PartnerLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="ficha" element={<EditarFicha />} />
            <Route path="preview" element={<Preview />} />
            <Route path="premium" element={<Premium />} />
            <Route path="empresa" element={<Empresa />} />
            <Route path="avaliacoes" element={<AvaliacoesParceiro />} />
            <Route path="notificacoes" element={<Notificacoes />} />
          </Route>
        </Routes>
        <RouteFocus />
      </BrowserRouter>
    </StoreProvider>
  )
}
