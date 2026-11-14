import { useEffect, useRef, useState } from "react";
import { FaArrowRight, FaPause, FaPlay } from "react-icons/fa";
import { contributions } from "../data/contributions";

const ContributionRail = ({ onSelect }) => {
  const railRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || isHovered || isFocused || reducedMotion) return;
    const rail = railRef.current;
    let frame;
    let previousTime;
    // Keep fractional progress separately: scrollLeft may round to whole pixels.
    let position = rail.scrollLeft;
    const advance = (time) => {
      if (previousTime !== undefined) {
        position += Math.min(time - previousTime, 50) * 0.028;
        const loopWidth = rail.scrollWidth / 2;
        if (position >= loopWidth) position -= loopWidth;
        rail.scrollLeft = position;
      }
      previousTime = time;
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [isPaused, isHovered, isFocused, reducedMotion]);

  return (
    <section aria-labelledby="contribution-heading" className="border-b border-[#dce9b8] bg-[#f1f7df] py-3 sm:py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h2 id="contribution-heading" className="text-sm font-extrabold text-[#34500e] sm:text-base">Your gift. Their next step.</h2>
            <p className="text-xs text-[#4d631e] sm:text-sm">Click any card to donate · Swipe or scroll to explore</p>
          </div>
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setIsPaused((paused) => !paused)}
              aria-label={isPaused ? "Play contribution rail" : "Pause contribution rail"}
              aria-pressed={isPaused}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#b9cd74] bg-white text-[#59701a] transition hover:bg-[#e3efc3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#59701a]"
            >
              {isPaused ? <FaPlay aria-hidden="true" /> : <FaPause aria-hidden="true" />}
            </button>
          )}
        </div>
        <div
          ref={railRef}
          role="region"
          aria-label="Choose a contribution"
          tabIndex={0}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setIsFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false);
          }}
          onPointerDown={() => setIsPaused(true)}
          onWheel={() => setIsPaused(true)}
          className="flex overflow-x-auto overscroll-x-contain rounded-xl pb-2 focus-visible:outline-2 focus-visible:outline-[#59701a]"
        >
          {[false, true].map((duplicate) => (
            <ul key={String(duplicate)} aria-hidden={duplicate || undefined} className="flex shrink-0 gap-3 pr-3">
              {contributions.map((contribution) => (
                <li key={contribution.title} className="flex w-52 shrink-0 sm:w-60">
                  <button
                    type="button"
                    tabIndex={duplicate ? -1 : 0}
                    onClick={() => onSelect(contribution)}
                    aria-label={`Donate ₹${contribution.amount.toLocaleString("en-IN")} for ${contribution.title}, ${contribution.detail}`}
                    className="group flex w-full flex-col rounded-xl border border-[#cbdc99] bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#71892a] hover:bg-[#fcfef5] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#59701a]"
                  >
                    <span className="flex items-center justify-between gap-2 text-xl font-black text-[#59701a] sm:text-2xl">
                      ₹{contribution.amount.toLocaleString("en-IN")}<FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                    <span className="mt-1 text-sm font-bold leading-5 text-slate-800">{contribution.title}</span>
                    <span className="mt-1 text-xs leading-4 text-slate-500">{contribution.detail}</span>
                  </button>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContributionRail;
