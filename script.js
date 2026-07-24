document.addEventListener("DOMContentLoaded", () => {
    // Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Run once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // FAQ Accordion Logic
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isOpen = question.classList.contains('active');

            // Close all other faqs
            document.querySelectorAll('.faq-question').forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.style.maxHeight = null;
            });

            // Toggle current
            if (!isOpen) {
                question.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
});

// ===== Senja "fancy" embeds: restyle to match the plain testimonial cards =====
// Two Senja widget types get normalised so every review reads as a clean white card:
//  - "oneq-carousel" (detected by .glide): branded purple frame, 232px carousel
//    column, arrows -> transparent frame, full-width static card, no arrows.
//  - "bubble-card-list" (detected by .sj-bubble-card-list): purple offset layer
//    behind the speech bubble -> hidden.
// Their wrapper is widened to span the whole testimonial grid row. Overrides are
// injected INTO the open shadow root (page CSS cannot reach it); a MutationObserver
// re-applies them if Senja re-renders.
(function () {
    var STYLE_ID = 'am-senja-restyle';
    var FANCY = '.glide, .sj-bubble-card-list';
    var CSS = [
        // oneq-carousel type
        '.glide { background: transparent !important; padding: 0 !important; }',
        '.max-w-2xl { max-width: none !important; }',
        '.glide__track { height: auto !important; }',
        '.glide__track, .glide__slides { width: 100% !important; transform: none !important; }',
        '.glide__slide { width: 100% !important; }',
        '.glide__arrows { display: none !important; }',
        // bubble-card-list type
        '.bubble-background { display: none !important; }'
    ].join('\n');

    function restyle(host, root) {
        if (!root.getElementById(STYLE_ID)) {
            var style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = CSS;
            root.appendChild(style);
        }
        var wrapper = host.closest('.testimonial-embed');
        if (wrapper) wrapper.classList.add('testimonial-embed--wide');
    }

    var pending = Array.prototype.slice.call(document.querySelectorAll('.senja-embed'));
    if (!pending.length) return;

    var tries = 0;
    var timer = setInterval(function () {
        pending = pending.filter(function (host) {
            var root = host.shadowRoot;
            if (!root) return true;                       // widget not hydrated yet
            if (!root.querySelector(FANCY)) {
                // Hydrated but no fancy markup yet — keep looking briefly, then
                // treat it as a plain card widget and stop tracking it.
                if (host.__amFancyChecks === undefined) host.__amFancyChecks = 0;
                if (++host.__amFancyChecks < 20) return true;
                return false;
            }
            restyle(host, root);
            new MutationObserver(function () { restyle(host, root); })
                .observe(root, { childList: true });
            return false;
        });
        if (!pending.length || ++tries > 80) clearInterval(timer);
    }, 250);
})();
