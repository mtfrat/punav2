import { demoDefinitions, type DemoId } from "../../content/demos";
import { ExampleBadge, type Loc } from "./shared";

export const VIDEO_DEMO_ID: DemoId = "convenio-multilateral";
export const VIDEO_BASE = "/media/demos/convenio-multilateral";

export default function VideoDemo({ loc }: { loc: Loc }) {
  const demo = demoDefinitions.find((d) => d.id === VIDEO_DEMO_ID)!;
  const c = demo.copy[loc];
  const v = c.video!;
  return (
    <section className="dm-stage" aria-label={c.title}>
      <div className="dm-stage-head">
        <div className="dm-stage-title">
          <span className="dm-dot" aria-hidden="true" />
          <strong>{v.heading}</strong>
          <ExampleBadge loc={loc} />
        </div>
      </div>
      <p className="dm-stage-note">{v.note}</p>
      <div className="dm-stage-body">
        <div className="dm-video">
          <video
            className="dm-video-el dm-video-wide"
            controls
            playsInline
            preload="none"
            poster={`${VIDEO_BASE}-16x9.webp`}
            aria-label={v.alt}
            width={1280}
            height={720}
          >
            <source src={`${VIDEO_BASE}-16x9.mp4`} type="video/mp4" />
          </video>
          <video
            className="dm-video-el dm-video-tall"
            controls
            playsInline
            preload="none"
            poster={`${VIDEO_BASE}-9x16.webp`}
            aria-label={v.alt}
            width={720}
            height={1280}
          >
            <source src={`${VIDEO_BASE}-9x16.mp4`} type="video/mp4" />
          </video>
        </div>
        <ol className="dm-chapters" aria-label={loc === "es" ? "Capítulos del video" : "Video chapters"}>
          {v.chapters.map(([time, label]) => (
            <li key={time}><time>{time}</time><span>{label}</span></li>
          ))}
        </ol>
        <p className="dm-video-credit">{v.credit}</p>
      </div>
    </section>
  );
}
