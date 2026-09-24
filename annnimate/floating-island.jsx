'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './morphing-island.css'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, CustomEase, ScrollTrigger)
  if (!CustomEase.get('annnimate')) {
    CustomEase.create('annnimate', 'M0,0 C0.3,0.9 0.1,1 1,1')
  }
  if (!CustomEase.get('annnimateInOut')) {
    CustomEase.create('annnimateInOut', 'M0,0 C0.7,0 0.16,1 1,1')
  }
}

// Three fixed-size states, one pill. See morphing-island.js for the full
// design note - this port mirrors that behavior with refs instead of
// querySelector and contextSafe instead of raw addEventListener.
const STATE_ORDER = ['idle', 'list', 'detail']
const STATE_GEO = {
  idle: { w: 176, h: 40, r: 20 },
  list: { w: 248, h: 180, r: 24 },
  detail: { w: 340, h: 184, r: 24 },
}
const STATE_GEO_MOBILE = {
  idle: { w: 160, h: 38, r: 19 },
  list: { w: 232, h: 176, r: 24 },
  detail: { w: 300, h: 200, r: 24 },
}
const OVERSHOOT_PX_PER_BOUNCE = 14
const COLLAPSE_OVERSHOOT_MULT = 0.6
const ELASTIC_PERIOD_MIN = 0.42
const ELASTIC_PERIOD_MAX = 1.2
const COLLAPSE_DUR_MULT = 0.85
const TRANSITIONS = {
  'idle->list': {
    grow: true,
    exitScale: 1.16,
    exitScaleX: 1.16,
    exitY: -3,
    enterScale: 0.92,
    enterY: 6,
  },
  'list->detail': {
    grow: true,
    exitScale: 1.1,
    exitScaleX: 1.1,
    exitY: -3,
    enterScale: 0.94,
    enterY: 5,
  },
  'idle->detail': {
    grow: true,
    exitScale: 1.2,
    exitScaleX: 1.2,
    exitY: -4,
    enterScale: 0.9,
    enterY: 6,
  },
  'detail->list': {
    grow: false,
    exitScale: 0.9,
    exitScaleX: 0.9,
    exitY: 3,
    enterScale: 0.96,
    enterY: -3,
  },
  'list->idle': {
    grow: false,
    exitScale: 0.8,
    exitScaleX: 0.7,
    exitY: 4,
    enterScale: 0.9,
    enterY: -3,
  },
  'detail->idle': {
    grow: false,
    exitScale: 0.72,
    exitScaleX: 0.6,
    exitY: 5,
    enterScale: 0.9,
    enterY: -3,
  },
}
const LABEL_ROLL_DUR = 0.5
const MARK_TRAVEL_DUR = 0.5
const MARK_SIZE = 6
const REDUCED_FADE_DUR = 0.15

const DISABLE_BREAKPOINTS = {
  mobile: '(max-width: 479px)',
  landscape: '(orientation: landscape) and (max-width: 767px)',
  tablet: '(max-width: 991px)',
  desktop: '(min-width: 992px)',
}

const DEFAULT_SECTIONS = [
  {
    name: 'Run',
    copy: 'Built for the tempo session. A lighter upper, a stiffer plate and a heel that stays out of the way.',
    image: 'https://annnimate.b-cdn.net/preview-assets/vanta/hero_run_01.jpg',
    alt: 'Runner mid-stride in a shaft of light',
  },
  {
    name: 'Track',
    copy: 'Four hundred metres, measured to the centimetre. Spikes tuned for the bend, not the straight.',
    image: 'https://annnimate.b-cdn.net/preview-assets/vanta/environment_track_01.jpg',
    alt: 'Curve of a red running track',
  },
  {
    name: 'Velodrome',
    copy: 'Forty-two degrees of banking and no brakes. Everything here is about holding a line.',
    image: 'https://annnimate.b-cdn.net/preview-assets/vanta/environment_velodrome_01.jpg',
    alt: 'Banked wooden velodrome track',
  },
]

