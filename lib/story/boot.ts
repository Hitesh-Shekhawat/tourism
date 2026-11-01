// Not a client module: the root layout (a server component) inlines this script string.
export const PREF_KEY = "motion.pref";

/**
 * Inline, pre-paint: sets html.js and html[data-motion] so the right layout variant paints first,
 * and html.splash so the splash screen covers the page from the first paint until <Splash> lifts it
 * (html.splash-quick: pages without 3D, where CSS alone lifts it a beat after first paint, never waiting on JS).
 */
export const motionBootScript = `(function(){var d=document.documentElement;d.classList.add("js","splash");if(location.pathname!=="/story")d.classList.add("splash-quick");try{var p=null;try{p=sessionStorage.getItem("${PREF_KEY}")}catch(e){}var r=matchMedia("(prefers-reduced-motion: reduce)").matches;var m=(p==="calm"||(r&&p!=="full"))?"reduced":"desktop";d.dataset.motion=m}catch(e){}})();`;
