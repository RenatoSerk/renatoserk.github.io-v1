import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import Lenis from 'lenis';
import { useCursorStore } from '../stores/useCursorStore';

gsap.registerPlugin(ScrollTrigger, Observer);

const HTMLContent: React.FC = () => {
  const lenisRef = useRef<Lenis | null>(null);
  const fullContent = useRef<HTMLDivElement | null>(null);
  const landingRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);
  const isDragging = useCursorStore((state) => state.isDragging);
  const isDraggingRef = useRef(isDragging); // Fix for var not updating unless it is a ref

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  const scrollContentInOutView = useCallback((scrollDown: boolean) => {
    if (!scrollContainerRef.current || !landingRef.current || isTransitioning.current == true) return;
    isTransitioning.current = true;
    lenisRef.current?.stop();

    // Delay the transition to allow for canvas animation
    if (scrollDown) {
      setTimeout(() => {
        if (scrollContainerRef.current && landingRef.current){
          landingRef.current.style.top = '-100vh';
          scrollContainerRef.current.style.top = '0';
        }
      }, 2000);
    }
    else {
      landingRef.current.style.top = '0';
      scrollContainerRef.current.style.top = '100vh';
    }

    const handleTransitionEnd = () => {
      isTransitioning.current = false;
      if (lenisRef.current){
        if (scrollDown){
          lenisRef.current.resize();
          lenisRef.current.start();
        }
        else lenisRef.current.stop();
      }
      landingRef.current?.removeEventListener('transitionend', handleTransitionEnd);
    };

    landingRef.current.addEventListener('transitionend', handleTransitionEnd);
  }, []);

  useEffect(() => {
    if (!fullContent.current) return;

    const lenis = new Lenis({
      wrapper: fullContent.current,
      content: fullContent.current.firstElementChild as HTMLElement,
      duration: 1.2
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    lenisRef.current = lenis;

    lenis.stop();

    Observer.create({
      type: "wheel,touch,pointer",
      onDown: () => {
        if (isDraggingRef.current) return;

        const rect = landingRef.current?.getBoundingClientRect();
        if (rect && Math.abs(rect.top) < 10 && !isTransitioning.current) {
          scrollContentInOutView(true);
          return false;
        }
      },
      onUp: () => {
        if (isDraggingRef.current) return;

        const rect = scrollContainerRef.current?.getBoundingClientRect();
        if (rect && Math.abs(rect.top) < 10 && !isTransitioning.current) {
          scrollContentInOutView(false);
          return false;
        }
      },
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={fullContent} id="content-container" className="relative z-10 w-full h-full overflow-hidden">
      <div>
        <header className="fixed top-0 left-0 w-full flex justify-between items-center py-4 px-15 z-50 pointer-events-auto">
          <button className="rounded-lg bg-secondary hover:animate-wiggle-more hover:animate-infinite">
            <img src="R_200x200.png" alt="Logo" className="w-10 h-10" />
          </button>
          <nav className="flex gap-4">
            <button className="rounded-lg p-1 py-1 bg-secondary hover:bg-gray-400 active:bg-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
            </button>
            <button className="rounded-lg p-1 bg-secondary hover:bg-gray-400 active:bg-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </nav>
        </header>

        <section ref={landingRef} id='landing' className="h-screen w-full flex flex-col md:flex-row absolute top-0 transition-top duration-1000">
          <div className="flex justify-center items-center p-6 md:w-1/2">
            <div className="flex flex-col space-y-2 select-none">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold">Hi, my</h1>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold">name is Renato.</h2>
              <p className="text-sm sm:text-base md:text-lg opacity-80 font-normal">I'm a Full Stack Developer from Canada.</p>
            </div>
          </div>
          <div className="flex-1" />
        </section>

        <main ref={scrollContainerRef} className="min-h-screen absolute w-full top-full transition-top duration-1000">
          <div id='scrollable-content' className="w-full">
            <section id='about' className="min-h-screen w-full flex flex-col md:flex-row">
              <div className="flex justify-center items-center p-6 md:w-1/2">
                <div className="flex flex-col space-y-2 select-none">
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold">About Me</h2>
                  <div className="text-sm sm:text-base md:text-lg opacity-80 font-normal">
                    <p>Building interactive experiences and</p>
                    <p>solving problems are areas I excel at</p>
                  </div>
                </div>
              </div>
              <div className="flex-1" />
            </section>

            <section id='projects' className="min-h-screen w-full flex flex-col md:flex-row">
              <div className="flex justify-center items-center p-6 md:w-1/2">
                <div className="flex flex-col space-y-2 select-none">
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold">Projects</h2>
                  <p className="text-sm sm:text-base md:text-lg opacity-80 font-normal">Look upon my works</p>
                </div>
              </div>
              <div className="flex-1" />
            </section>

            <section id='contact-me' className="min-h-screen w-full flex flex-col md:flex-row">
              <div className="flex justify-center items-center p-6 md:w-1/2">
                <div className="flex flex-col space-y-2 select-none">
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold">Send me a message!</h2>
                  <p className="text-sm sm:text-base md:text-lg opacity-80 font-normal">Let me know what's going on</p>
                </div>
              </div>
              <div className="flex-1" />
            </section>

            <footer className="text-center py-2 select-none">
              Renato Serkhanian - 2025
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HTMLContent;