/**
 * MorphingIsland Component
 * A sticky island that always names the section you are in. Click it and it
 * grows into the section list, pick one and it grows again into a short
 * description with a scroll-to link, then settles back down.
 *
 * @param {string} [className=''] - Additional CSS classes for the wrapper
 * @param {Array<{name:string,copy:string,image:string,alt?:string}>} [sections] - The sections the island tracks
 * @param {number} [duration=0.65] - How long the pill takes to grow between states (0.4-1.1s)
 * @param {number} [bounce=0.6] - Elastic overshoot amount on growing transitions (0.2-1.2)
 * @param {number} [blur=3] - Blur on the outgoing view while it crossfades out (0-4px)
 * @param {string} [disable=''] - Comma-separated viewport names to disable on: desktop, tablet, landscape, mobile
 * @param {function} [onStateChange] - Called with (state, sectionIndex) whenever the pill lands on a new state
 */
const MorphingIsland = forwardRef(function MorphingIsland(
  {
    className = '',
    sections = DEFAULT_SECTIONS,
    duration = 0.65,
    bounce = 0.6,
    blur = 3,
    disable = '',
    onStateChange,
  },
  ref,
) {
  const containerRef = useRef(null)
  const pillRef = useRef(null)
  const viewRefs = useRef({ idle: null, list: null, detail: null })
  const toggleRef = useRef(null)
  const idleIndexColRef = useRef(null)
  const idleNameColRef = useRef(null)
  const rowRefs = useRef([])
  const markRef = useRef(null)
  const closeBtnRef = useRef(null)
  const backBtnRef = useRef(null)
  const goBtnRef = useRef(null)
  const detailIndexRef = useRef(null)
  const detailNameRef = useRef(null)
  const detailCopyRef = useRef(null)
  const sectionRefs = useRef([])
  const liveRegionRef = useRef(null)

  const stateRef = useRef('idle')
  const currentRef = useRef(0)
  const detailForRef = useRef(0)
  const tlRef = useRef(null)
  const markTlRef = useRef(null)
  const reducedMotionRef = useRef(false)
  const triggersRef = useRef([])
  const disabledRef = useRef(false)

  const blurClamped = Math.min(4, Math.max(0, blur))
  const sectionData = sections.map((s, i) => ({
    index: pad(i + 1),
    name: s.name,
    copy: s.copy || '',
  }))

  function pad(n) {
    return n < 10 ? '0' + n : String(n)
  }

  function isDisabledOnViewport() {
    if (!disable) return false
    return disable.split(',').some((v) => {
      const q = DISABLE_BREAKPOINTS[v.trim()]
      return q && window.matchMedia(q).matches
    })
  }

  function geo(key) {
    const mobile = window.matchMedia('(max-width: 479px)').matches
    return (mobile ? STATE_GEO_MOBILE : STATE_GEO)[key]
  }

  // The detail's height follows its paragraph: measure the view at auto
  // height for the section it currently shows, then lock it back.
  function measureDetail() {
    const g = geo('detail')
    const el = viewRefs.current.detail
    if (!el) return
    gsap.set(el, { width: g.w, height: 'auto', bottom: 'auto' })
    g.h = Math.max(96, Math.ceil(el.offsetHeight))
    gsap.set(el, { height: g.h, bottom: 0 })
  }

  function applyViewSizes() {
    STATE_ORDER.forEach((k) => {
      const g = geo(k)
      const el = viewRefs.current[k]
      if (el) gsap.set(el, { width: g.w, height: g.h })
    })
  }

  function syncPillGeo() {
    if (tlRef.current && tlRef.current.isActive()) return
    const g = geo(stateRef.current)
    gsap.set(pillRef.current, { width: g.w, height: g.h, borderRadius: g.r })
  }

  // elastic.out(1, p) first overshoots by roughly 2^(-5p) of the tweened
  // distance, so solve p for the pixel overshoot we want on this morph.
  function elasticFor(fromGeo, toGeo, mult) {
    const delta = Math.max(Math.abs(toGeo.w - fromGeo.w), Math.abs(toGeo.h - fromGeo.h), 1)
    const wanted = Math.max(0.5, bounce * OVERSHOOT_PX_PER_BOUNCE * (mult || 1))
    const fraction = Math.min(0.4, Math.max(0.01, wanted / delta))
    const period = Math.min(
      ELASTIC_PERIOD_MAX,
      Math.max(ELASTIC_PERIOD_MIN, -Math.log2(fraction) / 5),
    )
    return 'elastic.out(1,' + period.toFixed(3) + ')'
  }

  function announce(text) {
    if (liveRegionRef.current) liveRegionRef.current.textContent = text
  }

  function markActiveRow() {
    rowRefs.current.forEach((row, i) => {
      if (!row) return
      row.classList.toggle('is-active', i === currentRef.current)
      row.setAttribute('aria-current', i === currentRef.current ? 'true' : 'false')
    })
    placeMark(stateRef.current === 'list')
  }

  // The dot is one element; while the list is open a section change slides
  // it to the new row, stretching a touch through the travel.
  function placeMark(animate) {
    const row = rowRefs.current[currentRef.current]
    const mark = markRef.current
    if (!mark || !row) return
    const y = row.offsetTop + row.offsetHeight / 2 - MARK_SIZE / 2
    if (markTlRef.current) markTlRef.current.kill()
    if (!animate || reducedMotionRef.current) {
      gsap.set(mark, { y, scaleX: 1, scaleY: 1 })
      return
    }
    const markTl = gsap.timeline()
    markTlRef.current = markTl
    markTl.to(
      mark,
      {
        y,
        duration: MARK_TRAVEL_DUR,
        ease: 'annnimateInOut',
        force3D: true,
        data: { label: 'Dot slides to the current section' },
      },
      0,
    )
    // explicit return to 1 (not yoyo): a retarget mid-stretch would
    // otherwise yoyo back to the stretched value it started from
    markTl.to(
      mark,
      {
        scaleY: 1.7,
        scaleX: 0.8,
        duration: MARK_TRAVEL_DUR * 0.5,
        ease: 'power1.inOut',
        force3D: true,
        data: { label: 'Dot stretches through the travel' },
      },
      0,
    )
    markTl.to(
      mark,
      {
        scaleY: 1,
        scaleX: 1,
        duration: MARK_TRAVEL_DUR * 0.5,
        ease: 'power1.inOut',
        force3D: true,
        data: { label: 'Dot settles round' },
      },
      MARK_TRAVEL_DUR * 0.5,
    )
  }

  function writeDetail(i) {
    const d = sectionData[i]
    if (!d) return
    detailForRef.current = i
    if (detailIndexRef.current) detailIndexRef.current.textContent = d.index
    if (detailNameRef.current) detailNameRef.current.textContent = d.name
    if (detailCopyRef.current) detailCopyRef.current.textContent = d.copy
    measureDetail()
  }

  // The strip's position is a ratio of its index, never a measurement.
  function columnOffset(i) {
    return (-i * 100) / sectionData.length
  }

  function writeIdle(i) {
    if (!sectionData[i]) return
    gsap.set([idleIndexColRef.current, idleNameColRef.current], {
      yPercent: columnOffset(i),
      overwrite: true,
    })
  }

  // Idle label follows the scroll like an odometer: one tween of the strip
  // to the section's slot. A change mid-roll simply retargets it (overwrite).
  function rollIdleLabel(i) {
    if (!sectionData[i]) return
    if (reducedMotionRef.current) {
      writeIdle(i)
      return
    }
    gsap.to([idleIndexColRef.current, idleNameColRef.current], {
      yPercent: columnOffset(i),
      duration: LABEL_ROLL_DUR,
      ease: 'annnimate',
      force3D: true,
      overwrite: true,
      data: { label: 'Section label rolls to the current section' },
    })
  }

  // Every morph is authored onto a PARENT timeline at offset `at`, so the
  // click path (one morph, fresh timeline) and the demo pass (the whole
  // cycle on one master) share the same code.
  function morphTo(fromKey, toKey, parent, at) {
    if (fromKey === toKey) return
    const t = TRANSITIONS[fromKey + '->' + toKey] || TRANSITIONS['idle->list']
    const targetGeo = geo(toKey)
    const outEl = viewRefs.current[fromKey]
    const inEl = viewRefs.current[toKey]
    const t0 = at + 0.01
    const rows = rowRefs.current.filter(Boolean)
    const detailCopyEl = detailCopyRef.current

    parent.call(
      () => {
        STATE_ORDER.forEach((k) => {
          if (k !== fromKey && k !== toKey)
            gsap.set(viewRefs.current[k], { opacity: 0, pointerEvents: 'none' })
        })
        outEl.style.filter = 'none'
        inEl.style.filter = 'none'
        outEl.style.pointerEvents = 'none'
        inEl.style.pointerEvents = 'auto'
        stateRef.current = toKey
        if (toggleRef.current)
          toggleRef.current.setAttribute('aria-expanded', toKey === 'idle' ? 'false' : 'true')
        if (containerRef.current) {
          containerRef.current.dispatchEvent(
            new CustomEvent('anm-morphing-island-change', {
              detail: {
                state: toKey,
                section: toKey === 'detail' ? detailForRef.current : currentRef.current,
              },
            }),
          )
        }
        onStateChange?.(toKey, toKey === 'detail' ? detailForRef.current : currentRef.current)
        const activeSection = sectionData[detailForRef.current]
        announce(
          toKey === 'idle'
            ? 'Sections closed'
            : toKey === 'list'
              ? 'Sections open'
              : activeSection
                ? activeSection.name + ' details'
                : '',
        )
      },
      null,
      at,
    )

    if (reducedMotionRef.current) {
      parent.set(
        pillRef.current,
        { width: targetGeo.w, height: targetGeo.h, borderRadius: targetGeo.r },
        at,
      )
      parent.set(inEl, { opacity: 0, scale: 1, y: 0 }, at)
      parent.to(
        outEl,
        {
          opacity: 0,
          duration: REDUCED_FADE_DUR,
          ease: 'power1.out',
          data: { label: 'Outgoing view fades (reduced motion)' },
        },
        t0,
      )
      parent.to(
        inEl,
        {
          opacity: 1,
          duration: REDUCED_FADE_DUR,
          ease: 'power1.out',
          data: { label: 'Incoming view fades in (reduced motion)' },
        },
        t0,
      )
      return
    }

    let morphEase
    let morphDur
    if (t.grow) {
      morphEase = elasticFor(geo(fromKey), targetGeo)
      morphDur = duration
    } else {
      morphEase = elasticFor(geo(fromKey), targetGeo, COLLAPSE_OVERSHOOT_MULT)
      morphDur = duration * COLLAPSE_DUR_MULT
    }
    const outProxy = { b: 0 }

    parent.set(inEl, { opacity: 0, scale: t.enterScale, y: t.enterY }, at)

    parent.to(
      pillRef.current,
      {
        width: targetGeo.w,
        height: targetGeo.h,
        borderRadius: targetGeo.r,
        duration: morphDur,
        ease: morphEase,
        force3D: true,
        data: { label: t.grow ? 'Pill grows to the ' + toKey : 'Pill settles back to ' + toKey },
      },
      t0,
    )

    // The outgoing view plays the "duplicate" role: it stays visible on top
    // while the incoming view settles beneath it. Blur is driven through a
    // proxy object, never a raw CSS filter tween, and capped at the blur prop.
    parent.to(
      outEl,
      {
        opacity: 0,
        scale: t.exitScale,
        scaleX: t.exitScaleX,
        y: t.exitY,
        duration: morphDur * 0.32,
        ease: 'annnimate',
        force3D: true,
        data: { label: 'Outgoing view scales and fades' },
      },
      t0,
    )
    parent.to(
      outProxy,
      {
        b: blurClamped,
        duration: morphDur * 0.28,
        ease: 'power1.in',
        onUpdate: () => {
          outEl.style.filter = 'blur(' + outProxy.b.toFixed(2) + 'px)'
        },
        data: { label: 'Outgoing view blurs' },
      },
      t0,
    )

    parent.to(
      inEl,
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: morphDur,
        ease: morphEase,
        force3D: true,
        data: { label: 'Incoming view scales in with the pill' },
      },
      t0,
    )

    // delayed fromTo does not immediateRender - park first
    if (toKey === 'list' && rows.length) {
      parent.set(rows, { opacity: 0, y: 8 }, at)
      parent.fromTo(
        rows,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.045,
          ease: 'annnimate',
          force3D: true,
          data: { label: 'Section rows cascade in' },
        },
        t0 + 0.06,
      )
    }

    if (toKey === 'detail' && detailCopyEl) {
      parent.set(detailCopyEl, { opacity: 0, y: 6 }, at)
      parent.fromTo(
        detailCopyEl,
        { opacity: 0, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'annnimate',
          force3D: true,
          data: { label: 'Section paragraph rises in' },
        },
        t0 + 0.08,
      )
    }
  }

  function freshTimeline() {
    const targets = [
      pillRef.current,
      ...Object.values(viewRefs.current),
      ...rowRefs.current.filter(Boolean),
    ]
    if (detailCopyRef.current) targets.push(detailCopyRef.current)
    gsap.killTweensOf(targets.filter(Boolean))
    if (tlRef.current) tlRef.current.kill()
    const tl = gsap.timeline()
    tlRef.current = tl
    return tl
  }

  const { contextSafe } = useGSAP({ scope: containerRef })

  const setCurrent = contextSafe((i) => {
    if (disabledRef.current) return
    if (i === currentRef.current) return
    currentRef.current = i
    markActiveRow()
    if (stateRef.current === 'idle') rollIdleLabel(i)
    else writeIdle(i)
  })

  const openList = contextSafe(() => {
    if (disabledRef.current) return
    if (stateRef.current === 'list') return
    markActiveRow()
    placeMark(false)
    const tl = freshTimeline()
    morphTo(stateRef.current, 'list', tl, 0)
    tl.call(
      () => {
        const row = rowRefs.current[currentRef.current]
        if (row && document.hasFocus()) row.focus({ preventScroll: true })
      },
      null,
      duration * 0.5,
    )
  })

  const openDetail = contextSafe((i) => {
    if (disabledRef.current) return
    writeDetail(i)
    if (stateRef.current === 'detail') {
      // already open on another section - swap the copy in place
      gsap.fromTo(
        detailCopyRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'annnimate', force3D: true },
      )
      return
    }
    const tl = freshTimeline()
    morphTo(stateRef.current, 'detail', tl, 0)
    tl.call(
      () => {
        if (goBtnRef.current && document.hasFocus()) goBtnRef.current.focus({ preventScroll: true })
      },
      null,
      duration * 0.5,
    )
  })

  const closeToIdle = contextSafe((focusToggle) => {
    if (disabledRef.current) return
    if (stateRef.current === 'idle') return
    writeIdle(currentRef.current)
    const tl = freshTimeline()
    morphTo(stateRef.current, 'idle', tl, 0)
    if (focusToggle) {
      tl.call(
        () => {
          if (toggleRef.current && document.hasFocus())
            toggleRef.current.focus({ preventScroll: true })
        },
        null,
        duration * 0.5,
      )
    }
  })

  const handleBack = contextSafe(() => {
    if (disabledRef.current) return
    if (stateRef.current !== 'detail') return
    const tl = freshTimeline()
    morphTo('detail', 'list', tl, 0)
    tl.call(
      () => {
        const row = rowRefs.current[detailForRef.current]
        if (row && document.hasFocus()) row.focus({ preventScroll: true })
      },
      null,
      duration * 0.5,
    )
  })

  function scrollToSection(i) {
    const d = sectionData[i]
    const el = sectionRefs.current[i]
    if (!d || !el) return
    setCurrent(i)
    el.scrollIntoView({ behavior: reducedMotionRef.current ? 'auto' : 'smooth', block: 'start' })
  }

  const handleGo = contextSafe(() => {
    if (disabledRef.current) return
    const target = detailForRef.current
    closeToIdle(false)
    scrollToSection(target)
  })

  // Timeline inspector demo (ADR-0011): idle -> list -> detail -> idle on
  // one master, ending where the demo starts (closed, no scroll).
  const demo = contextSafe(() => {
    if (disabledRef.current) return null
    if (tlRef.current && tlRef.current.isActive()) return null
    if (stateRef.current !== 'idle') return null
    writeDetail(currentRef.current)
    markActiveRow()
    const master = freshTimeline()
    const gap = duration + 0.5
    morphTo('idle', 'list', master, 0)
    morphTo('list', 'detail', master, gap)
    morphTo('detail', 'idle', master, gap * 2)
    return master
  })

  useImperativeHandle(ref, () => ({
    open: () => openList(),
    close: () => closeToIdle(false),
    show: (i) => openDetail(i),
    demo: () => demo(),
  }))

  useGSAP(
    () => {
      disabledRef.current = isDisabledOnViewport()
      if (disabledRef.current) return undefined

      stateRef.current = 'idle'
      currentRef.current = 0
      detailForRef.current = 0

      applyViewSizes()
      syncPillGeo()
      STATE_ORDER.forEach((k) => {
        const el = viewRefs.current[k]
        if (!el) return
        gsap.set(el, k === stateRef.current ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0 })
        el.style.pointerEvents = k === stateRef.current ? 'auto' : 'none'
      })
      writeIdle(currentRef.current)
      writeDetail(currentRef.current)
      markActiveRow()

      triggersRef.current = sectionData
        .map((d, i) => {
          const el = sectionRefs.current[i]
          if (!el) return null
          return ScrollTrigger.create({
            trigger: el,
            start: 'top 50%',
            end: 'bottom 50%',
            onToggle: (self) => {
              if (self.isActive) setCurrent(i)
            },
          })
        })
        .filter(Boolean)

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => {
        reducedMotionRef.current = true
        return () => {
          reducedMotionRef.current = false
        }
      })

      let resizeTimer = null
      const handleResize = () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          applyViewSizes()
          measureDetail()
          syncPillGeo()
        }, 150)
      }
      window.addEventListener('resize', handleResize)

      const handleVisibility = () => {
        if (document.hidden) gsap.globalTimeline.pause()
        else gsap.globalTimeline.resume()
      }
      document.addEventListener('visibilitychange', handleVisibility)

      // Escape steps back one level: detail -> list -> idle.
      const handleKeydown = (e) => {
        if (e.key !== 'Escape') return
        if (stateRef.current === 'detail') handleBack()
        else if (stateRef.current === 'list') closeToIdle(true)
      }
      document.addEventListener('keydown', handleKeydown)

      const handleOutside = (e) => {
        if (stateRef.current === 'idle') return
        if (pillRef.current && pillRef.current.contains(e.target)) return
        closeToIdle(false)
      }
      document.addEventListener('pointerdown', handleOutside)

      return () => {
        clearTimeout(resizeTimer)
        window.removeEventListener('resize', handleResize)
        document.removeEventListener('visibilitychange', handleVisibility)
        document.removeEventListener('keydown', handleKeydown)
        document.removeEventListener('pointerdown', handleOutside)
        triggersRef.current.forEach((st) => st.kill())
        triggersRef.current = []
        if (tlRef.current) tlRef.current.kill()
        if (markTlRef.current) markTlRef.current.kill()
        gsap.killTweensOf([idleIndexColRef.current, idleNameColRef.current].filter(Boolean))
        mm.revert()
      }
    },
    {
      scope: containerRef,
      dependencies: [sections, duration, bounce, blurClamped, disable],
      revertOnUpdate: true,
    },
  )

  return (
    <div ref={containerRef} className={`mi_wrap ${className}`.trim()} data-anm-morphing-island>
      <div className="mi_dock">
        <div ref={pillRef} className="mi_pill" data-anm-mi-pill>
          <button
            type="button"
            ref={(el) => {
              toggleRef.current = el
              viewRefs.current.idle = el
            }}
            className="mi_view mi_view_idle"
            data-anm-mi-view="idle"
            data-anm-mi-toggle
            aria-expanded="false"
            aria-controls="mi-list"
            aria-label="Sections"
            onClick={openList}
          >
            <span className="mi_idle_index">
              <span ref={idleIndexColRef} className="mi_idle_col" data-anm-mi-index>
                {sectionData.map((d, i) => (
                  <span key={i} className="mi_idle_cell">
                    {d.index}
                  </span>
                ))}
              </span>
            </span>
            <span className="mi_idle_name">
              <span ref={idleNameColRef} className="mi_idle_col" data-anm-mi-name>
                {sectionData.map((d, i) => (
                  <span key={i} className="mi_idle_cell">
                    {d.name}
                  </span>
                ))}
              </span>
            </span>
            <span className="mi_idle_dot" />
          </button>

          <div
            ref={(el) => {
              viewRefs.current.list = el
            }}
            className="mi_view mi_view_list"
            data-anm-mi-view="list"
            id="mi-list"
          >
            <div className="mi_list_head">
              <span className="mi_list_title">Sections</span>
              <button
                type="button"
                ref={closeBtnRef}
                className="mi_text_btn"
                data-anm-mi-close
                onClick={() => closeToIdle(true)}
              >
                Close
              </button>
            </div>
            {sectionData.map((d, i) => (
              <button
                key={i}
                type="button"
                ref={(el) => {
                  rowRefs.current[i] = el
                }}
                className="mi_row"
                data-anm-mi-row
                data-anm-mi-target={i}
                onClick={() => openDetail(i)}
              >
                <span className="mi_row_index">{d.index}</span>
                <span className="mi_row_name">{d.name}</span>
              </button>
            ))}
            <span ref={markRef} className="mi_list_mark" data-anm-mi-mark aria-hidden="true" />
          </div>

          <div
            ref={(el) => {
              viewRefs.current.detail = el
            }}
            className="mi_view mi_view_detail"
            data-anm-mi-view="detail"
          >
            <div className="mi_detail_head">
              <span ref={detailIndexRef} className="mi_detail_index" data-anm-mi-detail-index />
              <span ref={detailNameRef} className="mi_detail_name" data-anm-mi-detail-name />
            </div>
            <p ref={detailCopyRef} className="mi_detail_copy" data-anm-mi-detail-copy />
            <div className="mi_detail_actions">
              <button
                type="button"
                ref={backBtnRef}
                className="mi_text_btn"
                data-anm-mi-back
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                ref={goBtnRef}
                className="mi_text_btn mi_text_btn_primary"
                data-anm-mi-go
                onClick={handleGo}
              >
                Scroll to section
              </button>
            </div>
          </div>
        </div>
        <div
          ref={liveRegionRef}
          className="mi_live"
          data-anm-mi-live
          aria-live="polite"
          role="status"
          aria-atomic="true"
        />
      </div>

      {sections.map((s, i) => (
        <section
          key={i}
          ref={(el) => {
            sectionRefs.current[i] = el
          }}
          className="mi_section"
          data-anm-mi-section
          data-anm-mi-section-name={s.name}
          data-anm-mi-section-copy={s.copy}
        >
          <img
            className="mi_section_img"
            src={s.image}
            alt={s.alt || s.name}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
          <span className="mi_section_index">{pad(i + 1)}</span>
          <h2 className="mi_section_title">{s.name}</h2>
        </section>
      ))}
    </div>
  )
})

export default MorphingIsland
