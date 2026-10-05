import { useEffect, useRef } from 'react';
import './portfolio.css';

/* ============================================
   SVG КОМПОНЕНТЫ
   ============================================ */

const ArrowIcon = () => (
  <svg className="arrow-icon" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="6" x2="34" y2="6" stroke="currentColor" strokeWidth="1.2" />
    <polyline points="30,2 36,6 30,10" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

/* ============================================
   ПРЕЛОАДЕР "ПРОЯВКА"
   ============================================ */
const Preloader = () => {
  return (
    <div className="preloader" id="preloader">
      <div className="preloader__text">
        35MM — ISO 400 — FR 01A
      </div>
    </div>
  );
};





/* ============================================
   ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
   ============================================ */

export default function App() {


  useEffect(() => {
    // JS-фолбэк для тач-устройств
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
      document.body.classList.add('is-touch');
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- ПРЕЛОАДЕР ---------- */
    const preloader = document.getElementById('preloader');
    if (preloader) {
      if (prefersReducedMotion || sessionStorage.getItem('preloader-shown')) {
        preloader.style.display = 'none';
        document.body.classList.add('loaded');
      } else {
        document.body.style.overflow = 'hidden';
        const hidePreloader = () => {
          preloader.classList.add('preloader--hidden');
          document.body.style.overflow = '';
          document.body.classList.add('loaded');
          sessionStorage.setItem('preloader-shown', '1');
          setTimeout(() => { preloader.style.display = 'none'; }, 700);
        };
        window.addEventListener('load', () => setTimeout(hidePreloader, 700));
        setTimeout(hidePreloader, 1500);
      }
    }

    /* ---------- Intersection Observer для .reveal ---------- */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal').forEach((el) => {
      observer.observe(el);
    });

    /* ---------- Intersection Observer для .insta-shot ---------- */
    const instaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('insta-visible');
            instaObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    const instaShot = document.querySelector('.insta-shot');
    if (instaShot) instaObserver.observe(instaShot);

    /* ---------- LINE-MASK REVEAL ---------- */
    const lineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.line-mask').forEach((el) => {
      if (prefersReducedMotion) {
        el.classList.add('in-view');
      } else {
        lineObserver.observe(el);
      }
    });

    /* ---------- ПРОЯВКА КАДРОВ ПОРТФОЛИО ---------- */
    const portfolioObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('developed');
            portfolioObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.portfolio__card-img').forEach((el, i) => {
      if (prefersReducedMotion) {
        (el as HTMLElement).classList.add('developed');
      } else {
        (el as HTMLElement).style.transitionDelay = `${i * 100}ms`;
        portfolioObserver.observe(el);
      }
    });





    /* ---------- LIGHTBOX - УНИВЕРСАЛЬНОЕ ДЕЛЕГИРОВАНИЕ ---------- */
    
    // Обработка открытия лайтбокса
    const handleLightboxOpen = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const img = target.closest('img') as HTMLImageElement;
      
      // Проверяем, что клик был по изображению внутри портфолио
      const portfolioSection = img?.closest('.portfolio');
      
      if (img && portfolioSection) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('✅ Клик по изображению:', img.src);
        
        const lightbox = document.getElementById('portfolio-lightbox');
        if (!lightbox) {
          console.error('❌ Лайтбокс не найден! Проверь HTML.');
          return;
        }
        
        const lightboxImg = lightbox.querySelector('.lightbox-img') as HTMLImageElement;
        if (lightboxImg) {
          // Меняем src
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt || 'Избранная работа';
          
          // Показываем лайтбокс
          lightbox.classList.add('active');
          console.log('✅ Лайтбокс открыт');
        } else {
          console.error('❌ .lightbox-img не найден внутри лайтбокса!');
        }
      }
    };

    // Обработка закрытия лайтбокса
    const handleLightboxClose = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const lightbox = document.getElementById('portfolio-lightbox');
      if (!lightbox) return;
      
      const closeBtn = target.closest('.lightbox-close');
      const clickedOnBackground = target === lightbox;
      
      if (closeBtn || clickedOnBackground) {
        lightbox.classList.remove('active');
        console.log('✅ Лайтбокс закрыт');
        
        // Очищаем src после анимации
        setTimeout(() => {
          const lightboxImg = lightbox.querySelector('.lightbox-img') as HTMLImageElement;
          if (lightboxImg) lightboxImg.src = '';
        }, 500);
      }
    };

    // Закрытие по Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const lightbox = document.getElementById('portfolio-lightbox');
        if (lightbox && lightbox.classList.contains('active')) {
          lightbox.classList.remove('active');
          console.log('✅ Лайтбокс закрыт по Escape');
          
          setTimeout(() => {
            const lightboxImg = lightbox.querySelector('.lightbox-img') as HTMLImageElement;
            if (lightboxImg) lightboxImg.src = '';
          }, 500);
        }
      }
    };

    // Регистрируем обработчики
    document.addEventListener('click', handleLightboxOpen);
    document.addEventListener('click', handleLightboxClose);
    document.addEventListener('keydown', handleEscape);

    /* ---------- TOUCH-LIT для кнопок на тач-устройствах ---------- */
    let touchLitObserver: IntersectionObserver | null = null;
    if (!prefersReducedMotion && window.matchMedia('(hover: none), (pointer: coarse)').matches) {
      const touchButtons = document.querySelectorAll('.btn-how, .btn-signup');
      if (touchButtons.length && 'IntersectionObserver' in window) {
        touchLitObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle('touch-lit', entry.isIntersecting);
          });
        }, { rootMargin: '0px 0px -7.5% 0px', threshold: 0 });
        
        touchButtons.forEach((btn) => touchLitObserver!.observe(btn));
      }
    }

    return () => {
      observer.disconnect();
      instaObserver.disconnect();
      lineObserver.disconnect();
      portfolioObserver.disconnect();
      if (touchLitObserver) touchLitObserver.disconnect();
      document.removeEventListener('click', handleLightboxOpen);
      document.removeEventListener('click', handleLightboxClose);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);



  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* ========== ПРЕЛОАДЕР ========== */}
      <Preloader />



      {/* ========== HERO СЕКЦИЯ ========== */}
      <header className="hero" id="hero">
        <div className="hero__bg">
          <img
            src="https://i.postimg.cc/MZmBXBHJ/hiro-fon-kati.webp"
            alt="hiro-fon-kati"
          />
        </div>
        <div className="hero__overlay"></div>

        <div className="hero__top">
          <div className="hero__socials mouse-only">
            <a href="https://www.instagram.com/eppho.to/?hl=ru" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://t.me/pro100katerinkaa" target="_blank" rel="noopener noreferrer" aria-label="Telegram" title="Telegram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
              </svg>
            </a>
            <a href="tel:+70000000000" aria-label="Телефон" title="Телефон">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </a>
          </div>
          <a href="#scroll-to-insta-btn" className="hero__join arrow-link mouse-only">
            ПОДПИСАТЬСЯ <ArrowIcon />
          </a>

        </div>

        <h1 className="hero__name line-mask">
          <span className="line" style={{ '--i': 0 } as React.CSSProperties}>
            <span className="line-inner">ПОДСТАВКИНА</span>
          </span>
          <span className="line" style={{ '--i': 1 } as React.CSSProperties}>
            <span className="line-inner">ЕКАТЕРИНА</span>
          </span>
        </h1>

        <div className="hero__nav">
          <nav>
            <a href="#about">О СЕБЕ</a>
            <a href="#portfolio">ПОРТФОЛИО</a>
            <a href="#services">УСЛУГИ</a>
            <a href="#journal">ГАЛЕРЕЯ</a>
            <a href="#contact">КОНТАКТЫ</a>
          </nav>
        </div>

        <p className="hero__tagline">
          Ловлю свет и создаю <em>истории</em>.
        </p>
      </header>

      {/* ========== МАНИФЕСТ ========== */}
      <section className="manifesto" id="about">
        <div className="manifesto__inner">
          <h2 className="manifesto__headline mixed-headline line-mask">
            <span className="line" style={{ '--i': 0 } as React.CSSProperties}>
              <span className="line-inner"><em>ты</em> НЕ ПОЗИРУЕШЬ.</span>
            </span>
          </h2>

          <div className="manifesto__collage">
            <img
              className="manifesto__collage-img1"
              src="https://i.postimg.cc/wMnMn920/611280113-17850826491613066-4070977003915591454-n.jpg"
              alt="Кадр со съёмки Екатерины Подставкиной"
              loading="lazy"
            />
            <img
              className="manifesto__collage-img2"
              src="https://i.postimg.cc/4yQ2S3Xx/649246192-17859272616613066-4078323034697577703-n.webp"
              alt="Ч/б кадр со съёмки"
              loading="lazy"
            />
          </div>

            <div>
              <p className="manifesto__text">
                Я Екатерина — editorial и love story-фотограф из Барнаула.
                Мои работы живут на стыке живых эмоций и{' '}
                <em>строгой композиции</em>.
                Каждая съёмка создана так, чтобы вы забыли о присутствии камеры.
              </p>
              <a href="#services" className="btn btn-how arrow-link">
                КАК Я РАБОТАЮ <ArrowIcon />
              </a>
            </div>
          </div>
      </section>

      {/* ========== ПОРТФОЛИО ========== */}
      <section className="portfolio curved-top curved-top--milk" id="portfolio">
        <span className="watermark watermark--light" style={{ top: '9%', right: '-5%' }}>РАБОТЫ</span>

        <div className="portfolio__inner">
          <h2 className="portfolio__title reveal">ИЗБРАННЫЕ РАБОТЫ</h2>

          <div className="portfolio__grid">
            <div className="portfolio__card reveal">
              <img
                className="portfolio__card-img"
                src="https://i.postimg.cc/HnSvmshV/Ph-eppho-to.jpg"
                alt="Избранная работа 1"
                loading="lazy"
              />
              <a href="#" className="portfolio__card-link arrow-link">СМОТРЕТЬ <ArrowIcon /></a>
            </div>

            <div className="portfolio__card reveal">
              <img
                className="portfolio__card-img"
                src="https://i.postimg.cc/1XP4SyNW/772036219-17883831528613066-8413099912558788250-n.webp"
                alt="Избранная работа 2"
                loading="lazy"
              />
              <a href="#" className="portfolio__card-link arrow-link">СМОТРЕТЬ <ArrowIcon /></a>
            </div>

            <div className="portfolio__card reveal">
              <img
                className="portfolio__card-img"
                src="https://i.postimg.cc/PJNzmbSs/733385607-17878672101613066-1236585551544194995-n.jpg"
                alt="Избранная работа 3"
                loading="lazy"
              />
              <a href="#" className="portfolio__card-link arrow-link">СМОТРЕТЬ <ArrowIcon /></a>
            </div>

            <div className="portfolio__card reveal">
              <img
                className="portfolio__card-img"
                src="https://i.postimg.cc/bN7Httkz/748740325-17879988873613066-8812554791484293941-n.jpg"
                alt="Избранная работа 4"
                loading="lazy"
              />
              <a href="#" className="portfolio__card-link arrow-link">СМОТРЕТЬ <ArrowIcon /></a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== УСЛУГИ ========== */}
      <section className="services" id="services">
        <div className="services__inner">
          <h2 className="services__headline mixed-headline reveal line-mask">
            <span className="line" style={{ '--i': 0 } as React.CSSProperties}>
              <span className="line-inner"><em>опыт</em> — ЭТО ВСЁ.</span>
            </span>
          </h2>

          <div className="services__steps">
            <div className="services__step reveal">
              <span className="services__step-num">01</span>
              <div className="services__step-content">
                <h3>КОНСУЛЬТАЦИЯ</h3>
                <p>Всё начинается с разговора — ваше видение, ваша история, ощущение, которое вы хотите унести с собой. Я помогу подобрать образ, локацию и настроение.</p>
              </div>
            </div>

            <div className="services__step reveal">
              <span className="services__step-num">02</span>
              <div className="services__step-content">
                <h3>СЪЁМКА</h3>
                <p>Никаких застывших поз. Никакой спешки. Я создаю пространство, где можно дышать, двигаться и быть собой. Естественный свет, осознанная композиция и настоящая связь с камерой.</p>
              </div>
            </div>

            <div className="services__step reveal">
              <span className="services__step-num">03</span>
              <div className="services__step-content">
                <h3>ГАЛЕРЕЯ</h3>
                <p>В течение двух недель вы получите кураторскую галерею отредактированных изображений — каждое отобрано вручную и обработано с уважением к моменту. Доступны печати и фотокниги.</p>
              </div>
            </div>
          </div>

          <a href="#book" className="btn btn-signup arrow-link reveal">
            ЗАПИСАТЬСЯ НА СЪЁМКУ <ArrowIcon />
          </a>
        </div>
      </section>

      {/* ========== СОЦСЕТИ ========== */}
      <section className="social curved-top curved-top--milk" id="journal">
        <div className="social__watermark-wrapper">
          <span className="watermark watermark--light" style={{ top: 'clamp(20px, 5vh, 56px)', left: '50%', transform: 'translateX(-50%)', fontSize: 'clamp(64px, 15vw, 210px)', lineHeight: 1, whiteSpace: 'nowrap', width: 'max-content' }}>INSTAGRAM</span>
        </div>

        <div className="social__inner">
          <div className="reveal">
            <h2 className="social__headline">INSTAGRAM</h2>
            <p className="social__text">
              <em>Заходите за</em> <strong>ЭСТЕТИКОЙ</strong>,{' '}
              <em>живыми моментами</em> и <strong>ПЛЁНКОЙ.</strong>
            </p>
          </div>
        </div>

        <div className="insta-shot">
          <img
            src="https://i.postimg.cc/fL65qNxp/iphone-ephoto.webp"
            alt="iPhone со скриншотом Instagram-ленты @ekaterina.podstavkina"
            width="1284"
            height="2646"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>

      {/* ========== РАССЫЛКА ========== */}
      <section className="newsletter" id="contact">
        <div className="newsletter__bg">
          <img
            src="https://i.postimg.cc/7PzNYb8M/Being-a-woman.jpg"
            alt="Being a woman"
            loading="lazy"
          />
        </div>

        <div className="newsletter__inner reveal">
          <h2 className="newsletter__headline mixed-headline line-mask">
            <span className="line" style={{ '--i': 0 } as React.CSSProperties}>
              <span className="line-inner"><em>сделаю вашу ленту более</em> <strong>ВДОХНОВЛЯЮЩЕЙ</strong></span>
            </span>
          </h2>
          <p className="newsletter__desc">
            Все мои работы
          </p>
          <a
            id="scroll-to-insta-btn"
            href="https://www.instagram.com/eppho.to/?hl=ru"
            target="_blank"
            rel="noopener"
            className="btn arrow-link"
          >
            В INSTAGRAM <ArrowIcon />
          </a>
        </div>
      </section>

      {/* ========== ПОДВАЛ ========== */}
      <footer className="footer curved-top curved-top--black">
        <div className="marquee">
          <div className="marquee__track">
            <span className="marquee__text">СОЗДАВАТЬ —</span>
            <span className="marquee__text">СОЗДАВАТЬ —</span>
            <span className="marquee__text">СОЗДАВАТЬ —</span>
            <span className="marquee__text">СОЗДАВАТЬ —</span>
            <span className="marquee__text">СОЗДАВАТЬ —</span>
            <span className="marquee__text">СОЗДАВАТЬ —</span>
            <span className="marquee__text">СОЗДАВАТЬ —</span>
            <span className="marquee__text">СОЗДАВАТЬ —</span>
          </div>
        </div>

        <div className="footer__cta" id="book">
          <h2 className="footer__cta-title">ГОТОВЫ ЗАПИСАТЬСЯ?</h2>
          <a href="https://t.me/pro100katerinkaa" target="_blank" rel="noopener noreferrer" className="btn btn--outline arrow-link">
            СВЯЗАТЬСЯ <ArrowIcon />
          </a>
        </div>

        <div className="footer__bottom">
          <nav className="footer__bottom-nav mouse-only">
            <a href="#about">О себе</a>
            <a href="#portfolio">Портфолио</a>
            <a href="#services">Услуги</a>
            <a href="#journal">Галерея</a>
            <a href="#contact">Контакты</a>
          </nav>

          <div className="footer__bottom-social">
            <a href="https://www.instagram.com/eppho.to/?hl=ru" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://t.me/pro100katerinkaa" target="_blank" rel="noopener noreferrer" aria-label="Telegram" title="Telegram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
              </svg>
            </a>
            <a href="tel:+70000000000" aria-label="Телефон" title="Телефон">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </a>
          </div>

          <span className="footer__copy">© {currentYear} eppho.to. Все права защищены.</span>
        </div>
      </footer>

      {/* ========== LIGHTBOX ========== */}
      <div id="portfolio-lightbox" className="lightbox">
        <button className="lightbox-close" aria-label="Закрыть">&times;</button>
        <img src="" alt="Увеличенное изображение" className="lightbox-img" />
      </div>
    </>
  );
}
