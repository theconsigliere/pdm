# Page transition

`Component.tsx` contains the overlay markup. `animations/animatePageTransition.ts` owns the GSAP timeline through `useAnimations`.

`RouteTransition.tsx` is mounted in the frontend layout and watches `usePathname()`. After the initial load, each pathname change (including client navigation and browser back/forward) runs the reveal animation. Initial loading is handled by the preloader. Query-only and hash-only changes do not trigger a transition.

`Component.tsx` remains a controlled building block for future transitions that cover the page before navigating; it does not intercept links or navigate automatically.

1. Set `phase="cover"` before navigation.
2. Use `onCovered` to navigate once the overlay covers the current page.
3. Once the destination content is ready, set `phase="reveal"`.
4. Use `onRevealed` to run entrance methods on destination components.

`transitionKey` can identify a navigation and rebuild the timeline even when the phase stays the same. Keep the overlay mounted in a persistent client parent. A new phase cancels the previous timeline, so stale completion callbacks do not navigate or trigger old component animations.

The preloader runs separately on initial load. Its `usePreloaderReady()` context becomes true after the loading overlay exits; EntryHeader uses that value to start its entrance timeline.
