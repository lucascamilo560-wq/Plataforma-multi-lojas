import { SellerSectionPage } from '../store-dashboard/SellerSectionPage'

export function SellerNewProductPage() {
  return (
    <SellerSectionPage
      kicker="Novo produto"
      icon="package"
      title="Cadastre um novo produto"
      description="Adicione itens ao catálogo da sua loja e deixe sua vitrine sempre atualizada."
      cardTitle="Cadastro de produto"
      cardSubtitle="Nome, preço, estoque e descrição"
    />
  )
}
