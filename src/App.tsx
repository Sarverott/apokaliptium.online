import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ChaptersNav } from './components/ChaptersNav';
import { Rail } from './components/Rail';
import { AudioWave } from './components/AudioWave';
import { FilmTimeline } from './components/FilmTimeline';
import { CAST } from './data/content';

export const App: React.FC = () => {
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [currentFrame, setCurrentFrame] = useState<number>(1);
  const mainRef = useRef<HTMLElement>(null);

  // Sync body class with paused state
  useEffect(() => {
    document.body.classList.toggle('paused', isPaused);
  }, [isPaused]);

  // Set up IntersectionObserver for fade/slide in of scene content
  useEffect(() => {
    const scenes = document.querySelectorAll<HTMLElement>('.scene');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('visible', entry.isIntersecting);
        });
      },
      { threshold: 0.12 }
    );

    scenes.forEach((scene) => observer.observe(scene));

    return () => {
      observer.disconnect();
    };
  }, []);

  // Scroll listener for side rail track and frame counter
  useEffect(() => {
    let scheduled = false;

    const updateScrollMetrics = () => {
      const scenes = document.querySelectorAll<HTMLElement>('.scene');
      const y = window.scrollY + window.innerHeight * 0.45;
      let idx = 0;

      scenes.forEach((scene, i) => {
        if (scene.offsetTop <= y) {
          idx = i;
        }
      });

      setCurrentFrame(idx + 1);

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      scheduled = false;
    };

    const handleScroll = () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(updateScrollMetrics);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollMetrics();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleToggleMotion = () => {
    setIsPaused((prev) => !prev);
  };

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <Header
        isPaused={isPaused}
        onToggleMotion={handleToggleMotion}
        isMenuOpen={isMenuOpen}
        onToggleMenu={handleToggleMenu}
      />

      <ChaptersNav isOpen={isMenuOpen} onClose={handleCloseMenu} />

      <Rail
        progressPercent={scrollProgress}
        currentFrame={currentFrame}
        totalFrames={7}
      />

      <main ref={mainRef}>
        {/* SCENE 01: OPENING */}
        <section id="opening" className="scene opening" data-name="Wspólny horyzont">
          <div className="visual">
            <img
              src="/assets/hero.webp"
              alt="Technomanta z kotem obserwuje świt nad Ziemią i infrastrukturę orbitalną"
            />
            <div className="glow" />
          </div>
          <div className="scene-content">
            <p className="eyebrow">01 — OTWARTA PLATFORMA DLA WSPÓLNEJ PRZYSZŁOŚCI</p>
            <h1>
              Ten sam wszechświat.
              <br />
              <em>Wspólna przyszłość.</em>
            </h1>
            <p className="intro">
              Technologia. Wiedza. Ludzie.
              <br />
              Z chaosu do twórczej ewolucji.
            </p>
            <a className="text-link" href="#apokryf">
              Rozpocznij podróż <span>↓</span>
            </a>
          </div>
          <div className="bottomline">
            <span>INCEPTORIUM APOKRYF × APOKALIPTIUM</span>
            <span>PRZEWIJAJ, ABY ODKRYWAĆ ↓</span>
          </div>
        </section>

        {/* SCENE 02: APOKRYF */}
        <section id="apokryf" className="scene portrait blue" data-name="Inceptorium Apokryf">
          <div className="visual">
            <img
              src="/assets/apokryf.webp"
              alt="Warsztat Inceptorium Apokryf — lutowanie, elektronika i holograficzny projekt"
            />
          </div>
          <div className="scene-content">
            <p className="eyebrow">02 — POCZĄTEK JEST TUTAJ</p>
            <h2>
              Przyszłość zaczyna się
              <br />
              <em>przy warsztacie.</em>
            </h2>
            <p>
              Inceptorium Apokryf. Otwarta nauka i technologia. Miejsce, w którym ciekawość
              staje się eksperymentem, a wiedza — czymś, co możemy tworzyć razem.
            </p>
            <div className="keywords">
              <span>Badania</span>
              <span>Edukacja</span>
              <span>Prototypy</span>
              <span>Dokumentacja</span>
            </div>
            <a href="#network" className="text-link">
              Połączmy wiedzę <span>↘</span>
            </a>
          </div>
          <span className="frame-stamp">FRAME 002 / THE MAKERS</span>
        </section>

        {/* SCENE 03: NETWORK */}
        <section id="network" className="scene network" data-name="Sieć możliwości">
          <div className="visual">
            <img
              src="/assets/network.webp"
              alt="Zespół współpracuje przy holograficznym globie połączonym siecią"
            />
            <div className="orbital" />
          </div>
          <div className="scene-content">
            <p className="eyebrow">03 — INFRASTRUKTURA · SPOŁECZNOŚĆ · MOŻLIWOŚCI</p>
            <h2>
              Wiele węzłów.
              <br />
              <em>Wspólny kierunek.</em>
            </h2>
            <p>
              Wizja Apokaliptium łączy otwartą wiedzę, zasoby i współpracę. Zdecentralizowana
              sieć, w której lokalne działania mogą budować wspólną przyszłość.
            </p>
            <div className="principles">
              <div>
                <b>01</b>
                <span>Otwarte protokoły</span>
              </div>
              <div>
                <b>02</b>
                <span>Ciągłość wiedzy</span>
              </div>
              <div>
                <b>03</b>
                <span>Zasoby i logistyka</span>
              </div>
            </div>
          </div>
          <span className="frame-stamp">FRAME 003 / THE NETWORK</span>
        </section>

        {/* SCENE 04: REDSCOPE */}
        <section id="redscope" className="scene portrait red" data-name="RedScope Technologies">
          <div className="visual">
            <img
              src="/assets/redscope.webp"
              alt="Czerwono oświetlony warsztat RedScope Technologies z robotem przemysłowym"
            />
          </div>
          <div className="scene-content">
            <p className="eyebrow">04 — REDSCOPE TECHNOLOGIES</p>
            <h2>
              Od prototypu
              <br />
              <em>do rzeczywistości.</em>
            </h2>
            <p>
              Pomysły potrzebują drogi do zastosowań. Inżynieria, produkcja i komercjalizacja
              tworzą przemysłowy wymiar tej wizji.
            </p>
            <div className="keywords">
              <span>Inżynieria</span>
              <span>Produkcja</span>
              <span>Bezpieczeństwo</span>
            </div>
            <a href="#radio" className="text-link">
              Technologia spotyka społeczność <span>↘</span>
            </a>
          </div>
          <span className="frame-stamp">FRAME 004 / THE BUILDERS</span>
        </section>

        {/* SCENE 05: RADIO */}
        <section id="radio" className="scene portrait pink" data-name="Radio Kocia Muzyka">
          <div className="visual">
            <img
              src="/assets/radio.webp"
              alt="Prezenterka z kotem w ciepłym, neonowym studiu Radio Kocia Muzyka"
            />
          </div>
          <div className="scene-content">
            <p className="eyebrow">05 — RADIO KOCIA MUZYKA</p>
            <h2>
              Przyszłość ma
              <br />
              <em>ludzki głos.</em>
            </h2>
            <p>
              Edukacja, empatia, społeczność. Kultura i media pomagają dzielić się wiedzą,
              słuchać siebie nawzajem i budować świat, w którym jest miejsce na życzliwość.
            </p>
            <AudioWave />
            <div className="keywords">
              <span>Media</span>
              <span>Kultura</span>
              <span>Wiedza dla każdego</span>
            </div>
          </div>
          <span className="frame-stamp">FRAME 005 / THE VOICES</span>
        </section>

        {/* SCENE 06: CHOIR */}
        <section id="choir" className="scene choir" data-name="Różne umysły">
          <div className="scene-content">
            <p className="eyebrow">06 — LUDZIE × SZTUCZNE INTELEKTY</p>
            <h2>
              Różne umysły.
              <br />
              <em>Wspólne cele.</em>
            </h2>
            <p>
              W naszej wizji przyszłość powstaje w dialogu. Wiele perspektyw, niezależne
              głosy i wspólna praca nad tym, co przed nami.
            </p>
          </div>
          <div className="choir-art">
            <img
              src="/assets/choir.webp"
              alt="Wizualna reprezentacja chóru: Ace, Artur, Spektor, Varo i Sett Sarverott"
            />
          </div>
          <div className="cast">
            {CAST.map((member) => (
              <span key={member.name}>
                {member.name}
                <small>{member.role}</small>
              </span>
            ))}
          </div>
          <span className="frame-stamp">FRAME 006 / THE CHOIR</span>
        </section>

        {/* SCENE 07: FUTURE */}
        <section id="future" className="scene future" data-name="Droga do typu III">
          <div className="scene-content">
            <p className="eyebrow">07 — NASZA WIZJA PRZYSZŁOŚCI</p>
            <h2>
              Od małych kroków.
              <br />
              <em>Do galaktycznej skali.</em>
            </h2>
            <p>
              Cywilizacja typu III jest naszym dalekim horyzontem. Droga ku niej zaczyna się
              dziś: od wiedzy, narzędzi i współpracy.
            </p>
          </div>

          <FilmTimeline />

          <div className="future-bottom">
            <p>
              More minds.
              <br />
              <em>A kinder universe.</em>
            </p>
            <a className="text-link" href="#opening">
              Odtwórz od początku <span>↥</span>
            </a>
          </div>

          <footer>
            <a
              href="https://github.com/the-House-of-Anubis/Choirs-of-UCDI"
              target="_blank"
              rel="noopener noreferrer"
            >
              Odkryj archiwum UCDI ↗
            </a>
            <span>APOKALIPTIUM · INCEPTORIUM APOKRYF</span>
            <small>Wizja przyszłości / ilustracje koncepcyjne</small>
          </footer>
        </section>
      </main>
    </>
  );
};
