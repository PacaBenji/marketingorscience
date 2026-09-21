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

        // Load pixel first so download starts immediately
        const script = document.createElement('script');
        script.src = 'https://static.runconverge.com/pixels/j4pRsz.js';
        script.async = true;
        document.head.appendChild(script);

        // Official queue shim — assigns to both window.cvg and local c
        // so j4pRsz.js can find and drain the queue when it loads
        var c;
        window.cvg || (c = window.cvg = function() {
            c.process ? c.process.apply(c, arguments) : c.queue.push(arguments)
        }, c.queue = []);

        cvg({ method: "track", eventName: "$page_load" });
    }

    function initWhopPixel() {
        if (window.whop) return;

        // Official Whop Pixel snippet — https://docs.whop.com/developer/ads/pixel
        !function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");
        whop.setScope("biz_ZWtfEcddSAJb77");
        whop.track("page");
    }

    function initHeadComponents() {
        initFOUCPrevention();
        initConvergeTracking();
        initWhopPixel();
    }

    // cvg must be defined immediately so tracking.js can call it safely.
    // FOUC styles are DOM-safe to inject at parse time too.
    initHeadComponents();
})();
