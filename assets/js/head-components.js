// head-components.js
// FOUC prevention for marketingorscience.com
// Include in <head> before other scripts

(function() {

    function initFOUCPrevention() {
        if (!document.querySelector('#fouc-prevention')) {
            const style = document.createElement('style');
            style.id = 'fouc-prevention';
            style.textContent = `
                body {
                    visibility: hidden;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                }
                .no-js body {
                    visibility: visible;
                    opacity: 1;
                }
            `;
            document.head.insertBefore(style, document.head.firstChild);
        }

        if (!document.documentElement.classList.contains('js')) {
            document.documentElement.className += ' js';
        }
    }

    function initConvergeTracking() {
        if (window.cvg) return;

        window.cvg || (cvg = function () {
            cvg.process ? cvg.process.apply(cvg, arguments) : cvg.queue.push(arguments)
        }, cvg.queue = []);

        cvg({ method: "track", eventName: "$page_load" });

        const script = document.createElement('script');
        script.src = 'https://static.runconverge.com/pixels/j4pRsz.js';
        script.async = true;
        document.head.appendChild(script);
    }

    function initHeadComponents() {
        initFOUCPrevention();
        initConvergeTracking();
    }

    // cvg must be defined immediately so tracking.js can call it safely.
    // FOUC styles are DOM-safe to inject at parse time too.
    initHeadComponents();
})();
