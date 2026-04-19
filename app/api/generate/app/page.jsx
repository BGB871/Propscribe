import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — Replace these with your real values
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  FREE_LIMIT: 3,
  // Get this from Stripe Dashboard → Payment Links → Create link → Copy URL
  STRIPE_PAYMENT_LINK: "https://buy.stripe.com/YOUR_LINK_HERE",
  // After payment, Stripe redirects here — set this in your Stripe payment link settings
  SUCCESS_PARAM: "pro=true",
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --gold: #c9a84c; --gold-light: #e8c96a; --gold-dim: rgba(201,168,76,0.15);
    --bg: #f7f5f0; --bg2: #efecea; --ink: #1a1814; --ink2: #4a4540; --ink3: #8a8070;
    --white: #ffffff; --dark: #0f0e0c; --radius: 16px;
  }
  html { scroll-behavior: smooth; }
  body { font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--ink); overflow-x: hidden; }

  /* NAV */
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 16px 36px; background: rgba(247,245,240,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.06); }
  .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 600; color: var(--ink); cursor: pointer; letter-spacing: -0.02em; }
  .nav-logo span { color: var(--gold); font-style: italic; }
  .nav-right { display: flex; align-items: center; gap: 16px; }
  .nav-pill { background: none; border: none; font-family: 'Outfit', sans-serif; font-size: 13px; color: var(--ink3); cursor: pointer; padding: 0; transition: color 0.2s; }
  .nav-pill:hover { color: var(--ink); }
  .nav-cta { background: var(--ink); color: var(--white); border: none; border-radius: 100px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500; padding: 9px 20px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .nav-cta:hover { background: var(--gold); color: var(--ink); }
  .pro-badge { background: var(--gold); color: var(--ink); font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.05em; }
  @media(max-width:500px){ nav{padding:12px 16px} .nav-pill{display:none} }

  /* HERO */
  .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 120px 24px 80px; position: relative; overflow: hidden; }
  .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.08) 0%, transparent 70%); pointer-events: none; }
  .hero-ring { position: absolute; border: 1px solid rgba(201,168,76,0.1); border-radius: 50%; pointer-events: none; }
  .eyebrow { display: inline-flex; align-items: center; gap: 8px; background: var(--gold-dim); border: 1px solid rgba(201,168,76,0.3); border-radius: 100px; padding: 6px 16px; font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: #8a6820; margin-bottom: 28px; animation: fadeUp 0.6s ease both; }
  .eyebrow-dot { width: 6px; height: 6px; background: var(--gold); border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  .hero-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.8rem,7vw,5.2rem); font-weight: 600; line-height: 1.05; color: var(--ink); letter-spacing: -0.03em; margin-bottom: 20px; max-width: 760px; animation: fadeUp 0.6s 0.1s ease both; }
  .hero-title em { color: var(--gold); font-style: italic; }
  .hero-sub { color: var(--ink3); font-size: clamp(0.95rem,2vw,1.1rem); font-weight: 300; max-width: 460px; line-height: 1.7; margin-bottom: 40px; animation: fadeUp 0.6s 0.2s ease both; }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; animation: fadeUp 0.6s 0.3s ease both; }
  .btn-primary { background: var(--ink); color: var(--white); border: none; border-radius: 100px; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500; padding: 14px 30px; cursor: pointer; transition: all 0.25s; }
  .btn-primary:hover { background: var(--gold); color: var(--ink); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.3); }
  .btn-secondary { background: transparent; color: var(--ink2); border: 1px solid rgba(0,0,0,0.15); border-radius: 100px; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 400; padding: 14px 30px; cursor: pointer; transition: all 0.25s; }
  .btn-secondary:hover { border-color: var(--gold); color: var(--ink); }
  .avatars { display: flex; }
  .avatar { width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--bg); margin-left: -9px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: white; }
  .avatar:first-child { margin-left: 0; }
  .proof { display: flex; align-items: center; gap: 14px; margin-top: 52px; flex-wrap: wrap; justify-content: center; animation: fadeUp 0.6s 0.4s ease both; }
  .proof-text { font-size: 13px; color: var(--ink3); }
  .proof-text strong { color: var(--ink); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  /* MARQUEE */
  .marquee-wrap { border-top: 1px solid rgba(0,0,0,0.07); border-bottom: 1px solid rgba(0,0,0,0.07); padding: 14px 0; overflow: hidden; background: var(--bg2); }
  .marquee-track { display: flex; gap: 44px; animation: marquee 28s linear infinite; width: max-content; }
  .marquee-item { font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink3); white-space: nowrap; display: flex; align-items: center; gap: 10px; }
  .marquee-item::before { content: '✦'; color: var(--gold); font-size: 8px; }
  @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

  /* SECTIONS */
  .section { padding: 90px 24px; }
  .section-inner { max-width: 1040px; margin: 0 auto; }
  .section-eyebrow { font-size: 11px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); margin-bottom: 14px; }
  .section-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.9rem,4vw,2.9rem); font-weight: 600; line-height: 1.15; letter-spacing: -0.02em; color: var(--ink); margin-bottom: 14px; }
  .section-sub { color: var(--ink3); font-size: 0.95rem; font-weight: 300; line-height: 1.7; max-width: 460px; }

  /* HOW IT WORKS */
  .how-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; margin-top: 52px; background: rgba(0,0,0,0.06); border-radius: 20px; overflow: hidden; }
  @media(max-width:640px){ .how-grid{grid-template-columns:1fr} }
  .how-step { background: var(--bg); padding: 36px 28px; }
  .step-num { font-family: 'Cormorant Garamond', serif; font-size: 3.5rem; font-weight: 600; color: rgba(201,168,76,0.15); line-height: 1; margin-bottom: 18px; }
  .step-title { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
  .step-desc { color: var(--ink3); font-size: 13.5px; line-height: 1.7; font-weight: 300; }

  /* FEATURES */
  .features-section { background: var(--dark); }
  .features-section .section-title { color: var(--white); }
  .features-section .section-sub { color: rgba(255,255,255,0.45); }
  .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 52px; }
  @media(max-width:740px){ .features-grid{grid-template-columns:1fr 1fr} }
  @media(max-width:480px){ .features-grid{grid-template-columns:1fr} }
  .feature-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius); padding: 26px; transition: border-color 0.2s,background 0.2s; }
  .feature-card:hover { border-color: rgba(201,168,76,0.3); background: rgba(255,255,255,0.06); }
  .feature-icon { font-size: 1.4rem; margin-bottom: 14px; display: block; }
  .feature-title { font-size: 14px; font-weight: 600; color: var(--white); margin-bottom: 7px; }
  .feature-desc { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.65; font-weight: 300; }

  /* PRICING */
  .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 52px; max-width: 660px; }
  @media(max-width:520px){ .pricing-grid{grid-template-columns:1fr} }
  .pricing-card { border-radius: 20px; padding: 32px; transition: transform 0.2s; }
  .pricing-card:hover { transform: translateY(-4px); }
  .pricing-card.free { background: var(--bg2); border: 1px solid rgba(0,0,0,0.08); }
  .pricing-card.pro { background: var(--ink); color: var(--white); }
  .pricing-badge { display: inline-block; background: var(--gold); color: var(--ink); font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; margin-bottom: 18px; }
  .pricing-plan { font-size: 12px; font-weight: 500; color: var(--ink3); margin-bottom: 6px; }
  .pricing-card.pro .pricing-plan { color: rgba(255,255,255,0.45); }
  .pricing-price { font-family: 'Cormorant Garamond', serif; font-size: 3.2rem; font-weight: 600; line-height: 1; color: var(--ink); margin-bottom: 4px; }
  .pricing-card.pro .pricing-price { color: var(--white); }
  .pricing-period { font-size: 12px; color: var(--ink3); margin-bottom: 24px; }
  .pricing-card.pro .pricing-period { color: rgba(255,255,255,0.35); }
  .pricing-features { list-style: none; display: flex; flex-direction: column; gap: 9px; margin-bottom: 28px; }
  .pricing-features li { font-size: 13px; color: var(--ink2); display: flex; align-items: center; gap: 9px; }
  .pricing-card.pro .pricing-features li { color: rgba(255,255,255,0.7); }
  .pricing-features li::before { content: '✓'; color: var(--gold); font-weight: 600; font-size: 11px; flex-shrink: 0; }
  .btn-plan { width: 100%; padding: 12px; border-radius: 100px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; }
  .btn-plan.free-btn { background: transparent; border: 1px solid rgba(0,0,0,0.15); color: var(--ink); }
  .btn-plan.free-btn:hover { border-color: var(--ink); }
  .btn-plan.pro-btn { background: var(--gold); color: var(--ink); }
  .btn-plan.pro-btn:hover { background: var(--gold-light); }

  /* TESTIMONIALS */
  .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; margin-top: 52px; }
  @media(max-width:640px){ .testi-grid{grid-template-columns:1fr} }
  .testi-card { background: var(--white); border: 1px solid rgba(0,0,0,0.06); border-radius: var(--radius); padding: 26px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
  .testi-stars { color: var(--gold); font-size: 12px; margin-bottom: 12px; letter-spacing: 2px; }
  .testi-text { font-family: 'Cormorant Garamond', serif; font-size: 1rem; line-height: 1.65; color: var(--ink); font-style: italic; margin-bottom: 18px; }
  .testi-author { display: flex; align-items: center; gap: 10px; }
  .testi-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; color: white; flex-shrink: 0; }
  .testi-name { font-size: 12px; font-weight: 600; color: var(--ink); }
  .testi-role { font-size: 11px; color: var(--ink3); }

  /* CTA */
  .cta-section { background: var(--dark); text-align: center; padding: 90px 24px; }
  .cta-section .section-title { color: var(--white); max-width: 560px; margin: 0 auto 14px; }
  .cta-section .section-sub { color: rgba(255,255,255,0.4); margin: 0 auto 36px; }

  /* FOOTER */
  footer { background: var(--dark); border-top: 1px solid rgba(255,255,255,0.06); padding: 26px 36px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 600; color: var(--white); }
  .footer-logo span { color: var(--gold); font-style: italic; }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a { font-size: 12px; color: rgba(255,255,255,0.35); text-decoration: none; cursor: pointer; }
  .footer-links a:hover { color: var(--gold); }
  .footer-copy { font-size: 11px; color: rgba(255,255,255,0.2); }

  /* ── GENERATOR ── */
  .gen-page { min-height: 100vh; background: var(--dark); padding: 96px 20px 80px; }
  .gen-grain { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.3; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E"); }
  .gen-inner { max-width: 820px; margin: 0 auto; position: relative; z-index: 1; }
  .gen-header { text-align: center; margin-bottom: 40px; }
  .gen-badge { display: inline-block; background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.3); color: var(--gold); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; padding: 5px 14px; border-radius: 100px; margin-bottom: 18px; font-weight: 500; }
  .gen-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem,5vw,3.2rem); font-weight: 600; color: #f0ece4; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 10px; }
  .gen-title em { color: var(--gold); font-style: italic; }
  .gen-sub { color: #6a6258; font-size: 0.9rem; font-weight: 300; }

  /* USAGE METER */
  .usage-bar-wrap { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px 22px; margin-bottom: 22px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .usage-info { flex: 1; min-width: 160px; }
  .usage-title { font-size: 12px; font-weight: 500; color: #8a8070; margin-bottom: 8px; letter-spacing: 0.05em; text-transform: uppercase; }
  .usage-track { height: 6px; background: rgba(255,255,255,0.08); border-radius: 100px; overflow: hidden; }
  .usage-fill { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-light)); border-radius: 100px; transition: width 0.4s ease; }
  .usage-label { font-size: 12px; color: #6a6258; margin-top: 6px; }
  .usage-label strong { color: var(--gold); }
  .upgrade-mini { background: var(--gold); color: var(--dark); border: none; border-radius: 100px; font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600; padding: 8px 18px; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
  .upgrade-mini:hover { background: var(--gold-light); transform: translateY(-1px); }

  .gen-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 28px; margin-bottom: 18px; }
  .gen-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); font-weight: 500; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
  .gen-label::after { content:''; flex:1; height:1px; background:rgba(201,168,76,0.2); }
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
  .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 13px; }
  @media(max-width:560px){ .g2,.g3{grid-template-columns:1fr} }
  .gfield { display: flex; flex-direction: column; gap: 6px; }
  .gfield label { font-size: 11px; color: #6a6258; font-weight: 500; letter-spacing: 0.05em; }
  .gfield input, .gfield select, .gfield textarea { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #f0ece4; font-family: 'Outfit', sans-serif; font-size: 13px; padding: 10px 12px; outline: none; width: 100%; transition: border-color 0.2s; }
  .gfield input:focus, .gfield select:focus, .gfield textarea:focus { border-color: rgba(201,168,76,0.5); }
  .gfield select option { background: #1a1915; color: #f0ece4; }
  .gfield textarea { resize: vertical; min-height: 80px; line-height: 1.55; }
  .tone-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(128px,1fr)); gap: 9px; }
  .tone-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.09); border-radius: 10px; color: #6a6258; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 12.5px; padding: 9px 12px; text-align: center; transition: all 0.2s; }
  .tone-btn:hover { border-color: rgba(201,168,76,0.4); color: #f0ece4; }
  .tone-btn.active { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.6); color: var(--gold); font-weight: 500; }
  .feat-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(148px,1fr)); gap: 7px; }
  .feat-chip { align-items: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; cursor: pointer; display: flex; font-size: 12px; gap: 8px; padding: 8px 10px; transition: all 0.2s; color: #6a6258; user-select: none; }
  .feat-chip:hover { border-color: rgba(201,168,76,0.3); color: #c8c0b0; }
  .feat-chip.active { background: rgba(201,168,76,0.08); border-color: rgba(201,168,76,0.4); color: var(--gold); }
  .chip-check { width: 13px; height: 13px; border: 1.5px solid currentColor; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 8px; flex-shrink: 0; }
  .gen-btn { width: 100%; background: linear-gradient(135deg, var(--gold), #b8941e); border: none; border-radius: 14px; color: var(--dark); cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 600; padding: 16px; transition: all 0.25s; }
  .gen-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(201,168,76,0.3); }
  .gen-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .output-card { background: rgba(201,168,76,0.04); border: 1px solid rgba(201,168,76,0.2); border-radius: 18px; padding: 30px; margin-top: 20px; animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .output-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; gap: 12px; flex-wrap: wrap; }
  .output-label { font-family: 'Cormorant Garamond', serif; font-size: 1rem; color: var(--gold); font-style: italic; }
  .copy-btn { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); border-radius: 8px; color: var(--gold); cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 500; padding: 7px 14px; transition: all 0.2s; }
  .copy-btn:hover { background: rgba(201,168,76,0.2); }
  .output-divider { height: 1px; background: rgba(255,255,255,0.06); margin-bottom: 18px; }
  .output-text { color: #d0c8bc; font-size: 14px; line-height: 1.85; white-space: pre-wrap; }
  .dots { display: flex; gap: 6px; align-items: center; justify-content: center; padding: 36px; }
  .dot { width: 7px; height: 7px; background: var(--gold); border-radius: 50%; animation: bounce 1.2s infinite; }
  .dot:nth-child(2){animation-delay:0.2s} .dot:nth-child(3){animation-delay:0.4s}
  @keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
  .err { color: #e07070; background: rgba(224,112,112,0.08); border: 1px solid rgba(224,112,112,0.2); border-radius: 10px; padding: 12px 16px; font-size: 13px; margin-bottom: 14px; }
  .back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; color: #8a8070; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 13px; padding: 8px 18px; margin-bottom: 32px; transition: all 0.2s; }
  .back-btn:hover { color: #f0ece4; border-color: rgba(255,255,255,0.2); }

  /* PAYWALL MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn 0.2s ease; }
  .modal { background: #1a1815; border: 1px solid rgba(201,168,76,0.25); border-radius: 24px; padding: 40px 36px; max-width: 460px; width: 100%; text-align: center; position: relative; }
  .modal-icon { font-size: 2.5rem; margin-bottom: 20px; }
  .modal-title { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 600; color: #f0ece4; margin-bottom: 10px; letter-spacing: -0.02em; }
  .modal-title em { color: var(--gold); font-style: italic; }
  .modal-sub { color: #6a6258; font-size: 14px; line-height: 1.65; margin-bottom: 28px; font-weight: 300; }
  .modal-price { display: flex; align-items: baseline; justify-content: center; gap: 4px; margin-bottom: 8px; }
  .modal-price-num { font-family: 'Cormorant Garamond', serif; font-size: 3rem; font-weight: 600; color: var(--gold); }
  .modal-price-period { font-size: 14px; color: #6a6258; }
  .modal-trial { font-size: 12px; color: rgba(201,168,76,0.6); margin-bottom: 28px; }
  .modal-perks { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; text-align: left; }
  .modal-perks li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #c8c0b0; }
  .modal-perks li::before { content: '✓'; color: var(--gold); font-weight: 600; flex-shrink: 0; }
  .modal-btn { width: 100%; background: linear-gradient(135deg, var(--gold), #b8941e); border: none; border-radius: 14px; color: var(--dark); cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 600; padding: 16px; transition: all 0.25s; margin-bottom: 12px; }
  .modal-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(201,168,76,0.35); }
  .modal-dismiss { background: none; border: none; color: #4a4540; font-family: 'Outfit', sans-serif; font-size: 13px; cursor: pointer; padding: 4px; transition: color 0.2s; }
  .modal-dismiss:hover { color: #8a8070; }
  .modal-close { position: absolute; top: 16px; right: 20px; background: none; border: none; color: #4a4540; font-size: 20px; cursor: pointer; line-height: 1; padding: 4px; }
  .modal-close:hover { color: #8a8070; }

  /* SUCCESS BANNER */
  .success-banner { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); border-radius: 14px; padding: 16px 22px; margin-bottom: 22px; display: flex; align-items: center; gap: 12px; }
  .success-banner-icon { font-size: 1.3rem; }
  .success-banner-text { font-size: 14px; color: #d4c090; line-height: 1.5; }
  .success-banner-text strong { color: var(--gold); }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TONES = ["Luxury & Prestige","Warm & Inviting","Modern & Minimal","Family Friendly","Investment Focus","Lifestyle & Aspirational"];
const FEATURES = ["Alfresco entertaining","Ducted air conditioning","Granny flat","Solar panels","Pool / spa","Double lock-up garage","Open plan living","Stone benchtops","Ensuite","Walk-in pantry","Home office","Study","Freshly painted","New flooring","Garden shed","Rainwater tank","NBN connected","EV charger","North-facing","Corner block","Quiet street"];
const MARQUEE = ["Sydney","Melbourne","Brisbane","Perth","Adelaide","Gold Coast","Canberra","Hobart","Darwin","Newcastle","Wollongong","Geelong","Ballarat","Bendigo","Townsville"];
const FEATS_LIST = [
  {icon:"✦",title:"Australian English",desc:"Kerb appeal, alfresco, metres — all the local language agents expect."},
  {icon:"⚡",title:"30-Second Listings",desc:"Fill in the details, click generate. Publish-ready copy instantly."},
  {icon:"🎨",title:"6 Tone Styles",desc:"Match the tone to the property and the buyer demographic."},
  {icon:"🏡",title:"All Property Types",desc:"Houses, apartments, townhouses, acreage — every listing covered."},
  {icon:"📋",title:"One-Click Copy",desc:"Paste straight into Domain, REA, or your CRM in seconds."},
  {icon:"🔒",title:"Private & Secure",desc:"We never store your property addresses or client details."},
];
const TESTIS = [
  {text:"I used to spend 45 minutes on each listing. Now it takes 2 minutes and the copy is honestly better.",name:"Sarah M.",role:"Principal, Ray White Sydney",color:"#6a8f6a"},
  {text:"The Australian tone is spot on. It doesn't sound like a generic AI — it sounds like a seasoned local copywriter.",name:"James T.",role:"Agent, McGrath Melbourne",color:"#6a7a8f"},
  {text:"I trialled three tools before this. PropScribe is the only one that truly understands the Australian market.",name:"Priya K.",role:"Director, LJ Hooker Brisbane",color:"#8f6a7a"},
];

// ─── PAYWALL MODAL ─────────────────────────────────────────────────────────────
function PaywallModal({ onClose }) {
  const goToStripe = () => {
    window.open(CONFIG.STRIPE_PAYMENT_LINK, "_blank");
  };
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-icon">✦</div>
        <h2 className="modal-title">You've used your<br /><em>3 free listings</em></h2>
        <p className="modal-sub">Upgrade to Pro for unlimited listings, priority generation, and full Australian market coverage.</p>
        <div className="modal-price">
          <span className="modal-price-num">$39</span>
          <span className="modal-price-period">AUD / month</span>
        </div>
        <p className="modal-trial">7-day free trial · Cancel any time</p>
        <ul className="modal-perks">
          <li>Unlimited listing descriptions</li>
          <li>All 6 tone styles</li>
          <li>All Australian property types</li>
          <li>One-click copy to clipboard</li>
          <li>Priority AI generation</li>
          <li>Email support</li>
        </ul>
        <button className="modal-btn" onClick={goToStripe}>Start 7-day free trial →</button>
        <button className="modal-dismiss" onClick={onClose}>Maybe later</button>
      </div>
    </div>
  );
}

// ─── USAGE METER ──────────────────────────────────────────────────────────────
function UsageMeter({ count, isPro, onUpgrade }) {
  const pct = Math.min((count / CONFIG.FREE_LIMIT) * 100, 100);
  const remaining = Math.max(CONFIG.FREE_LIMIT - count, 0);
  if (isPro) return null;
  return (
    <div className="usage-bar-wrap">
      <div className="usage-info">
        <div className="usage-title">Free listings used</div>
        <div className="usage-track"><div className="usage-fill" style={{width:`${pct}%`}}/></div>
        <div className="usage-label">
          {remaining > 0
            ? <><strong>{remaining}</strong> free listing{remaining !== 1 ? "s" : ""} remaining this month</>
            : <><strong>Limit reached</strong> — upgrade for unlimited access</>}
        </div>
      </div>
      {remaining === 0 && (
        <button className="upgrade-mini" onClick={onUpgrade}>Upgrade →</button>
      )}
    </div>
  );
}

// ─── GENERATOR ────────────────────────────────────────────────────────────────
function Generator({ onBack, isPro, usageCount, onUsage }) {
  const [form, setForm] = useState({address:"",suburb:"",state:"NSW",type:"House",bedrooms:"3",bathrooms:"2",carSpaces:"2",landSize:"",floorArea:"",headline:"",highlights:""});
  const [tone, setTone] = useState("Warm & Inviting");
  const [selected, setSelected] = useState([]);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const up = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggle = f => setSelected(p => p.includes(f) ? p.filter(x=>x!==f) : [...p,f]);

  const generate = async () => {
    if (!isPro && usageCount >= CONFIG.FREE_LIMIT) { setShowPaywall(true); return; }
    if (!form.suburb) { setError("Please enter a suburb."); return; }
    setError(""); setOutput(""); setLoading(true);

    const prompt = `You are an expert Australian real estate copywriter. Write a compelling property listing for:
- Address: ${form.address||"Address withheld"}, ${form.suburb}, ${form.state}
- Type: ${form.type} | Bed: ${form.bedrooms} | Bath: ${form.bathrooms} | Cars: ${form.carSpaces}
${form.landSize?`- Land: ${form.landSize}sqm`:""} ${form.floorArea?`| Floor: ${form.floorArea}sqm`:""}
${form.headline?`- Headline idea: ${form.headline}`:""}
${form.highlights?`- Highlights: ${form.highlights}`:""}
${selected.length?`- Features: ${selected.join(", ")}`:""}
Tone: ${tone}
Rules: Australian English (colour, kerb, metres). Start with ALL CAPS headline. Write 3-4 lifestyle paragraphs. End with 5-7 bullet features. No price. ~220-270 words. Genuine, not generic.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.map(b=>b.text||"").join("");
      setOutput(text);
      onUsage(); // increment count
    } catch(e) { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  return (
    <div className="gen-page">
      {showPaywall && <PaywallModal onClose={()=>setShowPaywall(false)} />}
      <div className="gen-grain"/>
      <div className="gen-inner">
        <button className="back-btn" onClick={onBack}>← Back to home</button>

        <div className="gen-header">
          <div className="gen-badge">{isPro ? "✦ Pro Plan · Unlimited" : "✦ AI-Powered · Australian Market"}</div>
          <h1 className="gen-title">Listings that <em>sell</em>.</h1>
          <p className="gen-sub">Generate compelling Australian property descriptions in seconds.</p>
        </div>

        {isPro && (
          <div className="success-banner">
            <div className="success-banner-icon">🎉</div>
            <div className="success-banner-text"><strong>You're on Pro!</strong> Generate unlimited listings anytime.</div>
          </div>
        )}

        <UsageMeter count={usageCount} isPro={isPro} onUpgrade={()=>setShowPaywall(true)} />

        {/* Property */}
        <div className="gen-card">
          <div className="gen-label">Property Details</div>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <div className="g2">
              <div className="gfield"><label>Street Address</label><input placeholder="12 Banksia Street" value={form.address} onChange={e=>up("address",e.target.value)}/></div>
              <div className="gfield"><label>Suburb *</label><input placeholder="Mosman" value={form.suburb} onChange={e=>up("suburb",e.target.value)}/></div>
            </div>
            <div className="g3">
              <div className="gfield"><label>State</label><select value={form.state} onChange={e=>up("state",e.target.value)}>{["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"].map(s=><option key={s}>{s}</option>)}</select></div>
              <div className="gfield"><label>Type</label><select value={form.type} onChange={e=>up("type",e.target.value)}>{["House","Townhouse","Apartment","Unit","Villa","Acreage","Duplex"].map(t=><option key={t}>{t}</option>)}</select></div>
              <div className="gfield"><label>Bedrooms</label><select value={form.bedrooms} onChange={e=>up("bedrooms",e.target.value)}>{["1","2","3","4","5","6+"].map(n=><option key={n}>{n}</option>)}</select></div>
            </div>
            <div className="g3">
              <div className="gfield"><label>Bathrooms</label><select value={form.bathrooms} onChange={e=>up("bathrooms",e.target.value)}>{["1","2","3","4","5+"].map(n=><option key={n}>{n}</option>)}</select></div>
              <div className="gfield"><label>Car Spaces</label><select value={form.carSpaces} onChange={e=>up("carSpaces",e.target.value)}>{["0","1","2","3","4+"].map(n=><option key={n}>{n}</option>)}</select></div>
              <div className="gfield"><label>Land Size (sqm)</label><input placeholder="650" value={form.landSize} onChange={e=>up("landSize",e.target.value)}/></div>
            </div>
          </div>
        </div>

        {/* Tone */}
        <div className="gen-card">
          <div className="gen-label">Listing Tone</div>
          <div className="tone-grid">
            {TONES.map(t=><button key={t} className={`tone-btn${tone===t?" active":""}`} onClick={()=>setTone(t)}>{t}</button>)}
          </div>
        </div>

        {/* Features */}
        <div className="gen-card">
          <div className="gen-label">Key Features</div>
          <div className="feat-grid">
            {FEATURES.map(f=>(
              <div key={f} className={`feat-chip${selected.includes(f)?" active":""}`} onClick={()=>toggle(f)}>
                <div className="chip-check">{selected.includes(f)?"✓":""}</div>{f}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="gen-card">
          <div className="gen-label">Agent Notes (Optional)</div>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <div className="gfield"><label>Key Selling Point</label><input placeholder="Rare north-facing corner block with harbour glimpses" value={form.headline} onChange={e=>up("headline",e.target.value)}/></div>
            <div className="gfield"><label>Additional Highlights</label><textarea placeholder="Recently renovated kitchen, walking distance to cafes…" value={form.highlights} onChange={e=>up("highlights",e.target.value)}/></div>
          </div>
        </div>

        {error && <div className="err">{error}</div>}

        <button className="gen-btn" onClick={generate} disabled={loading}>
          {loading ? "Generating your listing…" : (!isPro && usageCount >= CONFIG.FREE_LIMIT) ? "🔒 Upgrade to Generate" : "✦ Generate Listing Description"}
        </button>

        {loading && <div className="output-card"><div className="dots"><div className="dot"/><div className="dot"/><div className="dot"/></div></div>}

        {output && !loading && (
          <div className="output-card">
            <div className="output-head">
              <div className="output-label">Your listing is ready</div>
              <button className="copy-btn" onClick={copy}>{copied?"✓ Copied!":"Copy text"}</button>
            </div>
            <div className="output-divider"/>
            <div className="output-text">{output}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({ onStart }) {
  const goStripe = () => window.open(CONFIG.STRIPE_PAYMENT_LINK, "_blank");
  return (
    <div>
      <section className="hero">
        <div className="hero-bg"/>
        <div className="hero-ring" style={{width:600,height:600,top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}/>
        <div className="hero-ring" style={{width:900,height:900,top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}/>
        <div className="eyebrow"><span className="eyebrow-dot"/>Built for Australian Real Estate</div>
        <h1 className="hero-title">Write listings that<br/><em>sell properties faster</em></h1>
        <p className="hero-sub">PropScribe uses AI to generate compelling, Australian-English property descriptions in seconds — so you spend less time writing and more time selling.</p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={onStart}>Try free — 3 listings →</button>
          <button className="btn-secondary" onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>See how it works</button>
        </div>
        <div className="proof">
          <div className="avatars">
            {[["S","#6a8f6a"],["J","#6a7a8f"],["P","#8f6a7a"],["M","#8f8a6a"]].map(([l,c],i)=>(
              <div key={i} className="avatar" style={{background:c}}>{l}</div>
            ))}
          </div>
          <div className="proof-text">Trusted by <strong>200+ agents</strong> across Australia</div>
        </div>
      </section>

      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...MARQUEE,...MARQUEE].map((m,i)=><div key={i} className="marquee-item">{m}</div>)}
        </div>
      </div>

      <section className="section" id="how">
        <div className="section-inner">
          <div className="section-eyebrow">How it works</div>
          <h2 className="section-title">Three steps to a perfect listing</h2>
          <p className="section-sub">No writing experience needed. Fill in the details and let PropScribe do the rest.</p>
          <div className="how-grid">
            {[
              {n:"01",t:"Enter property details",d:"Add the basics — suburb, bedrooms, bathrooms, land size, and any standout features."},
              {n:"02",t:"Choose your tone",d:"Select from 6 tone styles to match the property and target buyer perfectly."},
              {n:"03",t:"Generate & copy",d:"Get a publish-ready listing in seconds. Copy straight to Domain, REA, or your CRM."},
            ].map(s=>(
              <div key={s.n} className="how-step">
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.t}</div>
                <p className="step-desc">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section features-section">
        <div className="section-inner">
          <div className="section-eyebrow">Features</div>
          <h2 className="section-title">Everything you need.<br/>Nothing you don't.</h2>
          <p className="section-sub">Built specifically for Australian agents — not a generic AI tool with an Aussie skin.</p>
          <div className="features-grid">
            {FEATS_LIST.map((f,i)=>(
              <div key={i} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="section-inner">
          <div className="section-eyebrow">Pricing</div>
          <h2 className="section-title">Simple, honest pricing</h2>
          <p className="section-sub">Start free. Upgrade when you're ready. No lock-in contracts.</p>
          <div className="pricing-grid">
            <div className="pricing-card free">
              <div className="pricing-plan">Free</div>
              <div className="pricing-price">$0</div>
              <div className="pricing-period">forever</div>
              <ul className="pricing-features">
                <li>3 listings per month</li>
                <li>All tone styles</li>
                <li>All property types</li>
                <li>Copy to clipboard</li>
              </ul>
              <button className="btn-plan free-btn" onClick={onStart}>Get started free</button>
            </div>
            <div className="pricing-card pro">
              <div className="pricing-badge">Most popular</div>
              <div className="pricing-plan">Pro</div>
              <div className="pricing-price">$39</div>
              <div className="pricing-period">AUD / month</div>
              <ul className="pricing-features">
                <li>Unlimited listings</li>
                <li>All tone styles</li>
                <li>All property types</li>
                <li>Copy to clipboard</li>
                <li>Priority generation</li>
                <li>Email support</li>
              </ul>
              <button className="btn-plan pro-btn" onClick={goStripe}>Start 7-day free trial →</button>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{background:"var(--bg2)"}}>
        <div className="section-inner">
          <div className="section-eyebrow">Testimonials</div>
          <h2 className="section-title">What agents are saying</h2>
          <div className="testi-grid">
            {TESTIS.map((t,i)=>(
              <div key={i} className="testi-card">
                <div className="testi-stars">★★★★★</div>
                <p className="testi-text">"{t.text}"</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{background:t.color}}>{t.name[0]}</div>
                  <div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="section-inner" style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div className="section-eyebrow">Get started</div>
          <h2 className="section-title">Your next listing is<br/><em style={{color:"var(--gold)",fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>30 seconds away</em></h2>
          <p className="section-sub" style={{textAlign:"center"}}>Join hundreds of Australian agents saving hours every week.</p>
          <div style={{height:32}}/>
          <button className="btn-primary" onClick={onStart}>Try free — no credit card needed →</button>
          <p style={{marginTop:16,fontSize:11,color:"rgba(255,255,255,0.2)"}}>3 free listings · No credit card required</p>
        </div>
      </section>

      <footer>
        <div className="footer-logo">Prop<span>Scribe</span></div>
        <div className="footer-links"><a>Privacy</a><a>Terms</a><a>Contact</a></div>
        <div className="footer-copy">© 2026 PropScribe · Made in Australia 🇦🇺</div>
      </footer>
    </div>
  );
}

// ─── APP SHELL ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  // Track usage count in memory (resets on page refresh — good enough for MVP)
  const [usageCount, setUsageCount] = useState(0);
  // Check if user came back from Stripe with ?pro=true
  const [isPro, setIsPro] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("pro") === "true";
    }
    return false;
  });

  const incrementUsage = () => setUsageCount(c => c + 1);

  return (
    <>
      <style>{styles}</style>
      <nav>
        <div className="nav-logo" onClick={()=>setPage("landing")}>Prop<span>Scribe</span></div>
        <div className="nav-right">
          {page === "generator" && <button className="nav-pill" onClick={()=>setPage("landing")}>← Home</button>}
          {page === "landing" && <button className="nav-pill" onClick={()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}>Pricing</button>}
          {isPro
            ? <div className="pro-badge">✦ Pro</div>
            : <button className="nav-cta" onClick={()=>setPage("generator")}>Start free →</button>
          }
        </div>
      </nav>

      {page === "landing" && <Landing onStart={()=>setPage("generator")} />}
      {page === "generator" && (
        <Generator
          onBack={()=>setPage("landing")}
          isPro={isPro}
          usageCount={usageCount}
          onUsage={incrementUsage}
        />
      )}
    </>
  );
}
