'use client'

import { useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { SplitText } from 'gsap/SplitText'
import './dock-footer.css'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase, SplitText)
  CustomEase.create('annnimate', 'M0,0 C0.3,0.9 0.1,1 1,1')
  CustomEase.create('annnimateInOut', 'M0,0 C0.7,0 0.16,1 1,1')
}

const MORPH_EASE_OPEN = 'back.out(1.2)'
const MORPH_EASE_CLOSE = 'annnimateInOut'
const CLOSE_TIME_SCALE = 1.65
const PANEL_RADIUS_PX = 28
const PILL_RADIUS_PX = 999
const PILL_H_PX = 52
const PILL_W_PX = 170
const REVEAL_AT = 0.85
const REVEAL_IN_DUR = 0.7
const REVEAL_OUT_DUR = 0.5
const REVEAL_STAGGER = 0.04
const REVEAL_COL_STAGGER = 0.02

const LOGO_PARK_Y = 125
const REVEAL_OUT_AT = 0.4
const RESIZE_DEBOUNCE = 150
const AUTO_OPEN_AT = 0.995
const AUTO_CLOSE_AT = 0.9
const LINK_RISE_AT = 0.35
const LINK_RISE_DUR = 0.55
const LINK_STAGGER = 0.045
const ROLL_DUR = 0.55
const ROLL_STAGGER = 0.02

const BREAKPOINTS = {
  mobile: '(max-width: 479px)',
  landscape: '(orientation: landscape) and (max-width: 767px)',
  tablet: '(max-width: 991px)',
  desktop: '(min-width: 992px)',
}

function buildChars(host) {
  const word = host.textContent
  host.textContent = ''
  const inners = []
  word.split('').forEach((ch) => {
    if (ch === ' ') {
      const sp = document.createElement('span')
      sp.className = 'df_char_space'
      sp.textContent = ' '
      host.appendChild(sp)
      return
    }
    const mask = document.createElement('span')
    mask.className = 'df_char'
    const inner = document.createElement('span')
    inner.className = 'df_char_inner'
    const face = document.createElement('span')
    face.className = 'df_char_face'
    face.textContent = ch
    const next = document.createElement('span')
    next.className = 'df_char_face df_char_face_next'
    next.textContent = ch
    next.setAttribute('aria-hidden', 'true')
    inner.appendChild(face)
    inner.appendChild(next)
    mask.appendChild(inner)
    host.appendChild(mask)
    inners.push(inner)
  })
  return inners
}

