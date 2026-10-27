import { useRef, useState, type KeyboardEvent } from "react";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { type HeroStory } from "../lib/hero-content";
import { useHome } from "../lib/api";
import "./hero.css";

function EditorialPhoto({
  story,
  duration,
  priority,
}: {
  story: HeroStory;
  duration: number;
  priority: boolean;
}) {
  const isPresent = useIsPresent();
  return (
    <motion.img
      className="hero-photo"
      src={story.image}
      srcSet={story.imageSrcSet}
      sizes="(max-width: 899px) calc(100vw - 44px), 50vw"
      alt={story.alt}
      aria-hidden={isPresent ? undefined : true}
      width={1536}
      height={1024}
      style={{ objectPosition: story.position }}
      initial={{ opacity: duration === 0 ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}

export function Hero() {
  const heroStories = useHome()?.hero.items ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = useReducedMotion();
  const story = heroStories[activeIndex];

  function selectTab(index: number, focus = false) {
    setActiveIndex(index);
    if (focus) tabs.current[index]?.focus({ preventScroll: true });
  }

  function onTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = (index + 1) % heroStories.length;
        break;
      case "ArrowLeft":
        next = (index + heroStories.length - 1) % heroStories.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = heroStories.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    selectTab(next, true);
  }

  function explore() {
    const section = document.getElementById("actualites");
    section?.focus({ preventScroll: true });
    section?.scrollIntoView({
      block: "start",
      behavior: reduceMotion ? "instant" : "smooth",
    });
  }

  if (!story) return null;

  return (
    <section className="ocean-hero" aria-labelledby="hero-title">
      <div className="hero-container">
        <div className="hero-composition">
          <div className="hero-copy">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <p className="hero-eyebrow">
                <span aria-hidden="true" />
                COMPRENDRE. APPRENDRE. OSER.
              </p>
              <h1 id="hero-title" className="hero-title">
                L’info qui <br />
                ouvre les <br />
                <em>horizons.</em>
              </h1>
              <p className="hero-description">
                Océan Média TV rapproche la jeunesse congolaise des
                informations, des connaissances et des opportunités qui lui
                permettent d'apprendre, d'entreprendre et de construire son
                avenir.
              </p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="hero-primary-action"
                  onClick={explore}
                >
                  Découvrir les actualités
                  <ArrowDownRight
                    size={20}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </motion.div>
          </div>

          <div className="hero-editorial">
            <div
              className="hero-tabs"
              role="tablist"
              aria-label="Nos regards éditoriaux"
            >
              {heroStories.map((item, index) => (
                <button
                  type="button"
                  role="tab"
                  id={`hero-tab-${item.id}`}
                  key={item.id}
                  aria-selected={activeIndex === index}
                  aria-controls="hero-feature-panel"
                  tabIndex={activeIndex === index ? 0 : -1}
                  ref={(element) => {
                    tabs.current[index] = element;
                  }}
                  onClick={() => selectTab(index)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                  className={`hero-tab${activeIndex === index ? " is-selected" : ""}`}
                >
                  <span className="hero-tab-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span>{item.tab}</span>
                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
            <div
              className="hero-feature"
              id="hero-feature-panel"
              role="tabpanel"
              aria-labelledby={`hero-tab-${story.id}`}
              tabIndex={0}
            >
              <div className="hero-photo-wrap">
                <AnimatePresence initial={false}>
                  <EditorialPhoto
                    key={story.id}
                    story={story}
                    duration={reduceMotion ? 0 : 0.45}
                    priority={activeIndex === 0}
                  />
                </AnimatePresence>
              </div>
              <div className="hero-photo-shade" aria-hidden="true" />
              <div className="hero-photo-topline">
                <span className="hero-photo-counter">
                  <span className="sr-only">Regard </span>0{activeIndex + 1}
                  <span className="counter-divider" aria-hidden="true" />
                  <span className="sr-only"> sur </span>
                  {String(heroStories.length).padStart(2, "0")}
                </span>
              </div>
              <div className="hero-feature-content">
                <span className="hero-feature-category">{story.category}</span>
                <h2 className="hero-feature-title">{story.title}</h2>
                <p className="hero-feature-description">{story.introduction}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
