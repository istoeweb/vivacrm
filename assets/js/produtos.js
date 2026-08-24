/* ===================================
   PRODUTOS.JS — Dados de produtos
   Vida de Ouro Jacareí
   =================================== */

window.PRODUTOS = {
  "seguro-auto": {
    nome: "Seguro Auto",
    categoria: "Seguros de Veículos",
    tag: "Mais Vendido",
    tagline: "Proteção completa para o seu carro, do começo ao fim da apólice.",
    descricao: "O Seguro Auto da Vida de Ouro Jacareí oferece proteção inteligente contra roubo, furto, colisão, incêndio, vidros e danos a terceiros. Trabalhamos com as melhores seguradoras do mercado para encontrar a melhor cobertura pelo melhor preço para o seu perfil de motorista e o seu veículo — seja carro novo, usado ou renovação.",
    publico: "Para motoristas de carros nacionais e importados, novos ou usados, que querem tranquilidade no trânsito do Vale do Paraíba e em todo o Brasil.",
    coberturas: [
      { t: "Roubo e Furto Total e Parcial", d: "Indenização em caso de perda do veículo por roubo, furto ou tentativa qualificada." },
      { t: "Colisão e Perda Total", d: "Cobertura contra colisões, capotagem, queda e derramamento em acidentes." },
      { t: "Carro Reserva", d: "Veículo substituto enquanto o seu está em reparo — disponível em varias classes." },
      { t: "Guincho 24h", d: "Assistência 24 horas em todo o território nacional para panes e acidentes." },
      { t: "Vidros, Retrovisores e Faróis", d: "Cobertura para vidros, lanternas, faróis e retrovisores." },
      { t: "Danos a Terceiros", d: "Cobertura de responsabilidade civil facultativa para danos materiais e corporais." }
    ],
    seguradoras: ["Porto Seguro", "HDI", "Tokio Marine", "Allianz", "Zurich", "Mapfre", "Liberty", "Sompo", "Sura", "Suhai", "Azul Seguros", "Alfa", "Chubb"],
    faq: [
      { q: "Posso parcelar o seguro auto?", a: "Sim! A maioria das seguradoras permite parcelamento em até 12 vezes no cartão de crédito, além de opções no boleto bancário. As condições variam por seguradora." },
      { q: "Faz análise do perfil do condutor?", a: "Sim. Analisamos idade, tempo de habilitação, CEP de pernoite, uso do veículo e histórico do condutor para encontrar a melhor condição." },
      { q: "Em caso de sinistro vocês me acompanham?", a: "Sim. Nossa equipe acompanha todo o processo, desde a abertura do chamado junto à seguradora até o reparo e indenização." },
      { q: "Atende veículos com mais de 10 anos?", a: "Sim, atendemos veículos de todas as idades. As condições variam conforme a tabela da seguradora, mas sempre buscamos a melhor opção." }
    ]
  },

  "seguro-moto": {
    nome: "Seguro Moto",
    categoria: "Seguros de Veículos",
    tag: "Proteção para Motociclistas",
    tagline: "Cobertura completa para sua moto, do trabalho ao lazer.",
    descricao: "O Seguro Moto protege motociclistas contra roubo, furto, colisão, perda total e danos a terceiros. Motos novas, usadas e renovações contam com contratação rápida, transparente e suporte dedicado em todo o processo.",
    publico: "Para motociclistas que usam a moto para trabalho, lazer ou entrega, em cidades do Vale do Paraíba, Litoral Norte e todo o Brasil.",
    coberturas: [
      { t: "Roubo, Furto e Colisão", d: "Cobertura indenitária em caso de perda por roubo, furto ou colisão." },
      { t: "Perda Total", d: "Indenização em caso de perda total do veículo por qualquer evento coberto." },
      { t: "Danos a Terceiros", d: "Responsabilidade civil facultativa para danos materiais e corporais a terceiros." },
      { t: "Assistência 24h", d: "Guincho e socorro para pane e acidentes em todo o Brasil." },
      { t: "Contratação Rápida", d: "Análise personalizada e emissão da apólice sem burocracia." }
    ],
    seguradoras: ["Suhai", "Porto Seguro", "Allianz", "Tokio Marine", "Zurich", "Mapfre", "Liberty", "Azul Seguros"],
    faq: [
      { q: "Seguro moto é mais caro do que auto?", a: "Depende do perfil, modelo e uso. Comparando várias seguradoras conseguimos condições justas, muitas vezes equivalente ou inferior ao esperado." },
      { q: "Cobertura para moto de entrega?", a: "Sim. Trabalhamos com coberturas adaptadas para motofretistas, incluindo responsabilidade civil e assistência 24h." },
      { q: "Faço renovação de outro corretor?", a: "Sim, podemos migrar a sua apólice com condições melhores, sem burocracia, mantendo a classe de bônus já conquistada." }
    ]
  },

  "seguro-caminhao": {
    nome: "Seguro Caminhão",
    categoria: "Seguros de Veículos",
    tag: "Para Autônomos e Frotistas",
    tagline: "Não pare de rodar: proteja seu caminhão e sua renda.",
    descricao: "Seguro Caminhão para autônomos, frotistas e empresas de transporte. Análise técnica personalizada, foco em custo-benefício e pós-venda ativo durante toda a vigência da apólice. Proteção para o veículo, para a carga e para o seu negócio.",
    publico: "Para caminhoneiros autônomos, transportadoras, frotistas e empresas de logística em geral.",
    coberturas: [
      { t: "Colisão, Roubo e Furto", d: "Cobertura básica do casco contra colisão, capotagem, roubo e furto." },
      { t: "Incêndio e Danos a Terceiros", d: "Cobertura contra incêndio e responsabilidade civil facultativa." },
      { t: "Análise Personalizada", d: "Avaliamos tipo de carga, rota e uso para montar a apólice ideal." },
      { t: "Suporte em Sinistros", d: "Acompanhamento técnico em todo o processo de regulação e indenização." },
      { t: "Assistência 24h", d: "Guincho especializado para caminhões em todo o Brasil." }
    ],
    seguradoras: ["Porto Seguro", "Allianz", "Tokio Marine", "Zurich", "Mapfre", "Sompo", "Sura", "Liberty", "Chubb", "Sancor"],
    faq: [
      { q: "Cobre carga transportada?", a: "A cobertura de casco protege o veículo. Para a carga, indicamos o Seguro Transporte, que pode ser feito em conjunto para proteção completa." },
      { q: "Atende frota de vários caminhões?", a: "Sim. Trabalhamos com frotistas e oferecemos condições especiais para frotas de qualquer porte." },
      { q: "Tem cobertura para máquina agrícola?", a: "Possível mediante análise. Consulte-nos para avaliar o caso específico." }
    ]
  },

  "seguro-vida": {
    nome: "Seguro de Vida",
    categoria: "Seguros Pessoais",
    tag: "Proteção Familiar",
    tagline: "Tranquilidade financeira para você e para quem você ama.",
    descricao: "O Seguro de Vida oferece proteção financeira individual para garantir tranquilidade em momentos inesperados. Planos flexíveis e acessíveis para diferentes perfis, com assistência funeral, cobertura por doenças graves e invalidez permanente.",
    publico: "Para qualquer pessoa que deseja proteção financeira para a família — autônomos, profissionais, donos de casa, empresários e famílias.",
    coberturas: [
      { t: "Morte por Qualquer Causa", d: "Indenização aos beneficiários em caso de falecimento do segurado." },
      { t: "Invalidez Permanente", d: "Indenização em caso de invalidez por acidente ou doença." },
      { t: "Doenças Graves", d: "Cobertura para diagnóstico de doenças graves previstas em apólice." },
      { t: "Assistência Funeral", d: "Serviço de funeral para o segurado e dependentes, em qualquer lugar do Brasil." }
    ],
    seguradoras: ["MetLife", "Prudential", "Icatu", "Mongeral", "Previsul", "Zurich", "Porto Seguro", "Bradesco", "SulAmérica"],
    faq: [
      { q: "Preciso fazer exames médicos?", a: "Depende do valor de cobertura e da seguradora. Muitos planos dispensam exames para coberturas padrão." },
      { q: "Posso incluir cônjuge e filhos?", a: "Sim. Existem planos individuais e familiares que permitem incluir dependentes." },
      { q: "É diferente de previdência?", a: "Sim. O seguro de vida paga indenização em eventos previstos. A previdência é um investimento de longo prazo. Os dois são complementares." }
    ]
  },

  "seguro-residencial": {
    nome: "Seguro Residencial",
    categoria: "Seguros Pessoais",
    tag: "Proteção Familiar",
    tagline: "Sua casa protegida contra o que você não espera.",
    descricao: "O Seguro Residencial protege casas e apartamentos contra incêndio, roubo, danos elétricos, vendaval e responsabilidade civil. Análise personalizada do imóvel para encontrar a cobertura certa ao seu bolso.",
    publico: "Para proprietários e inquilinos de casas e apartamentos no Vale do Paraíba, Litoral Norte e todo o Brasil.",
    coberturas: [
      { t: "Incêndio, Explosão e Queda de Raio", d: "Cobertura básica para a estrutura e o conteúdo do imóvel." },
      { t: "Roubo e Furto de Bens", d: "Indenização para bens subtraídos por furto qualificado ou roubo." },
      { t: "Danos Elétricos e Vendaval", d: "Cobertura para queima de aparelhos e danos por vento forte." },
      { t: "Responsabilidade Civil Familiar", d: "Proteção caso um familiar cause danos a terceiros." }
    ],
    seguradoras: ["Porto Seguro", "Allianz", "Zurich", "Mapfre", "Liberty", "HDI", "Tokio Marine", "Alfa", "Chubb"],
    faq: [
      { q: "Cobre apartamento alugado?", a: "Sim. Existe cobertura para inquilinos (conteúdo) e para proprietários (estrutura). Analisamos o seu caso para encontrar a melhor opção." },
      { q: "Tem aluguel de imóvel reserva?", a: "Sim. A maioria das apólices oferece assistência de moradia temporária em caso de imóvel sinistrado." },
      { q: "Cobre energia solar?", a: "Depende da apólice. É possível incluir cobertura para painéis solares — informe no momento da cotação." }
    ]
  },

  "seguro-empresarial": {
    nome: "Seguro Empresarial",
    categoria: "Seguros Empresariais",
    tag: "Para Empresas",
    tagline: "Proteção completa para o seu negócio, do patrimônio ao lucro.",
    descricao: "O Seguro Empresarial protege comércios, indústrias e prestadores de serviço contra eventos que ameaçam o patrimônio, o estoque, os equipamentos, a responsabilidade civil e até os lucros. Análise de riscos personalizada para cada tipo de operação.",
    publico: "Para comércios, indústrias, serviços, clínicas, restaurantes, lojas e empresas de qualquer porte.",
    coberturas: [
      { t: "Incêndio, Roubo e Danos Elétricos", d: "Proteção do patrimônio físico da empresa (estrutura, estoque e instalações)." },
      { t: "Responsabilidade Civil", d: "Cobertura caso a empresa cause danos a terceiros em sua operação." },
      { t: "Lucros Cessantes", d: "Indenização pela perda de faturamento durante o período de interrupção do negócio." },
      { t: "Equipamentos Eletrônicos", d: "Cobertura para quebra e queima de equipamentos eletrônicos de uso empresarial." }
    ],
    seguradoras: ["Porto Seguro", "Allianz", "Zurich", "Mapfre", "Liberty", "Sompo", "Sura", "HDI", "Tokio Marine", "AIG", "Chubb"],
    faq: [
      { q: "Serve para MEI e pequenas empresas?", a: "Sim. Existem pacotes simplificados para pequenos negócios com custo acessível e contratação rápida." },
      { q: "Cobre estoque?", a: "Sim. O estoque pode ser coberto contra incêndio, roubo e outros eventos previstos em apólice." },
      { q: "Emite apólice para ramo de alimentos?", a: "Sim. Atendemos restaurantes, lanchonetes, padarias e indústria de alimentos com análise de riscos específica." }
    ]
  },

  "seguro-viagem": {
    nome: "Seguro Viagem",
    categoria: "Seguros Pessoais",
    tag: "Nacional e Internacional",
    tagline: "Viaje tranquilo. Nós cuidamos dos imprevistos.",
    descricao: "O Seguro Viagem oferece proteção para viagens nacionais e internacionais: despesas médicas, extravio de bagagem, cancelamentos e imprevistos. Contratação rápida, com suporte 24 horas onde você estiver.",
    publico: "Para viajantes nacionais e internacionais — turismo, negócios, intercâmbio, cruzeiros e muito mais.",
    coberturas: [
      { t: "Despesas Médicas e Hospitalares", d: "Cobertura médica no exterior e em território nacional." },
      { t: "Extravio de Bagagem", d: "Indenização em caso de perda ou atraso da bagagem pela companhia." },
      { t: "Cancelamento de Viagem", d: "Reembolso de despesas não reembolsáveis por motivos previstos em apólice." },
      { t: "Repatriação", d: "Cobertura para traslado sanitário e retorno ao domicílio." }
    ],
    seguradoras: ["Porto Seguro", "Allianz", "Zurich", "Mapfre", "Affinity", "Chubb"],
    faq: [
      { q: "Cobro antes ou depois da viagem?", a: "O contrato deve ser feito antes do início da viagem. A vigência começa na data prevista em apólice." },
      { q: "Cobre Covid e epidemias?", a: "Depende da apólice. Existem coberturas específicas para despesas médicas por doenças pré-existentes — informe na cotação." },
      { q: "Como aciono no exterior?", a: "Você liga no número 24h da seguradora indicado na apólice. Nossa equipe também orienta caso você precise." }
    ]
  },

  "seguro-condominio": {
    nome: "Seguro Condomínio",
    categoria: "Seguros Empresariais",
    tag: "Para Síndicos e Condomínios",
    tagline: "Proteção completa para áreas comuns e estrutura predial.",
    descricao: "O Seguro Condomínio protege áreas comuns, estrutura predial, equipamentos e responsabilidade civil de condomínios residenciais e comerciais. Orientação completa ao síndico na contratação e durante toda a vigência.",
    publico: "Para síndicos e administradoras de condomínios residenciais, comerciais e mistos.",
    coberturas: [
      { t: "Áreas Comuns e Estrutura", d: "Cobertura para a edificação do condomínio contra incêndio, explosão e outros eventos." },
      { t: "Equipamentos", d: "Elevadores, bombas, sistemas de segurança e demais equipamentos comuns." },
      { t: "Responsabilidade Civil", d: "Proteção em caso de danos a terceiros dentro das dependências do condomínio." },
      { t: "Orientação ao Síndico", d: "Suporte técnico na contratação, vigência e em sinistros." }
    ],
    seguradoras: ["Porto Seguro", "Allianz", "Zurich", "Mapfre", "Liberty", "HDI", "Tokio Marine", "Chubb", "Sompo"],
    faq: [
      { q: "Substitui seguro obrigatório?", a: "Sim. O seguro de condomínio atende às exigências do Código Civil (art. 1.266) e amplia as coberturas para áreas comuns e RC." },
      { q: "Cobre vidros e fachadas?", a: "Possível mediante contratação adicional. Avaliamos o caso para incluir coberturas específicas." },
      { q: "Síndico tem desconto?", a: "Condomínios têm condições especiais — solicitamos cotação comparando várias seguradoras para a melhor condição." }
    ]
  },

  "seguro-transporte": {
    nome: "Seguro Transporte",
    categoria: "Seguros Empresariais",
    tag: "Carga e Logística",
    tagline: "Sua carga sempre protegida em cada quilômetro.",
    descricao: "O Seguro Transporte protege mercadorias em trânsito. Segurança para embarcadores, transportadores e empresas de logística contra roubo, acidentes, avarias e extravios. Análise técnica personalizada conforme o tipo de carga.",
    publico: "Para embarcadores, transportadores, motoristas autônomos e empresas de logística.",
    coberturas: [
      { t: "Roubo e Furto de Carga", d: "Cobertura contra subtração da carga durante o transporte." },
      { t: "Acidentes e Avarias", d: "Indenização por danos decorrentes de acidentes, capotagem e avarias." },
      { t: "Extravios", d: "Cobertura para perda total por extravio da mercadoria." },
      { t: "Análise Técnica Personalizada", d: "Análise conforme tipo de carga, rota, embalagem e modal de transporte." }
    ],
    seguradoras: ["Mapfre", "Zurich", "Sompo", "Sura", "Chubb", "AIG", "Berkley", "Junto Seguros"],
    faq: [
      { q: "Cobre carga nacional e internacional?", a: "Sim. Trabalhamos com cobertura para transporte nacional e internacional, rodoviário, aéreo e marítimo." },
      { q: "Tem apólice avulsa por viagem?", a: "Sim. Existem apólices específicas por viagem e apólices abertas para múltiplas viagens." },
      { q: "Cobre cargas perecíveis?", a: "Sim. Cargas refrigeradas e perecíveis têm cobertura específica mediante análise." }
    ]
  },

  "seguro-equipamentos": {
    nome: "Seguro Equipamentos",
    categoria: "Seguros Empresariais",
    tag: "Máquinas e Eletrônicos",
    tagline: "Proteja seus equipamentos e mantenha a operação ativa.",
    descricao: "Seguro Equipamentos protege máquinas, equipamentos eletrônicos, ferramentas profissionais e bens de alto valor contra roubo, danos elétricos, acidentes e transporte. Análise personalizada do seu parque tecnológico ou industrial.",
    publico: "Para empresas, profissionais autônomos e prestadores de serviço que dependem de equipamentos para trabalhar.",
    coberturas: [
      { t: "Roubo e Furto", d: "Indenização em caso de subtração de equipamentos cobertos." },
      { t: "Danos Elétricos e Acidentais", d: "Cobertura para queima, curto e danos decorrentes de acidentes." },
      { t: "Cobertura em Transporte", d: "Proteção quando os equipamentos estiverem em trânsito." },
      { t: "Análise Personalizada", d: "Avaliamos cada equipamento para criar uma apólice sob medida." }
    ],
    seguradoras: ["Porto Seguro", "Allianz", "Zurich", "Mapfre", "Liberty", "Tokio Marine", "Sompo", "Chubb", "AIG"],
    faq: [
      { q: "Cobra notebooks e celulares corporativos?", a: "Sim. Equipamentos eletrônicos móveis podem ser cobertos individualmente ou em blocos." },
      { q: "Cobre equipamentos arrendados?", a: "Possível mediante análise. Avaliamos o contrato de arrendamento para definir a cobertura." },
      { q: "Tem franquia?", a: "Sim, há franquia variável conforme o tipo de equipamento e seguradora — sempre buscamos a melhor condição." }
    ]
  },

  "seguro-garantia": {
    nome: "Seguro Garantia",
    categoria: "Seguros Empresariais",
    tag: "Licitações e Contratos",
    tagline: "Garanta contratos públicos e privados com agilidade.",
    descricao: "O Seguro Garantia é ideal para empresas que participam de licitações e contratos públicos ou privados. Rapidez na emissão e acompanhamento até o encerramento do contrato. Coberturas para garantia de execução, licitação, prestador de serviço e adiantamento.",
    publico: "Para empresas participando de licitações públicas, privateadas ou contratos com cláusula de garantia.",
    coberturas: [
      { t: "Licitações Públicas e Privadas", d: "Garantia oferecida ao órgão licitante para participação." },
      { t: "Contratos de Execução", d: "Garantia do cumprimento do contrato enquanto estiver vigente." },
      { t: "Atendimento Especializado", d: "Equipe dedicada para emissão rápida e acompanhamento." },
      { t: "Pós-venda Próximo", d: "Suporte contínuo até o encerramento da garantia contratual." }
    ],
    seguradoras: ["Junto Seguros", "Berkley", "Fator Seguros", "Zurich", "Chubb", "AIG"],
    faq: [
      { q: "Substitui caução em dinheiro?", a: "Sim. O seguro garantia oferece as mesmas garantias sem imobilizar capital da empresa." },
      { q: "Emissão é rápida?", a: "Sim. Trabalhamos com prazos curtos de emissão, muitas vezes em até 24h após análise." },
      { q: "Cobre contrato privado?", a: "Sim. Aplicamos também em contratos privados com cláusula de garantia." }
    ]
  },

  "seguro-vida-empresarial": {
    nome: "Seguro de Vida Empresarial",
    categoria: "Seguros Empresariais",
    tag: "Benefício para Colaboradores",
    tagline: "Proteção financeira para toda a sua equipe.",
    descricao: "O Seguro de Vida Empresarial oferece proteção financeira para colaboradores, empresários e suas famílias. Planos personalizados que garantem segurança e continuidade em momentos inesperados, com atendimento humanizado em todo o processo.",
    publico: "Para empresas que querem oferecer benefício real aos colaboradores, diretores, sócios e dependentes.",
    coberturas: [
      { t: "Morte e Invalidez", d: "Cobertura básica por morte qualquer causa e invalidez permanente." },
      { t: "Para Colaboradores e Diretores", d: "Inclusão flexível conforme cargos e perfis da empresa." },
      { t: "Planos Coletivos com Benefícios", d: "Condições especiais para grupos, com custo por vida otimizado." },
      { t: "Atendimento Humanizado", d: "Suporte próximo à empresa e ao segurado em todos os momentos." }
    ],
    seguradoras: ["MetLife", "Prudential", "Icatu", "Mongeral", "Previsul", "Zurich", "Porto Seguro", "Bradesco", "SulAmérica"],
    faq: [
      { q: "Mínimo de vidas para contratar?", a: "Depende da seguradora — muitas aceitam a partir de poucos vidas. Fazemos análise para encontrar o plano ideal ao seu porte." },
      { q: "Colaborador pode somar dependentes?", a: "Sim. Existem planos que permitem inclusão de dependentes em condições especiais." },
      { q: "É benefício dedutível no IR?", a: "Há possibilidades. Recomendamos validação contábil, mas em geral é dedutível como despesa operacional." }
    ]
  },

  "planos-saude": {
    nome: "Planos de Saúde",
    categoria: "Saúde e Benefícios",
    tag: "Individual, Familiar e Empresarial",
    tagline: "Assistência médica de qualidade, sem burocracia.",
    descricao: "Especialistas em planos de saúde individuais, familiares e empresariais. Comparamos as principais operadoras do mercado para encontrar a melhor cobertura, rede credenciada e custo-benefício para você, sua família ou sua empresa. Suporte completo no pós-venda.",
    publico: "Para pessoas físicas, famílias e empresas que precisam de assistência médica de qualidade no Vale do Paraíba, São Paulo e Brasil.",
    coberturas: [
      { t: "Individual, Familiar e Empresarial", d: "Planos para diferentes perfis e portes de empresa." },
      { t: "A partir de 1 Vida", d: "Algumas operadoras aceitam planos empresariais a partir de 1 vida." },
      { t: "Migração e Renovação Assistida", d: "Acompanhamos todo o processo de troca ou renovação de plano." },
      { t: "Suporte em Uso e Sinistros", d: "Orientação em rede credenciada, reembolso e sinistros." },
      { t: "Comparativo entre Operadoras", d: "Comparamos Amil, Porto, Bradesco, SulAmérica, Unimed e mais." }
    ],
    seguradoras: ["Amil", "Porto Saúde", "Bradesco Saúde", "SulAmérica", "Unimed SJC", "Omint", "Assim Saúde", "Santa Casa SJC", "São Francisco Vida"],
    faq: [
      { q: "Tabela ANS ou livre adesão?", a: "Trabalhamos com ambas as modalidades conforme o perfil. A recomendação depende do objetivo, idade e filiação." },
      { q: "Cobre preexistente?", a: "A maioria dos planos tem carência para doenças preexistentes. Comparemos opções para reduzir prazos onde for possível." },
      { q: "Ajuda na migração de plano?", a: "Sim. Fazemos a portabilidade de carências entre operadoras conforme a ANS, mantendo seus direitos." }
    ]
  },

  "porto-saude": {
    nome: "Porto Saúde",
    categoria: "Saúde e Benefícios",
    tag: "Para Empresas",
    tagline: "Linha Pró Vale e Tradicional com cobertura nacional.",
    descricao: "O Porto Saúde é referência em planos empresariais e familiares. Linhas Tradicional e Pró Vale com cobertura nacional, acesso à rede D'Or e hospitais premium em São Paulo. Disponível para empresas de qualquer porte, a partir de 1 funcionário.",
    publico: "Para empresas que querem assistência médica de qualidade para funcionários, dependentes, sócios e diretores.",
    coberturas: [
      { t: "A partir de 1 Funcionário", d: "Disponível para empresas de pequeno, médio e grande porte." },
      { t: "Cobertura Nacional", d: "Atendimento em todo o Brasil com ampla rede credenciada." },
      { t: "Rede D'Or e Hospitais Premium", d: "Acesso a hospitais de referência em São Paulo e Vale do Paraíba." },
      { t: "Dependentes e Agregados", d: "Inclusão de familiares, agregados e estagiários no plano." }
    ],
    seguradoras: ["Porto Saúde"],
    faq: [
      { q: "Linha Pró Vale o que é?", a: "É uma linha regional com rede enxuta e custo otimizado para empresas do Vale do Paraíba — ideal para reduzir o valor por vida." },
      { q: "MEI pode contratar?", a: "Depende do porte. Existem planos empresariais a partir de 1 vida — validamos a elegibilidade na cotação." },
      { q: "Cobre Spalla e Sírio Libanês?", a: "Sim, conforme a contratada. As linhas premium dão acesso à rede D'Or, Sírio Libanês e outros." }
    ]
  },

  "sulamerica-saude": {
    nome: "SulAmérica Saúde",
    categoria: "Saúde e Benefícios",
    tag: "Empresarial e Familiar",
    tagline: "Rede credenciada de referência nacional.",
    descricao: "A SulAmérica Saúde é referência nacional pela qualidade da rede credenciada e acesso a hospitais premium. Planos empresariais e familiares com cobertura nacional, migração e upgrade assistido pela equipe da Vida de Ouro.",
    publico: "Para empresas e famílias que buscam flexibilidade, ampla rede e hospitais premium.",
    coberturas: [
      { t: "Rede D'Or Inclusa", d: "Acesso à maior rede privada de hospitais do Brasil." },
      { t: "Empresarial e Familiar", d: "Opções para diferentes perfis e portes." },
      { t: "Cobertura Nacional", d: "Atendimento em todo o território nacional." },
      { t: "Migração e Upgrade Assistido", d: "Suporte completo na troca de rede ou operadora." }
    ],
    seguradoras: ["SulAmérica"],
    faq: [
      { q: "Cobre região do Vale?", a: "Sim. A rede credenciada cobre o Vale do Paraíba, Litoral Norte e principais cidades de SP." },
      { q: "Tem rede Sírio/Alemão?", a: "Depende da rede contratada. As redes premium dão acesso a esses hospitais." },
      { q: "Empresa com 2 vidas contrata?", a: "Sim. Existem planos empresariais a partir de poucas vidas — verificamos a elegibilidade." }
    ]
  },

  "bradesco-saude": {
    nome: "Bradesco Saúde",
    categoria: "Saúde e Benefícios",
    tag: "Empresarial e Familiar",
    tagline: "Rede ampla e flexível para todos os portes.",
    descricao: "O Bradesco Saúde oferece planos empresariais e familiares com rede ampla e flexível, abrangência nacional e hospitais de referência. A Vida de Ouro faz a análise do perfil para encontrar a melhor linha para a sua empresa ou família.",
    publico: "Para empresas de pequeno, médio e grande porte e famílias que buscam flexibilidade de rede.",
    coberturas: [
      { t: "Rede Ampla", d: "Acesso a hospitais e clínicas em todo o Brasil." },
      { t: "Linhas Tradicional e Premium", d: "Opções conforme orçamento e expectativa de rede." },
      { t: "Cobertura Nacional", d: "Abrangência em todo o território nacional." },
      { t: "Suporte no Uso", d: "Orientação em rede credenciada, reembolso e sinistros." }
    ],
    seguradoras: ["Bradesco Saúde"],
    faq: [
      { q: "Tem plano individual?", a: "O Bradesco tem linhas individuais conforme a disponibilidade regional. Validamos na cotação." },
      { q: "Cobre reembolso?", a: "Sim, na maioria das linhas existe cobertura por reembolso em redes não credenciadas, conforme contrato." },
      { q: "Migra de outra operadora mantém carências?", a: "Sim. A portabilidade entre operadoras mantém carências cumpridas, conforme regulamentação da ANS." }
    ]
  },

  "amil": {
    nome: "Amil",
    categoria: "Saúde e Benefícios",
    tag: "Individual e Empresarial",
    tagline: "Rede ampla com hospitais de referência.",
    descricao: "A Amil é uma das operadoras mais tradicionais do país, com rede ampla e hospitais de referência. A Vida de Ouro apresenta as linhas Amil para empresas e famílias, com análise personalizada para encontrar a melhor condição de custo-benefício.",
    publico: "Para empresas e famílias que querem rede ampla e qualidade consolidada no mercado.",
    coberturas: [
      { t: "Rede Ampla", d: "Amplo credenciamento em SP e Brasil." },
      { t: "Individual e Empresarial", d: "Linhas para pessoa física e empresas de qualquer porte." },
      { t: "Cobertura Nacional", d: "Atendimento em todo o país conforme a rede contratada." },
      { t: "Suporte no Uso e Sinistro", d: "Orientação em reembolso, rede credenciada e sinistros." }
    ],
    seguradoras: ["Amil"],
    faq: [
      { q: "Amil tem plano dental?", a: "Sim. Existem opções de dental adicional ao plano médico ou contratado separadamente." },
      { q: "Cobre regiao do Vale?", a: "Sim. A Amil tem rede credenciada em São José dos Campos, Jacareí e região." },
      { q: "Ajuda em reembolso?", a: "Sim. Nossa equipe orienta sobre prazos e documentação para reembolso de despesas fora da rede." }
    ]
  },

  "unimed": {
    nome: "Unimed SJC",
    categoria: "Saúde e Benefícios",
    tag: "Cooperativa Regional",
    tagline: "Referência em saúde no Vale do Paraíba.",
    descricao: "A Unimed SJC é referência em saúde cooperativa no Vale do Paraíba, com rede credenciada ampla na região. Planos individuais, familiares e empresariais com atendimento próximo e qualidade reconhecida. A Vida de Ouro faz a cotação comparativa e suporte no pós-venda.",
    publico: "Para quem prioriza rede credenciada local no Vale do Paraíba.",
    coberturas: [
      { t: "Rede Regional Amplia", d: "Amplo credenciamento de médicos, clínicas e hospitais no Vale." },
      { t: "Individual, Familiar e Empresarial", d: "Linhas para diferentes perfis e portes." },
      { t: "Atendimento Próximo", d: "Sede cooperativa e relacionamento direto no Vale do Paraíba." },
      { t: "Suporte Pós-venda", d: "Acompanhamento em uso, reembolso e sinistros." }
    ],
    seguradoras: ["Unimed SJC"],
    faq: [
      { q: "Tem cobertura nacional?", a: "Sim, mediante a rede nacional Unimed para urgência e emergência em todo o Brasil." },
      { q: "Unimed tem plano empresarial pequeno?", a: "Sim, existem planos empresariais a partir de poucas vidas — verificamos a elegibilidade." },
      { q: "Ajuda em troca de operadora?", a: "Sim. Portamos carências conforme a regulamentação da ANS." }
    ]
  },

  "consorcios": {
    nome: "Consórcios",
    categoria: "Outros",
    tag: "Sem Juros",
    tagline: "Planeje a aquisição de bens com economia e segurança.",
    descricao: "Consórcio de auto, moto, caminhão e imóvel sem juros. Ideal para quem deseja planejar a aquisição de bens com economia e previsibilidade. Acompanhamento da adesão até a contemplação, com suporte em todo o processo.",
    publico: "Para quem planeja comprar automóvel, imóvel ou caminhão e tem tempo de espera flexível.",
    coberturas: [
      { t: "Auto, Moto e Caminhão", d: "Consórcio para aquisição de veículos novos ou usados." },
      { t: "Imóvel Residencial e Comercial", d: "Consórcio imobiliário para casa, apartamento ou sala comercial." },
      { t: "Sem Juros, com Economia", d: "Custo total inferior ao financiamento, com taxa administrativa diluída." },
      { t: "Acompanhamento até Contemplação", d: "Suporte da adesão até a contemplação e entrega do bem." }
    ],
    seguradoras: ["Rodobens", "Porto", "Caixa Seguradora", "Brasilprev", "BTG Pactual"],
    faq: [
      { q: "Consórcio tem juros?", a: "Não. O consórcio cobra taxa administrativa, diluída nas parcelas — sem juros como no financiamento." },
      { q: "Posso antecipar parcelas?", a: "Sim, e a antecipação aumenta suas chances de contemplação por lance livre." },
      { q: "Cota contemplada pode ser usada para reforma?", a: "Depende do tipo de consórcio. O imobiliário permite destinar parte para construção ou reforma — verifique nas condições." }
    ]
  },

  "previdencia": {
    nome: "Previdência Privada",
    categoria: "Saúde e Benefícios",
    tag: "Planejamento e Aposentadoria",
    tagline: "Construa sua aposentadoria com planejamento e segurança.",
    descricao: "A Previdência Privada oferece planejamento financeiro e aposentadoria segura com planos PGBL e VGBL. Atendimento consultivo para diferentes perfis de investidores, com acompanhamento contínuo da reserva.",
    publico: "Para quem busca formar reserva de longo prazo, complementar INSS e obter benefício fiscal no IR.",
    coberturas: [
      { t: "PGBL e VGBL", d: "Dois modelos tributários conforme o seu perfil de IR." },
      { t: "Planejamento de Aposentadoria", d: "Estruturação de reserva com aportes flexíveis." },
      { t: "Benefício Fiscal no IR", d: "PGBL permite dedução até 12% da renda bruta anual." },
      { t: "Acompanhamento Contínuo", d: "Revisão periódica do plano e da reserva." }
    ],
    seguradoras: ["Brasilprev", "Icatu", "Porto Seguro", "Caixa", "BTG Pactual", "Bradesco", "SulAmérica"],
    faq: [
      { q: "PGBL ou VGBL: qual escolher?", a: "Depende da sua forma de declaração no IR. O PGBL é vantajoso para quem usa modelo completo; o VGBL, para modelo simplificado. Orientamos na escolha." },
      { q: "Posso resgatar antes da aposentadoria?", a: "Sim, com carência. Mas o resgate antecipado pode ter tributação — avaliamos caso a caso." },
      { q: "Existe rentabilidade garantida?", a: "Depende do fundo. Existem opções conservadoras e options de perfil moderado/agressivo. Ajuda na escolha conforme perfil." }
    ]
  },

  "certificado-digital": {
    nome: "Certificado Digital",
    categoria: "Outros",
    tag: "Presencial e Online",
    tagline: "Emissão rápida com suporte na instalação e renovação.",
    descricao: "Emissão de Certificado Digital presencial em Jacareí e 100% online para todo o Brasil. e-CPF, e-CNPJ, MEI, NF-e, CT-e e muito mais. Suporte completo na instalação, configuração e renovação — você não fica sozinho.",
    publico: "Para PF, MEI, empresas e profissionais que precisam de certificado para NF-e, e-CNPJ, e-Social e mais.",
    coberturas: [
      { t: "e-CPF A1 e A3", d: "Certificado para pessoa física, com validade de 1 a 3 anos." },
      { t: "e-CNPJ A1 e A3", d: "Certificado para empresas e MEI com emissão rápida." },
      { t: "MEI, NF-e, CT-e, MDF-e", d: "Certificados específicos para documentação eletrônica." },
      { t: "e-Social e Conectividade Social", d: "Acesso a sistemas governamentais sem burocracia." },
      { t: "Suporte na Instalação e Backup", d: "Configuração no computador e backup de segurança." }
    ],
    seguradoras: ["Atendimento presencial Jacareí e online para todo o Brasil"],
    faq: [
      { q: "Qual a diferença A1 x A3?", a: "O A1 tem validade de 1 ano e fica instalado no computador. O A3 tem validade de 1 a 3 anos e é armazenado em token/cartão, mais seguro e portável." },
      { q: "Emissao online é segura?", a: "Sim. A emissão online é feita com validação biométrica via gov.br, 100% segura e oficial." },
      { q: "Renovo na Vida de Ouro?", a: "Sim. Cuidamos da renovação antes do vencimento, mantendo a validade do certificado sem interrupções." }
    ]
  }
};