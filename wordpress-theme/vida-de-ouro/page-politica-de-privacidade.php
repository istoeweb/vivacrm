<?php get_header(); ?>

<?php if (vdo_has_elementor()): ?>
<main class="vdo-elementor-page">
  <?php while (have_posts()) : the_post(); the_content(); endwhile; ?>
</main>
<?php get_footer(); return; endif; ?>

<style>
  .privacy-hero { padding: 150px 0 64px; background: linear-gradient(135deg, var(--blue-900), var(--blue-700)); color: #fff; }
  .privacy-hero h1 { max-width: 820px; margin-bottom: 14px; color: #fff; }
  .privacy-hero p { max-width: 760px; color: rgba(255,255,255,.82); }
  .privacy-content { padding: 64px 0 88px; background: var(--gray-50); }
  .privacy-card { max-width: 900px; margin: 0 auto; padding: clamp(24px, 5vw, 56px); background: #fff; border: 1px solid var(--gray-200); border-radius: var(--radius-lg); box-shadow: var(--shadow); }
  .privacy-card h2 { margin: 38px 0 12px; color: var(--gray-900); font-size: 1.35rem; }
  .privacy-card h2:first-of-type { margin-top: 0; }
  .privacy-card p, .privacy-card li { color: var(--gray-700); line-height: 1.75; }
  .privacy-card ul { margin: 10px 0 16px 22px; }
  .privacy-card a { color: var(--blue-600); text-decoration: underline; }
  .privacy-updated { margin-bottom: 30px; padding: 12px 16px; border-left: 4px solid var(--gold-500); background: var(--gray-50); }
  @media (max-width: 768px) { .privacy-hero { padding-top: 120px; } }
</style>

<section class="privacy-hero">
  <div class="container">
    <h1>Política de Privacidade e Proteção de Dados</h1>
    <p>Saiba como a Vida de Ouro Jacareí coleta, utiliza, compartilha e protege seus dados pessoais.</p>
  </div>
</section>

<section class="privacy-content">
  <div class="container">
    <article class="privacy-card">
      <p class="privacy-updated"><strong>Última atualização:</strong> 24 de agosto de 2026.</p>

      <h2>1. Quem somos</h2>
      <p>A Vida de Ouro Jacareí atua na intermediação de seguros, planos de saúde, consórcios, previdência e serviços relacionados. Para os tratamentos descritos nesta Política, atuamos como controladores dos dados pessoais, determinando como e por que eles são utilizados.</p>

      <h2>2. Quais dados tratamos</h2>
      <p>De acordo com o serviço solicitado e com a etapa do atendimento, poderemos tratar:</p>
      <ul>
        <li>dados de identificação e contato, como nome, telefone, e-mail, cidade, CPF e CNPJ;</li>
        <li>informações fornecidas em formulários, mensagens, ligações e atendimentos pelo WhatsApp;</li>
        <li>dados necessários à cotação, contratação e gestão de seguros ou outros produtos;</li>
        <li>informações sobre clientes, apólices, propostas, sinistros, pagamentos e agendamentos;</li>
        <li>dados técnicos de acesso, como endereço IP, data, horário, navegador e registros de segurança.</li>
      </ul>
      <p>Alguns produtos, especialmente planos de saúde, seguro de vida e sinistros, podem exigir dados pessoais sensíveis. Esses dados somente serão solicitados quando necessários e tratados com proteção reforçada.</p>

      <h2>3. Como coletamos os dados</h2>
      <p>Os dados podem ser fornecidos diretamente por você pelo site, WhatsApp, telefone, atendimento presencial ou documentos. Também poderão ser recebidos de seguradoras, operadoras, administradoras, prestadores e parceiros envolvidos na cotação, contratação ou execução do serviço.</p>

      <h2>4. Para que utilizamos os dados</h2>
      <ul>
        <li>responder solicitações e entrar em contato;</li>
        <li>elaborar cotações, propostas e simulações;</li>
        <li>intermediar contratações e administrar o relacionamento com clientes;</li>
        <li>acompanhar apólices, renovações, sinistros e atendimentos;</li>
        <li>cumprir obrigações legais, regulatórias e contratuais;</li>
        <li>prevenir fraudes, abusos e incidentes de segurança;</li>
        <li>exercer direitos em processos administrativos ou judiciais;</li>
        <li>melhorar nossos serviços e comunicações.</li>
      </ul>

      <h2>5. Bases legais</h2>
      <p>Tratamos dados conforme as hipóteses previstas na Lei nº 13.709/2018 (LGPD), incluindo procedimentos preliminares e execução de contrato, cumprimento de obrigação legal ou regulatória, exercício regular de direitos, proteção da vida, legítimo interesse e, quando aplicável, consentimento.</p>

      <h2>6. Compartilhamento</h2>
      <p>Os dados poderão ser compartilhados, no limite necessário, com seguradoras, operadoras de saúde, administradoras, empresas de assistência, prestadores, plataformas de comunicação e tecnologia, autoridades públicas e outros participantes necessários ao serviço solicitado. Não comercializamos dados pessoais.</p>

      <h2>7. Armazenamento e retenção</h2>
      <p>Os dados são mantidos pelo período necessário para cumprir as finalidades informadas, obrigações legais e regulatórias, prazos de defesa de direitos e requisitos de prevenção a fraudes. Encerrado o período aplicável, os dados serão eliminados ou anonimizados, salvo quando sua conservação for permitida ou exigida por lei.</p>

      <h2>8. Segurança</h2>
      <p>Adotamos medidas técnicas e administrativas razoáveis para reduzir riscos de acesso não autorizado, perda, alteração, divulgação ou destruição de dados. Nenhum ambiente é totalmente isento de riscos; caso identifique uma possível ocorrência, entre em contato conosco.</p>

      <h2>9. Seus direitos</h2>
      <p>Nos termos da LGPD, você pode solicitar confirmação e acesso aos dados, correção, anonimização, bloqueio ou eliminação de dados inadequados, portabilidade, informação sobre compartilhamentos, revisão de decisões automatizadas e revogação do consentimento, quando aplicável. Algumas solicitações poderão ser limitadas por obrigações legais ou pela necessidade de conservar dados para exercício de direitos.</p>

      <h2 id="cookies">10. Cookies e tecnologias semelhantes</h2>
      <p>O site poderá utilizar recursos estritamente necessários ao seu funcionamento e à segurança. Se ferramentas opcionais de análise, publicidade ou rastreamento forem adicionadas, esta Política e os mecanismos de escolha serão atualizados antes de sua utilização.</p>
      <p>Você pode rever sua decisão a qualquer momento: <button type="button" class="btn btn--cookie-secondary" data-manage-cookies>Gerenciar preferências de cookies</button></p>

      <h2>11. Serviços de terceiros</h2>
      <p>Ao utilizar links para serviços externos, como WhatsApp e sites de parceiros, você também estará sujeito às políticas de privacidade desses terceiros. Não controlamos as práticas adotadas em ambientes externos.</p>

      <h2>12. Crianças e adolescentes</h2>
      <p>O site não é direcionado à coleta autônoma de dados de crianças. Quando dados de crianças ou adolescentes forem necessários para um produto, eles serão tratados conforme seu melhor interesse e as exigências legais aplicáveis, por intermédio de responsável legal quando necessário.</p>

      <h2>13. Alterações desta Política</h2>
      <p>Esta Política poderá ser atualizada para refletir mudanças legais, operacionais ou tecnológicas. A versão vigente e sua data de atualização permanecerão disponíveis nesta página.</p>

      <h2>14. Canal de privacidade</h2>
      <p>Para esclarecer dúvidas ou exercer seus direitos, fale com a Vida de Ouro Jacareí pelo WhatsApp <a href="https://wa.me/5512976002718" target="_blank" rel="noopener noreferrer">(12) 97600-2718</a>. Para proteger o titular, poderemos solicitar informações adicionais para confirmar sua identidade.</p>
    </article>
  </div>
</section>

<?php get_footer(); ?>
