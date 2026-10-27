import { AppLink } from "./AppLink";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  Mic,
  PenLine,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import {
  CATALOGUE_PAGE_SIZE,
  useCatalogueFilters,
  LoadState,
  useApi,
  useCollection,
  useSite,
} from "../lib/api";
import { Pagination } from "./Pagination";
import {
  type TrainingDomain,
  type TrainingSummary,
} from "../lib/training-content";
import "./trainings-page.css";

const domainIcons = {
  microphone: Mic,
  users: UsersRound,
  briefcase: BriefcaseBusiness,
  pen: PenLine,
  lightbulb: Lightbulb,
  graduation: GraduationCap,
};

export function TrainingsPage() {
  const {
    category: family,
    query,
    setCategory: setFamily,
    setQuery,
    reset: resetFilters,
  } = useCatalogueFilters("all");
  const [selected, setSelected] = useState<TrainingSummary | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Formations | Océan Média TV";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const { contact, trainingImage, categories } = useSite();
  const trainingFamilies = categories.trainings;
  const familyLabel = (id: string) =>
    trainingFamilies.find((item) => item.id === id)?.label ?? "";
  const data = useCollection("trainings", {
    category: family === "all" ? "" : family,
    query,
    limit: CATALOGUE_PAGE_SIZE,
    paginated: true,
  });
  const results = data.items;
  const detail = useApi<TrainingDomain>(
    selected ? "/trainings/" + encodeURIComponent(selected.id) : null,
  );

  const openTraining = (
    domain: TrainingSummary,
    trigger: HTMLButtonElement,
  ) => {
    lastTrigger.current = trigger;
    setSelected(domain);
    setDialogOpen(true);
  };

  const whatsappHref = selected
    ? `${contact.whatsappHref}?text=${encodeURIComponent(`Bonjour Océan Communication, je souhaite recevoir plus d’informations sur la formation « ${selected.title} ».`)}`
    : contact.whatsappHref;

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <main id="main-content" className="trainings-page" tabIndex={-1}>
        <header className="trainings-hero">
          <div className="trainings-shell">
            <AppLink className="trainings-breadcrumb" href="/#formations">
              <ArrowLeft size={14} aria-hidden="true" /> Retour à l’accueil
            </AppLink>
            <div className="trainings-hero-grid">
              <div className="trainings-hero-copy">
                <p className="trainings-kicker">
                  <span aria-hidden="true" />
                  FORMATIONS · OCÉAN COMMUNICATION
                </p>
                <h1>
                  Des compétences pour <em>construire son avenir.</em>
                </h1>
                <p className="trainings-lead">
                  Développez vos capacités personnelles, professionnelles et
                  entrepreneuriales grâce aux formations conçues pour vous aider
                  à apprendre, entreprendre et concrétiser vos ambitions.
                </p>
                <AppLink href="#catalogue-formations">
                  Découvrir les domaines{" "}
                  <ArrowRight size={17} aria-hidden="true" />
                </AppLink>
              </div>
              <figure className="trainings-hero-visual">
                <img
                  src={trainingImage.src}
                  srcSet={trainingImage.srcSet}
                  sizes="(max-width: 799px) calc(100vw - 44px), 45vw"
                  alt={trainingImage.alt}
                  width="1080"
                  height="720"
                  decoding="async"
                />
                <div className="trainings-visual-shade" aria-hidden="true" />
                <figcaption>
                  <span>{trainingImage.pageEyebrow}</span>
                  <strong>{trainingImage.pageCaption}</strong>
                </figcaption>
              </figure>
            </div>
          </div>
        </header>

        <section
          id="catalogue-formations"
          tabIndex={-1}
          className="trainings-catalogue"
          aria-labelledby="trainings-catalogue-title"
        >
          <div className="trainings-shell">
            <div className="trainings-catalogue-heading">
              <div>
                <p>NOTRE CHAMP D’INTERVENTION</p>
                <h2 id="trainings-catalogue-title">
                  Explorez nos domaines <span>de formation.</span>
                </h2>
              </div>
              <p>
                Choisissez un domaine pour découvrir ses objectifs, son approche
                et les profils auxquels il s’adresse.
              </p>
            </div>

            <div className="trainings-tools">
              <form role="search" onSubmit={(event) => event.preventDefault()}>
                <Search size={18} aria-hidden="true" />
                <label className="sr-only" htmlFor="training-search">
                  Rechercher une formation
                </label>
                <input
                  id="training-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher une compétence, un thème…"
                  autoComplete="off"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Effacer la recherche"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </form>
              <div
                className="trainings-filters"
                role="group"
                aria-label="Filtrer les formations par domaine"
              >
                <button
                  type="button"
                  aria-pressed={family === "all"}
                  onClick={() => setFamily("all")}
                >
                  Toutes
                </button>
                {trainingFamilies.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={family === item.id}
                    onClick={() => setFamily(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="trainings-results-line">
              <p role="status" aria-live="polite">
                <strong>{data.pagination?.total ?? 0}</strong> domaine
                {(data.pagination?.total ?? 0) > 1 ? "s" : ""} à découvrir
              </p>
              {(family !== "all" || query) && (
                <button type="button" onClick={resetFilters}>
                  Réinitialiser <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>

            <LoadState {...data} count={3} />
            {data.loading || data.error ? null : results.length > 0 ? (
              <div className="trainings-grid">
                {results.map((domain, index) => {
                  const Icon = domainIcons[domain.icon];
                  return (
                    <article
                      key={domain.id}
                      className={`training-card training-card-${index % 3}`}
                    >
                      <div className="training-card-topline">
                        <span>
                          {String(
                            (data.page - 1) * CATALOGUE_PAGE_SIZE + index + 1,
                          ).padStart(2, "0")}
                        </span>
                        <span>{familyLabel(domain.family)}</span>
                      </div>
                      <span className="training-card-icon" aria-hidden="true">
                        <Icon size={28} strokeWidth={1.4} />
                      </span>
                      <h3>{domain.title}</h3>
                      <p>{domain.description}</p>
                      <button
                        type="button"
                        onClick={(event) =>
                          openTraining(domain, event.currentTarget)
                        }
                        aria-label={`Découvrir la formation ${domain.title}`}
                      >
                        Découvrir la formation{" "}
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="trainings-empty">
                <span aria-hidden="true">00</span>
                <h3>Aucun domaine ne correspond.</h3>
                <p>
                  Essayez un autre mot-clé ou affichez l’ensemble des
                  formations.
                </p>
                <button type="button" onClick={resetFilters}>
                  Voir toutes les formations{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            )}

            <Pagination
              meta={data.pagination}
              onChange={data.setPage}
              target="catalogue-formations"
            />
          </div>
        </section>

        <aside
          className="trainings-closing"
          aria-label="Accompagnement et formations"
        >
          <div className="trainings-shell">
            <div>
              <span>VOTRE PROJET, VOTRE PROGRESSION</span>
              <h2>Vous cherchez la formation adaptée à votre ambition ?</h2>
            </div>
            <p>
              Notre équipe peut vous orienter et vous communiquer les
              informations disponibles sur les prochaines programmations.
            </p>
          </div>
        </aside>
      </main>

      {selected && (
        <Dialog.Portal>
          <Dialog.Overlay className="training-dialog-overlay" />
          <Dialog.Content
            className="training-dialog"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              lastTrigger.current?.focus();
            }}
          >
            <div className="training-dialog-side">
              <span className="training-dialog-number">
                {String(
                  results.findIndex((item) => item.id === selected.id) +
                    1 +
                    (data.page - 1) * CATALOGUE_PAGE_SIZE,
                ).padStart(2, "0")}
              </span>
              <span className="training-dialog-family">
                {familyLabel(selected.family)}
              </span>
              <span className="training-dialog-icon" aria-hidden="true">
                {(() => {
                  const Icon = domainIcons[selected.icon];
                  return <Icon size={35} strokeWidth={1.25} />;
                })()}
              </span>
              <p>FORMER · INFORMER · ACCOMPAGNER</p>
            </div>
            <div className="training-dialog-main">
              <Dialog.Close
                className="training-dialog-close"
                aria-label="Fermer la fiche de formation"
              >
                <X size={21} aria-hidden="true" />
              </Dialog.Close>
              <p className="training-dialog-eyebrow">DOMAINE DE FORMATION</p>
              <Dialog.Title>{selected.title}</Dialog.Title>
              <Dialog.Description className="training-dialog-tagline">
                {selected.tagline}
              </Dialog.Description>
              <LoadState {...detail} variant="detail" />
              <p className="training-dialog-intro">
                {detail.data?.longDescription}
              </p>
              <div className="training-dialog-details">
                <section aria-labelledby="training-objectives-title">
                  <h3 id="training-objectives-title">
                    Ce que vous pourrez développer
                  </h3>
                  <ul>
                    {(detail.data?.objectives ?? []).map((objective) => (
                      <li key={objective}>
                        <Check size={15} aria-hidden="true" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </section>
                <section aria-labelledby="training-audience-title">
                  <h3 id="training-audience-title">Pour qui ?</h3>
                  <p>{detail.data?.audience}</p>
                </section>
                <section aria-labelledby="training-approach-title">
                  <h3 id="training-approach-title">L’approche</h3>
                  <p>{detail.data?.approach}</p>
                </section>
              </div>
              <div className="training-dialog-actions">
                <AppLink
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  Nous contacter sur WhatsApp
                  <ArrowUpRight size={17} aria-hidden="true" />
                  <span className="sr-only"> — nouvel onglet</span>
                </AppLink>
                <p>
                  Posez vos questions sur cette formation directement à notre
                  équipe.
                </p>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  );
}
