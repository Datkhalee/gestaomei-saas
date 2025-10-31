<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FinanceiMEI - Gestão Financeira Simples para MEI</title>
    <meta name="description" content="Controle financeiro completo para MEI em minutos. Simples, rápido e profissional." />
    
    <!-- Inter Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Meta Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '799633196164797');
    fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=799633196164797&ev=PageView&noscript=1"
    /></noscript>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-400: #9ca3af;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-900: #111827;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #ffffff;
            color: var(--gray-900);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
        }

        /* HEADER */
        header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--gray-200);
        }

        .header-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo img {
            height: 36px;
            width: auto;
        }

        .nav-btn {
            padding: 10px 20px;
            background: transparent;
            border: 1px solid var(--gray-300);
            color: var(--gray-700);
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-block;
        }

        .nav-btn:hover {
            background: var(--gray-50);
            border-color: var(--gray-400);
        }

        /* HERO */
        .hero {
            padding: 120px 24px 80px;
            background: linear-gradient(180deg, #ffffff 0%, var(--gray-50) 100%);
        }

        .hero-container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: var(--gray-100);
            border: 1px solid var(--gray-200);
            border-radius: 20px;
            color: var(--gray-700);
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 24px;
        }

        h1 {
            font-size: 56px;
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 20px;
            color: var(--gray-900);
            letter-spacing: -0.02em;
        }

        .hero-subtitle {
            font-size: 20px;
            color: var(--gray-600);
            margin-bottom: 32px;
            line-height: 1.6;
        }

        .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 28px;
            background: var(--primary);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
        }

        .btn-primary:hover {
            background: var(--primary-dark);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .trust-indicators {
            display: flex;
            gap: 24px;
            margin-top: 32px;
            color: var(--gray-600);
            font-size: 14px;
            flex-wrap: wrap;
        }

        .trust-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        /* VIDEO */
        .video-section {
            width: 100%;
            max-width: 100%;
        }

        .video-wrapper {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            background: var(--gray-100);
            width: 100%;
        }

        .video-desktop,
        .video-mobile {
            width: 100%;
            height: auto;
            display: block;
        }

        .video-desktop {
            aspect-ratio: 16/9;
        }

        .video-mobile {
            display: none;
        }

        /* FEATURES */
        .features {
            padding: 100px 24px;
            background: white;
        }

        .features-container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .section-header {
            text-align: center;
            margin-bottom: 60px;
        }

        .section-header h2 {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 12px;
            color: var(--gray-900);
            letter-spacing: -0.02em;
        }

        .section-header p {
            font-size: 18px;
            color: var(--gray-600);
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
        }

        .feature-card {
            padding: 32px;
        }

        .feature-icon {
            width: 48px;
            height: 48px;
            background: var(--gray-100);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin-bottom: 20px;
        }

        .feature-card h3 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--gray-900);
        }

        .feature-card p {
            color: var(--gray-600);
            font-size: 15px;
            line-height: 1.6;
        }

        /* TESTIMONIALS */
        .testimonials {
            padding: 100px 24px;
            background: var(--gray-50);
        }

        .testimonials-container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 32px;
            margin-top: 60px;
        }

        .testimonial-card {
            background: white;
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            padding: 32px;
            transition: all 0.2s;
        }

        .testimonial-card:hover {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
            transform: translateY(-2px);
        }

        .testimonial-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
        }

        .testimonial-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
        }

        .testimonial-info h4 {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 2px;
            color: var(--gray-900);
        }

        .testimonial-info p {
            font-size: 13px;
            color: var(--gray-600);
        }

        .stars {
            color: #fbbf24;
            font-size: 14px;
            margin-bottom: 12px;
        }

        .testimonial-text {
            color: var(--gray-700);
            font-size: 15px;
            line-height: 1.6;
        }

        /* FAQ */
        .faq {
            padding: 100px 24px;
            background: white;
        }

        .faq-container {
            max-width: 900px;
            margin: 0 auto;
        }

        .faq-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            margin-top: 60px;
        }

        .faq-item {
            background: var(--gray-50);
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            padding: 24px;
            transition: all 0.2s;
        }

        .faq-item:hover {
            background: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .faq-question {
            font-size: 17px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--gray-900);
        }

        .faq-answer {
            color: var(--gray-600);
            font-size: 15px;
            line-height: 1.6;
        }

        /* CTA */
        .final-cta {
            padding: 100px 24px;
            background: white;
        }

        .cta-box {
            max-width: 900px;
            margin: 0 auto;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            border-radius: 16px;
            padding: 60px 40px;
            text-align: center;
        }

        .cta-box h2 {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 16px;
            color: white;
            letter-spacing: -0.02em;
        }

        .cta-box p {
            font-size: 18px;
            margin-bottom: 32px;
            color: rgba(255, 255, 255, 0.9);
        }

        .btn-white {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 28px;
            background: white;
            color: var(--primary);
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
        }

        .btn-white:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        /* FOOTER */
        footer {
            padding: 40px 24px;
            text-align: center;
            color: var(--gray-600);
            border-top: 1px solid var(--gray-200);
            font-size: 14px;
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
            .hero-container {
                grid-template-columns: 1fr;
                gap: 40px;
            }

            .features-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 32px;
            }

            .testimonials-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .header-container {
                padding: 14px 20px;
            }

            .logo img {
                height: 28px;
            }

            .nav-btn {
                padding: 8px 14px;
                font-size: 13px;
            }

            .hero {
                padding: 100px 20px 60px;
            }

            .hero-container {
                gap: 32px;
            }

            h1 {
                font-size: 36px;
                margin-bottom: 16px;
            }

            .hero-subtitle {
                font-size: 17px;
                margin-bottom: 24px;
            }

            .btn-primary {
                padding: 12px 24px;
                font-size: 15px;
            }

            .trust-indicators {
                gap: 16px;
                margin-top: 24px;
            }

            .video-desktop {
                display: none;
            }

            .video-mobile {
                display: block;
                aspect-ratio: 9/16;
                max-width: 400px;
                margin: 0 auto;
            }

            .features {
                padding: 60px 20px;
            }

            .section-header h2 {
                font-size: 28px;
            }

            .section-header p {
                font-size: 16px;
            }

            .features-grid {
                grid-template-columns: 1fr;
                gap: 24px;
            }

            .feature-card {
                padding: 24px;
            }

            .testimonials {
                padding: 60px 20px;
            }

            .testimonial-card {
                padding: 24px;
            }

            .faq {
                padding: 60px 20px;
            }

            .faq-item {
                padding: 20px;
            }

            .final-cta {
                padding: 60px 20px;
            }

            .cta-box {
                padding: 40px 24px;
                border-radius: 12px;
            }

            .cta-box h2 {
                font-size: 28px;
            }

            .cta-box p {
                font-size: 16px;
            }

            .btn-white {
                padding: 12px 24px;
                font-size: 15px;
            }

            footer {
                padding: 32px 20px;
                font-size: 13px;
            }
        }

        @media (max-width: 480px) {
            h1 {
                font-size: 32px;
            }

            .hero-subtitle {
                font-size: 16px;
            }

            .section-header h2 {
                font-size: 24px;
            }

            .trust-indicators {
                flex-direction: column;
                gap: 12px;
                align-items: flex-start;
            }

            .cta-box h2 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <!-- HEADER -->
    <header>
        <div class="header-container">
            <div class="logo">
                <img src="https://www.gestaomei.cloud/logo-finance.png" alt="FinanceiMEI">
            </div>
            <a href="/login" class="nav-btn">Já tenho conta</a>
        </div>
    </header>

    <!-- HERO -->
    <section class="hero">
        <div class="hero-container">
            <div class="hero-content">
                <div class="badge">
                    ✨ Solução completa para MEI
                </div>
                <h1>Controle financeiro em minutos</h1>
                <p class="hero-subtitle">
                    Gerencie suas finanças como MEI de forma simples e profissional. DAS automático, relatórios e muito mais.
                </p>
                <a href="/cadastro" class="btn-primary">
                    Começar gratuitamente
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
                <div class="trust-indicators">
                    <div class="trust-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Configure em minutos
                    </div>
                    <div class="trust-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Sem cartão de crédito
                    </div>
                    <div class="trust-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        +500 MEI confiam
                    </div>
                </div>
            </div>
            
            <div class="video-section">
                <div class="video-wrapper">
                    <video class="video-desktop" controls autoplay muted loop playsinline>
                        <source src="/lp/VSL.mp4" type="video/mp4">
                        Seu navegador não suporta vídeos.
                    </video>
                    <video class="video-mobile" controls autoplay muted loop playsinline>
                        <source src="/lp/VSL.mp4" type="video/mp4">
                        Seu navegador não suporta vídeos.
                    </video>
                </div>
            </div>
        </div>
    </section>

    <!-- FEATURES -->
    <section class="features">
        <div class="features-container">
            <div class="section-header">
                <h2>Tudo que você precisa</h2>
                <p>Ferramentas profissionais para gerenciar seu MEI</p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Controle financeiro</h3>
                    <p>Registre receitas e despesas em segundos. Veja quanto você está lucrando de verdade.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🧾</div>
                    <h3>DAS automático</h3>
                    <p>Cálculo automático do DAS. Nunca mais se preocupe com prazos e valores.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📈</div>
                    <h3>Relatórios completos</h3>
                    <p>Gráficos e análises detalhadas para tomar decisões mais inteligentes.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="testimonials">
        <div class="testimonials-container">
            <div class="section-header">
                <h2>Mais de 500 MEI já usam</h2>
                <p>Veja o que eles têm a dizer</p>
            </div>
            <div class="testimonials-grid">
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="https://img.freepik.com/fotos-gratis/cabeleireiro-feminino-segurando-a-maquina-de-cabelo-e-escova-de-cabelo_107420-12146.jpg" alt="Mariana Silva" class="testimonial-avatar">
                        <div class="testimonial-info">
                            <h4>Mariana Silva</h4>
                            <p>Cabeleireira MEI</p>
                        </div>
                    </div>
                    <div class="stars">⭐⭐⭐⭐⭐</div>
                    <p class="testimonial-text">"Antes eu perdia horas com planilhas. Agora controlo tudo em 5 minutos por dia."</p>
                </div>

                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="https://img.freepik.com/fotos-gratis/proprietario-de-salao-de-cabeleireiro-latino-se-preparando-para-clientes_23-2150286080.jpg" alt="Carlos Mendes" class="testimonial-avatar">
                        <div class="testimonial-info">
                            <h4>Carlos Mendes</h4>
                            <p>Barbeiro MEI</p>
                        </div>
                    </div>
                    <div class="stars">⭐⭐⭐⭐⭐</div>
                    <p class="testimonial-text">"Sistema simples e completo. Finalmente tenho controle profissional do meu negócio."</p>
                </div>

                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="https://img.freepik.com/fotos-gratis/profissional-de-nail-art-trabalhando-em-unhas-de-clientes_23-2149265933.jpg" alt="Juliana Costa" class="testimonial-avatar">
                        <div class="testimonial-info">
                            <h4>Juliana Costa</h4>
                            <p>Manicure MEI</p>
                        </div>
                    </div>
                    <div class="stars">⭐⭐⭐⭐⭐</div>
                    <p class="testimonial-text">"Nunca mais esqueci de pagar o DAS! O sistema me avisa e calcula tudo automaticamente."</p>
                </div>

                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="https://img.freepik.com/fotos-gratis/jovem-adulto-praticando-esportes-indoor-na-academia_23-2149205542.jpg" alt="Roberto Santos" class="testimonial-avatar">
                        <div class="testimonial-info">
                            <h4>Roberto Santos</h4>
                            <p>Personal Trainer MEI</p>
                        </div>
                    </div>
                    <div class="stars">⭐⭐⭐⭐⭐</div>
                    <p class="testimonial-text">"Simples, rápido e eficiente. Consigo acessar de qualquer lugar!"</p>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ -->
    <section class="faq">
        <div class="faq-container">
            <div class="section-header">
                <h2>Perguntas frequentes</h2>
                <p>Tire suas dúvidas sobre o FinanceiMEI</p>
            </div>
            <div class="faq-grid">
                <div class="faq-item">
                    <h3 class="faq-question">💰 Quanto custa?</h3>
                    <p class="faq-answer">Você pode começar gratuitamente para testar todas as funcionalidades. Depois, o plano completo custa apenas R$ 27/mês e pode ser cancelado quando quiser.</p>
                </div>

                <div class="faq-item">
                    <h3 class="faq-question">💳 Preciso cadastrar cartão de crédito?</h3>
                    <p class="faq-answer">Não! Para começar a usar, você só precisa de e-mail e senha. Sem burocracia, sem cadastrar cartão.</p>
                </div>

                <div class="faq-item">
                    <h3 class="faq-question">📱 Funciona no celular?</h3>
                    <p class="faq-answer">Sim! O sistema funciona perfeitamente no celular, tablet e computador. Você pode acessar de qualquer lugar, a qualquer hora.</p>
                </div>

                <div class="faq-item">
                    <h3 class="faq-question">🔒 Meus dados ficam seguros?</h3>
                    <p class="faq-answer">Totalmente! Usamos criptografia de ponta e seus dados são armazenados em servidores seguros. Sua privacidade é nossa prioridade.</p>
                </div>

                <div class="faq-item">
                    <h3 class="faq-question">⏱️ É difícil de usar?</h3>
                    <p class="faq-answer">Não! O FinanceiMEI foi feito para ser extremamente simples. Em menos de 5 minutos você já está controlando suas finanças.</p>
                </div>

                <div class="faq-item">
                    <h3 class="faq-question">🧾 O sistema calcula o DAS automaticamente?</h3>
                    <p class="faq-answer">Sim! O sistema calcula o valor do DAS automaticamente e ainda te avisa quando o vencimento está próximo.</p>
                </div>

                <div class="faq-item">
                    <h3 class="faq-question">❌ Posso cancelar quando quiser?</h3>
                    <p class="faq-answer">Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas. Seus dados continuam salvos caso queira voltar.</p>
                </div>

                <div class="faq-item">
                    <h3 class="faq-question">🤝 Tem suporte se eu precisar de ajuda?</h3>
                    <p class="faq-answer">Com certeza! Nossa equipe está sempre disponível para te ajudar via WhatsApp, e-mail ou chat dentro do sistema.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- FINAL CTA -->
    <section class="final-cta">
        <div class="cta-box">
            <h2>Comece hoje mesmo</h2>
            <p>Junte-se a centenas de MEI que já transformaram suas finanças</p>
            <a href="/cadastro" class="btn-white">
                Criar conta grátis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </a>
        </div>
    </section>

    <!-- FOOTER -->
    <footer>
        <p>© 2025 FinanceiMEI - Gestão financeira para microempreendedores</p>
    </footer>
</body>
</html>
