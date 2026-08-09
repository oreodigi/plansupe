"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="container" style={{paddingTop:90}}><p className="kicker">Something went wrong</p><h1>We couldn’t load this workspace.</h1><p className="hero-copy">Your data is safe. Try loading the page again.</p><button className="btn primary" onClick={reset}>Try again</button></main>}