export default function DockFooter({
  className = '',
  parallax = 45,
  panelWidth = 400,
  morphDuration = 0.6,
  disable = '',
}) {
  const containerRef = useRef(null)
  const innerRef = useRef(null)
  const dockRef = useRef(null)
  const pillRef = useRef(null)
  const panelRef = useRef(null)
  const panelFootRef = useRef(null)
  const openBtnRef = useRef(null)
  const closeBtnRef = useRef(null)
  const topBtnRef = useRef(null)

  const revealInnerRefs = useRef([])

  const navLinkRefs = useRef([])

  const linkCharsRef = useRef([])
  const linkWordsRef = useRef([])

  const headlineRef = useRef(null)
  const bodyRef = useRef(null)
  const splitsRef = useRef([])
  const headlineLinesRef = useRef([])
  const bodyLinesRef = useRef([])
  const revealTargetsRef = useRef([])
  const revealBrandTargetsRef = useRef([])
  const revealColTargetsRef = useRef([])

  const panelGeoRef = useRef({ w: PILL_W_PX, h: PILL_H_PX, rad: PILL_RADIUS_PX })
  const pillWRef = useRef(PILL_W_PX)
  const pillHRef = useRef(PILL_H_PX)
  const openPanelHRef = useRef(0)
  const isOpenRef = useRef(false)
  const morphTlRef = useRef(null)
  const closeTlRef = useRef(null)
  const scrollTlRef = useRef(null)
  const demoTlRef = useRef(null)
  const resizeTimerRef = useRef(null)
  const lastWRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 0)
  const isMobileRef = useRef(false)
  const revealShownRef = useRef(false)
  const reducedMotionRef = useRef(false)
  const autoSuppressedRef = useRef(false)

  const isDisabled = useCallback(() => {
    if (!disable) return false
    return disable
      .toLowerCase()
      .split(',')
      .some((k) => {
        const q = BREAKPOINTS[k.trim()]
        return q && window.matchMedia(q).matches
      })
  }, [disable])

  const effectivePanelWidth = useCallback(() => {
    if (isMobileRef.current) {
      return Math.max(200, window.innerWidth - 40)
    }

    if (window.innerHeight <= 720) {
      return Math.min(panelWidth, 330)
    }
    return panelWidth
  }, [panelWidth])

  const measurePanelHeight = useCallback(() => {
    const dock = dockRef.current
    const panel = panelRef.current
    if (!dock || !panel) return PILL_H_PX
    const prevW = dock.style.getPropertyValue('--df-dock-w')
    dock.style.setProperty('--df-dock-w', effectivePanelWidth() + 'px')
    const h = panel.offsetHeight
    dock.style.setProperty('--df-dock-w', prevW)
    return Math.max(h, pillHRef.current)
  }, [effectivePanelWidth])

  const applyGeo = useCallback(() => {
    const dock = dockRef.current
    if (!dock) return
    const geo = panelGeoRef.current
    dock.style.setProperty('--df-dock-w', geo.w + 'px')
    dock.style.setProperty('--df-dock-h', geo.h + 'px')
    dock.style.setProperty('--df-dock-rad', geo.rad + 'px')
  }, [])

  const buildRevealTargets = useCallback(() => {
    const inners = revealInnerRefs.current.filter(Boolean)
    const brandMarkInner = inners[0]
    const restInners = inners.slice(1)
    revealBrandTargetsRef.current = [
      brandMarkInner,
      ...headlineLinesRef.current,
      ...bodyLinesRef.current,
    ].filter(Boolean)
    revealColTargetsRef.current = restInners.filter(Boolean)
    revealTargetsRef.current = [...revealBrandTargetsRef.current, ...revealColTargetsRef.current]
  }, [])

  const setupSplits = useCallback(() => {
    splitsRef.current.forEach((s) => s.revert())
    splitsRef.current = []
    const els = [headlineRef.current, bodyRef.current].filter(Boolean)
    if (!els.length) return
    const linesByEl = new Map()
    els.forEach((el) => {
      const s = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'df_split_line' })
      gsap.set(s.masks, { overflowX: 'visible', overflowY: 'clip' })
      splitsRef.current.push(s)
      linesByEl.set(el, s.lines)
    })
    headlineLinesRef.current = linesByEl.get(headlineRef.current) || []
    bodyLinesRef.current = linesByEl.get(bodyRef.current) || []
    buildRevealTargets()
    const parked = revealShownRef.current || reducedMotionRef.current ? 0 : 110
    splitsRef.current.forEach((s) => {
      gsap.set(s.lines, { yPercent: parked, y: 0, force3D: true })
    })
    gsap.set(els, { autoAlpha: 1 })
  }, [buildRevealTargets])

  const scrollToTop = useCallback(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { duration: 1.2 })
    } else {
      const scroller = document.querySelector('[data-transition-content]')
      if (scroller && scroller.scrollHeight > scroller.clientHeight) {
        scroller.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }, [])

  const buildEntranceScrub = useCallback(() => {
    const inner = innerRef.current
    const container = containerRef.current

    if (isDisabled()) {
      gsap.set(inner, { yPercent: 0, y: 0 })
      gsap.set(revealTargetsRef.current, { yPercent: 0, y: 0 })
      return
    }

    if (scrollTlRef.current) scrollTlRef.current.kill()

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        invalidateOnRefresh: true,
      },
      data: { label: 'Footer parallax reveal scrub' },
    })

    tl.fromTo(
      inner,
      { yPercent: -Math.abs(parallax), y: 0, force3D: true },
      {
        yPercent: 0,
        y: 0,
        force3D: true,
        ease: 'none',
        duration: 1,
        data: { label: 'Inner content catches up as section enters' },
      },
      0,
    )

    scrollTlRef.current = tl

    tl.eventCallback('onUpdate', function () {
      const p = tl.progress()

      if (!revealShownRef.current && p >= REVEAL_AT) {
        revealShownRef.current = true
        gsap.to(revealBrandTargetsRef.current, {
          yPercent: 0,
          y: 0,
          duration: REVEAL_IN_DUR,
          ease: 'annnimate',
          stagger: REVEAL_STAGGER,
          overwrite: 'auto',
          force3D: true,
          data: { label: 'Content rises through its masks' },
        })
        gsap.to(revealColTargetsRef.current, {
          yPercent: 0,
          y: 0,
          duration: REVEAL_IN_DUR,
          ease: 'annnimate',
          stagger: REVEAL_COL_STAGGER,
          delay: revealBrandTargetsRef.current.length * REVEAL_STAGGER,
          overwrite: 'auto',
          force3D: true,
          data: { label: 'Link columns cascade in' },
        })
      } else if (revealShownRef.current && p < REVEAL_OUT_AT) {
        revealShownRef.current = false
        gsap.killTweensOf(revealColTargetsRef.current)
        gsap.to(revealTargetsRef.current, {
          yPercent: (i, t) => (t === revealInnerRefs.current[0] ? LOGO_PARK_Y : 110),
          y: 0,
          duration: REVEAL_OUT_DUR,
          ease: 'annnimateInOut',
          overwrite: 'auto',
          force3D: true,
          data: { label: 'Content slides back under its masks' },
        })
      }

      if (p >= AUTO_OPEN_AT && !isOpenRef.current && !autoSuppressedRef.current) {
        open()
      }
      if (p < AUTO_CLOSE_AT) {
        autoSuppressedRef.current = false
        if (isOpenRef.current) close()
      }
    })
  }, [parallax, isDisabled])

  const buildDemoTimeline = useCallback(() => {
    if (demoTlRef.current) demoTlRef.current.kill()

    const h = measurePanelHeight()
    const w = effectivePanelWidth()
    const geo = panelGeoRef.current
    const links = navLinkRefs.current.filter(Boolean)

    const tl = gsap.timeline({ paused: true, defaults: { force3D: true } })

    tl.call(
      function () {
        if (isOpenRef.current) {
          isOpenRef.current = false
          if (panelRef.current) panelRef.current.setAttribute('aria-hidden', 'true')
          if (openBtnRef.current) {
            openBtnRef.current.setAttribute('aria-expanded', 'false')
            openBtnRef.current.setAttribute('aria-label', 'Open quick navigation')
          }
          if (panelRef.current) gsap.set(panelRef.current, { pointerEvents: 'none' })
        }
        gsap.set(geo, { w: pillWRef.current, h: pillHRef.current, rad: pillHRef.current / 2 })
        applyGeo()
        if (pillRef.current) gsap.set(pillRef.current, { autoAlpha: 1 })
        if (panelRef.current)
          gsap.set(panelRef.current, { autoAlpha: 0, visibility: 'hidden', pointerEvents: 'none' })
        if (panelFootRef.current) gsap.set(panelFootRef.current, { autoAlpha: 0 })
        if (links.length) gsap.set(links, { yPercent: 110, y: 0 })
      },
      null,
      0.01,
    )

    tl.to(
      pillRef.current,
      {
        autoAlpha: 0,
        duration: morphDuration * 0.28,
        ease: 'annnimate',
        data: { label: 'Pill content fades out as morph begins' },
      },
      0.3,
    )

    tl.to(
      geo,
      {
        w: w,
        h: h,
        duration: morphDuration,
        ease: MORPH_EASE_OPEN,
        onUpdate: applyGeo,
        data: { label: 'Glass object morphs from pill to panel' },
      },
      0.3,
    )
    tl.to(
      geo,
      {
        rad: PANEL_RADIUS_PX,
        duration: morphDuration,
        ease: 'annnimateInOut',
        data: { label: 'Corners settle into the panel radius' },
      },
      0.3,
    )

    tl.to(
      panelRef.current,
      {
        autoAlpha: 1,
        duration: morphDuration * 0.25,
        ease: 'annnimate',
        data: { label: 'Panel content fades in' },
      },
      0.3 + morphDuration * 0.12,
    )

    if (links.length) {
      tl.fromTo(
        links,
        { yPercent: 110, y: 0 },
        {
          yPercent: 0,
          y: 0,
          duration: LINK_RISE_DUR,
          stagger: LINK_STAGGER,
          ease: 'annnimate',
          force3D: true,
          data: { label: 'Nav links rise through their masks' },
        },
        0.3 + morphDuration * LINK_RISE_AT,
      )
    }

    if (panelFootRef.current) {
      tl.to(
        panelFootRef.current,
        {
          autoAlpha: 1,
          duration: morphDuration * 0.35,
          ease: 'annnimate',
          data: { label: 'Panel footer row appears' },
        },
        0.3 + morphDuration * 0.72,
      )
    }

    tl.to({}, { duration: 1.0 })

    const closeStart = tl.duration()

    tl.to(
      panelRef.current,
      {
        autoAlpha: 0,
        duration: (morphDuration / CLOSE_TIME_SCALE) * 0.4,
        ease: 'annnimateInOut',
        data: { label: 'Panel content fades out on close' },
      },
      closeStart,
    )

    if (links.length) {
      tl.to(
        links,
        {
          yPercent: 110,
          y: 0,
          duration: (morphDuration / CLOSE_TIME_SCALE) * 0.4,
          ease: 'annnimateInOut',
        },
        closeStart,
      )
    }

    tl.to(
      geo,
      {
        w: function () {
          return pillWRef.current
        },
        h: function () {
          return pillHRef.current
        },
        rad: function () {
          return pillHRef.current / 2
        },
        duration: morphDuration / CLOSE_TIME_SCALE,
        ease: MORPH_EASE_CLOSE,
        onUpdate: applyGeo,
        data: { label: 'Glass object snaps back to pill' },
      },
      closeStart,
    )

    tl.to(
      pillRef.current,
      {
        autoAlpha: 1,
        duration: (morphDuration / CLOSE_TIME_SCALE) * 0.3,
        ease: 'annnimateInOut',
        data: { label: 'Pill content reappears' },
      },
      closeStart + (morphDuration / CLOSE_TIME_SCALE) * 0.7,
    )

    demoTlRef.current = tl
  }, [morphDuration, measurePanelHeight, effectivePanelWidth, applyGeo])

  const open = useCallback(() => {
    if (isOpenRef.current) return
    isOpenRef.current = true
    if (panelRef.current) panelRef.current.setAttribute('aria-hidden', 'false')
    if (openBtnRef.current) {
      openBtnRef.current.setAttribute('aria-expanded', 'true')
      openBtnRef.current.setAttribute('aria-label', 'Close quick navigation')
    }
    if (closeTlRef.current) {
      closeTlRef.current.kill()
      closeTlRef.current = null
    }
    if (morphTlRef.current) morphTlRef.current.kill()

    openPanelHRef.current = measurePanelHeight()
    const targetW = effectivePanelWidth()

    const tl = gsap.timeline({ defaults: { force3D: true, overwrite: 'auto' } })

    if (panelRef.current)
      tl.set(panelRef.current, { visibility: 'visible', pointerEvents: 'auto' }, 0)

    tl.to(
      pillRef.current,
      {
        autoAlpha: 0,
        duration: morphDuration * 0.28,
        ease: 'annnimate',
        data: { label: 'Pill content fades out as morph begins' },
      },
      0,
    )

    tl.to(
      panelGeoRef.current,
      {
        w: targetW,
        h: openPanelHRef.current,
        duration: morphDuration,
        ease: MORPH_EASE_OPEN,
        onUpdate: applyGeo,
        data: { label: 'Glass object morphs from pill to panel' },
      },
      0,
    )
    tl.to(
      panelGeoRef.current,
      {
        rad: PANEL_RADIUS_PX,
        duration: morphDuration,
        ease: 'annnimateInOut',
        data: { label: 'Corners settle into the panel radius' },
      },
      0,
    )

    tl.to(
      panelRef.current,
      {
        autoAlpha: 1,
        duration: morphDuration * 0.25,
        ease: 'annnimate',
        data: { label: 'Panel content fades in' },
      },
      morphDuration * 0.12,
    )

    const links = navLinkRefs.current.filter(Boolean)
    if (links.length) {
      tl.to(
        links,
        {
          yPercent: 0,
          y: 0,
          duration: LINK_RISE_DUR,
          stagger: LINK_STAGGER,
          ease: 'annnimate',
          data: { label: 'Nav links rise through their masks' },
        },
        morphDuration * LINK_RISE_AT,
      )
    }

    if (panelFootRef.current) {
      tl.to(
        panelFootRef.current,
        {
          autoAlpha: 1,
          duration: morphDuration * 0.35,
          ease: 'annnimate',
          data: { label: 'Panel footer row appears' },
        },
        morphDuration * 0.72,
      )
    }

    tl.call(
      () => {
        if (isOpenRef.current && document.hasFocus() && closeBtnRef.current)
          closeBtnRef.current.focus()
      },
      null,
      morphDuration * 0.55,
    )

    morphTlRef.current = tl
  }, [measurePanelHeight, effectivePanelWidth, applyGeo, morphDuration])

  const close = useCallback(() => {
    if (!isOpenRef.current) return
    isOpenRef.current = false

    if (scrollTlRef.current && scrollTlRef.current.progress() >= AUTO_OPEN_AT) {
      autoSuppressedRef.current = true
    }
    if (panelRef.current) panelRef.current.setAttribute('aria-hidden', 'true')
    if (openBtnRef.current) {
      openBtnRef.current.setAttribute('aria-expanded', 'false')
      openBtnRef.current.setAttribute('aria-label', 'Open quick navigation')
    }
    if (morphTlRef.current) {
      morphTlRef.current.kill()
      morphTlRef.current = null
    }
    if (closeTlRef.current) closeTlRef.current.kill()

    const closeDur = morphDuration / CLOSE_TIME_SCALE
    const tl = gsap.timeline({ defaults: { force3D: true, overwrite: 'auto' } })

    if (panelRef.current) tl.set(panelRef.current, { pointerEvents: 'none' }, 0)

    tl.to(
      panelRef.current,
      {
        autoAlpha: 0,
        duration: closeDur * 0.4,
        ease: 'annnimateInOut',
        data: { label: 'Panel content fades out on close' },
      },
      0,
    )

    const links = navLinkRefs.current.filter(Boolean)
    if (links.length) {
      tl.to(
        links,
        {
          yPercent: 110,
          y: 0,
          duration: closeDur * 0.4,
          ease: 'annnimateInOut',
        },
        0,
      )
    }
    if (panelFootRef.current) tl.set(panelFootRef.current, { autoAlpha: 0 }, closeDur * 0.4)

    tl.to(
      panelGeoRef.current,
      {
        w: () => pillWRef.current,
        h: () => pillHRef.current,
        rad: () => pillHRef.current / 2,
        duration: closeDur,
        ease: MORPH_EASE_CLOSE,
        onUpdate: applyGeo,
        data: { label: 'Glass object snaps back to pill' },
      },
      0,
    )

    tl.to(
      pillRef.current,
      {
        autoAlpha: 1,
        duration: closeDur * 0.3,
        ease: 'annnimateInOut',
        data: { label: 'Pill content reappears' },
      },
      closeDur * 0.7,
    )

    closeTlRef.current = tl

    if (document.hasFocus() && openBtnRef.current) openBtnRef.current.focus()
  }, [morphDuration, applyGeo])

  const { contextSafe } = useGSAP(
    () => {
      revealInnerRefs.current = Array.from(new Set(revealInnerRefs.current.filter(Boolean)))
      navLinkRefs.current = Array.from(new Set(navLinkRefs.current.filter(Boolean)))

      const dock = dockRef.current
      const inner = innerRef.current
      const revealInners = revealInnerRefs.current
      const navLinks = navLinkRefs.current

      if (!dock || !inner) return

      isMobileRef.current = window.innerWidth <= 760
      lastWRef.current = window.innerWidth

      gsap.set(dock, {
        '--df-dock-w': 'auto',
        '--df-dock-h': 'auto',
        '--df-dock-rad': PILL_RADIUS_PX + 'px',
      })
      pillWRef.current = dock.offsetWidth || PILL_W_PX
      pillHRef.current = dock.offsetHeight || PILL_H_PX

      gsap.set(panelGeoRef.current, {
        w: pillWRef.current,
        h: pillHRef.current,
        rad: pillHRef.current / 2,
      })

      linkWordsRef.current = navLinks.map((l) => l.textContent)
      linkCharsRef.current = navLinks.map((l) => buildChars(l))

      if (navLinks.length) gsap.set(navLinks, { yPercent: 110, y: 0, force3D: true })

      if (panelRef.current)
        gsap.set(panelRef.current, { autoAlpha: 0, visibility: 'hidden', pointerEvents: 'none' })
      if (panelFootRef.current) gsap.set(panelFootRef.current, { autoAlpha: 0 })

      buildRevealTargets()
      if (revealInners.length) gsap.set(revealInners, { yPercent: 110, y: 0, force3D: true })

      if (revealInners[0]) gsap.set(revealInners[0], { yPercent: LOGO_PARK_Y, y: 0, force3D: true })

      if (panelRef.current) panelRef.current.setAttribute('aria-hidden', 'true')
      if (openBtnRef.current) openBtnRef.current.setAttribute('aria-expanded', 'false')

      const splitEls = [headlineRef.current, bodyRef.current].filter(Boolean)
      if (splitEls.length) {
        gsap.set(splitEls, { autoAlpha: 0 })
        document.fonts.ready.then(() => setupSplits())
      }

      buildDemoTimeline()
      buildEntranceScrub()

      gsap.matchMedia().add('(prefers-reduced-motion: reduce)', function () {
        reducedMotionRef.current = true
        if (scrollTlRef.current) {
          scrollTlRef.current.kill()
          scrollTlRef.current = null
        }
        gsap.set(inner, { yPercent: 0, y: 0 })
        gsap.set(revealTargetsRef.current, { yPercent: 0, y: 0 })
        gsap.globalTimeline.timeScale(20)
      })

      return () => {
        if (morphTlRef.current) morphTlRef.current.kill()
        if (closeTlRef.current) closeTlRef.current.kill()
        if (scrollTlRef.current) scrollTlRef.current.kill()
        if (demoTlRef.current) demoTlRef.current.kill()
        splitsRef.current.forEach((s) => s.revert())
        ScrollTrigger.getAll().forEach((st) => st.kill())

        navLinks.forEach((link, i) => {
          if (link && linkWordsRef.current[i] != null) link.textContent = linkWordsRef.current[i]
        })
      }
    },
    { scope: containerRef, dependencies: [parallax, panelWidth, morphDuration, disable] },
  )

  const rollWord = contextSafe((i) => {
    const inners = linkCharsRef.current[i]
    if (!isOpenRef.current || !inners || !inners.length) return
    gsap.killTweensOf(inners)
    gsap.set(inners, { yPercent: 0, y: 0 })
    gsap.to(inners, {
      yPercent: -110,
      y: 0,
      duration: ROLL_DUR,
      ease: 'annnimateInOut',
      stagger: ROLL_STAGGER,
      force3D: true,
      onComplete: () => {
        gsap.set(inners, { yPercent: 0, y: 0 })
      },
    })
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function handleOpenBtn() {
      if (isOpenRef.current) close()
      else open()
    }
    function handleCloseBtn() {
      close()
    }
    function handleTopBtn() {
      scrollToTop()
    }
    function handlePanelFoot(e) {
      e.stopPropagation()
      scrollToTop()
    }
    function handleDocClick(e) {
      if (!isOpenRef.current) return
      if (dockRef.current && !dockRef.current.contains(e.target)) close()
    }
    function handleKeydown(e) {
      if (e.key === 'Escape' && isOpenRef.current) close()
    }
    function handleResize() {
      clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = setTimeout(function () {
        if (window.innerWidth === lastWRef.current) return
        lastWRef.current = window.innerWidth
        isMobileRef.current = window.innerWidth <= 760
        const dock = dockRef.current
        if (!isOpenRef.current && dock) {
          gsap.set(dock, { '--df-dock-w': 'auto', '--df-dock-h': 'auto' })
          pillWRef.current = dock.offsetWidth || PILL_W_PX
          pillHRef.current = dock.offsetHeight || PILL_H_PX
          gsap.set(panelGeoRef.current, {
            w: pillWRef.current,
            h: pillHRef.current,
            rad: pillHRef.current / 2,
          })
        }
        buildDemoTimeline()
        if (isOpenRef.current) {
          openPanelHRef.current = measurePanelHeight()
          const targetW = effectivePanelWidth()
          gsap.set(panelGeoRef.current, {
            w: targetW,
            h: openPanelHRef.current,
            rad: PANEL_RADIUS_PX,
          })
          applyGeo()
        }

        if (splitsRef.current.length) setupSplits()
        buildEntranceScrub()
        ScrollTrigger.refresh()
      }, RESIZE_DEBOUNCE)
    }
    function handleVisibility() {
      if (document.hidden) gsap.globalTimeline.pause()
      else gsap.globalTimeline.resume()
    }

    const openBtn = openBtnRef.current
    const closeBtn = closeBtnRef.current
    const topBtn = topBtnRef.current
    const panelFoot = panelFootRef.current
    const navLinks = navLinkRefs.current
    const linkHandlers = navLinks.map((link, i) => {
      const handler = () => rollWord(i)
      link.addEventListener('mouseenter', handler)
      return handler
    })

    if (openBtn) openBtn.addEventListener('click', handleOpenBtn)
    if (closeBtn) closeBtn.addEventListener('click', handleCloseBtn)
    if (topBtn) topBtn.addEventListener('click', handleTopBtn)
    if (panelFoot) panelFoot.addEventListener('click', handlePanelFoot)
    document.addEventListener('click', handleDocClick)
    document.addEventListener('keydown', handleKeydown)
    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (openBtn) openBtn.removeEventListener('click', handleOpenBtn)
      if (closeBtn) closeBtn.removeEventListener('click', handleCloseBtn)
      if (topBtn) topBtn.removeEventListener('click', handleTopBtn)
      if (panelFoot) panelFoot.removeEventListener('click', handlePanelFoot)
      navLinks.forEach((link, i) => link.removeEventListener('mouseenter', linkHandlers[i]))
      document.removeEventListener('click', handleDocClick)
      document.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
      clearTimeout(resizeTimerRef.current)
    }
  }, [
    open,
    close,
    scrollToTop,
    rollWord,
    buildDemoTimeline,
    buildEntranceScrub,
    setupSplits,
    measurePanelHeight,
    effectivePanelWidth,
    applyGeo,
  ])

  function addRevealInner(el) {
    if (el) revealInnerRefs.current.push(el)
  }
  function addNavLink(el) {
    if (el) navLinkRefs.current.push(el)
  }

  return (
    <footer
      ref={containerRef}
      className={`df_section${className ? ' ' + className : ''}`}
      data-anm-dock-footer
    >
      {}
      <div className="df_bg" aria-hidden="true">
        <img
          className="df_bg_img"
          src="https://annnimate.b-cdn.net/preview-assets/vanta/texture_grass-stripes_03.jpg?width=1920&format=auto"
          alt=""
          loading="lazy"
        />
        <div className="df_bg_scrim"></div>
      </div>

      {}
      <div className="df_inner" ref={innerRef} data-anm-df-inner>
        <div className="df_grid">
          {}
          <div className="df_brand">
            <div className="df_brand_mark df_reveal_mask" data-anm-df-mask>
              <span className="df_reveal_inner" ref={addRevealInner}>
                <img
                  className="df_brand_logo"
                  src="https://annnimate.b-cdn.net/preview-assets/vanta/brand/vanta-logo-light.svg"
                  alt="Vanta"
                />
              </span>
            </div>
            <h2 className="df_brand_headline" ref={headlineRef} data-anm-df-split>
              Made to be worn out.
            </h2>
            <p className="df_brand_body" ref={bodyRef} data-anm-df-split>
              VANTA is an independent performance label from Innsbruck. Cut, tested and packed in
              the Alps.
            </p>
          </div>

          {}
          <div className="df_cols">
            <div className="df_col">
              <h4 className="df_col_head df_reveal_mask" data-anm-df-mask>
                <span className="df_reveal_inner" ref={addRevealInner}>
                  Shop
                </span>
              </h4>
              <ul className="df_col_list">
                <li className="df_reveal_mask" data-anm-df-mask>
                  <a href="#" className="df_col_link df_reveal_inner" ref={addRevealInner}>
                    New arrivals
                  </a>
                </li>
                <li className="df_reveal_mask" data-anm-df-mask>
                  <a href="#" className="df_col_link df_reveal_inner" ref={addRevealInner}>
                    Collection
                  </a>
                </li>
                <li className="df_reveal_mask" data-anm-df-mask>
                  <a href="#" className="df_col_link df_reveal_inner" ref={addRevealInner}>
                    Archive
                  </a>
                </li>
                <li className="df_reveal_mask" data-anm-df-mask>
                  <a href="#" className="df_col_link df_reveal_inner" ref={addRevealInner}>
                    Stockists
                  </a>
                </li>
              </ul>
            </div>
            <div className="df_col">
              <h4 className="df_col_head df_reveal_mask" data-anm-df-mask>
                <span className="df_reveal_inner" ref={addRevealInner}>
                  Studio
                </span>
              </h4>
              <ul className="df_col_list">
                <li className="df_reveal_mask" data-anm-df-mask>
                  <a href="#" className="df_col_link df_reveal_inner" ref={addRevealInner}>
                    About
                  </a>
                </li>
                <li className="df_reveal_mask" data-anm-df-mask>
                  <a href="#" className="df_col_link df_reveal_inner" ref={addRevealInner}>
                    Journal
                  </a>
                </li>
                <li className="df_reveal_mask" data-anm-df-mask>
                  <a href="#" className="df_col_link df_reveal_inner" ref={addRevealInner}>
                    Careers
                  </a>
                </li>
                <li className="df_reveal_mask" data-anm-df-mask>
                  <a href="#" className="df_col_link df_reveal_inner" ref={addRevealInner}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div className="df_col">
              <h4 className="df_col_head df_reveal_mask" data-anm-df-mask>
                <span className="df_reveal_inner" ref={addRevealInner}>
                  Follow
                </span>
              </h4>
              <ul className="df_col_list">
                <li className="df_reveal_mask" data-anm-df-mask>
                  <a href="#" className="df_col_link df_reveal_inner" ref={addRevealInner}>
                    Instagram
                  </a>
                </li>
                <li className="df_reveal_mask" data-anm-df-mask>
                  <a href="#" className="df_col_link df_reveal_inner" ref={addRevealInner}>
                    YouTube
                  </a>
                </li>
                <li className="df_reveal_mask" data-anm-df-mask>
                  <a href="#" className="df_col_link df_reveal_inner" ref={addRevealInner}>
                    X
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {}

        {}
        <div className="df_stage">
          <div className="df_dock" ref={dockRef} data-anm-df-dock>
            {}
            <div className="df_dock_pill" ref={pillRef} data-anm-df-pill>
              <span className="df_dock_label">Menu</span>
              <button
                className="df_dock_btn"
                ref={openBtnRef}
                data-anm-df-open
                aria-label="Open quick navigation"
                aria-expanded="false"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M2 5h12M2 11h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </button>
              <button
                className="df_dock_btn"
                ref={topBtnRef}
                data-anm-df-top
                aria-label="Back to top"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M8 13V3M3.5 7.5 8 3l4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>
            </div>
            {}

            {}
            <div
              className="df_panel_content"
              ref={panelRef}
              data-anm-df-panel
              role="dialog"
              aria-modal="true"
              aria-label="Quick navigation"
              aria-hidden="true"
            >
              <div className="df_panel_head">
                <span className="df_panel_label">Menu</span>
                <button
                  className="df_panel_close"
                  ref={closeBtnRef}
                  data-anm-df-close
                  aria-label="Close quick navigation"
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path
                      d="M4 4l8 8M12 4l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </button>
              </div>
              <nav aria-label="Quick navigation">
                <ul className="df_nav_list">
                  <li className="df_nav_item" data-anm-df-nav-item>
                    <a href="#" className="df_nav_link" ref={addNavLink}>
                      Collection
                    </a>
                  </li>
                  <li className="df_nav_item" data-anm-df-nav-item>
                    <a href="#" className="df_nav_link" ref={addNavLink}>
                      Journal
                    </a>
                  </li>
                  <li className="df_nav_item" data-anm-df-nav-item>
                    <a href="#" className="df_nav_link" ref={addNavLink}>
                      About
                    </a>
                  </li>
                  <li className="df_nav_item" data-anm-df-nav-item>
                    <a href="#" className="df_nav_link" ref={addNavLink}>
                      Stockists
                    </a>
                  </li>
                  <li className="df_nav_item" data-anm-df-nav-item>
                    <a href="#" className="df_nav_link" ref={addNavLink}>
                      Contact
                    </a>
                  </li>
                </ul>
              </nav>
              <div className="df_panel_foot" ref={panelFootRef} data-anm-df-panel-foot>
                <span className="df_panel_foot_label">Back to top</span>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M8 13V3M3.5 7.5 8 3l4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
            {}
          </div>
          {}
        </div>
        {}

        {}
        <div className="df_legal">
          <span className="df_legal_copy">&copy; 2026 Vanta</span>
          <div className="df_legal_links">
            <a href="#" className="df_legal_link">
              Privacy
            </a>
            <a href="#" className="df_legal_link">
              Terms
            </a>
          </div>
        </div>
      </div>
      {}
    </footer>
  )
}
