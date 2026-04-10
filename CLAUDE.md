# nickgreenquist.github.io

Personal portfolio site — static HTML/CSS/JS, hosted on GitHub Pages.

## Suggested Improvements

### Content / Credibility
- **Remove skill progress bars** — saying "80% at Machine Learning" is meaningless and looks amateurish. Replace with a simple tagged list of technologies (Python, TensorFlow, Go, etc.) grouped by domain.
- **Trim the bio** — internship history is now irrelevant for a Senior SWE at Google. Lead with current role/impact, condense the rest.
- **Photography link in hero `<h3>`** — redundant with the nav. Remove the inline mention.

### Technical / Modernization
- **Fix Google Analytics** — UA (`UA-103246247-3`) was sunset in 2023 and is collecting no data. Switch to GA4 or remove entirely.
- **jQuery 1.11 + Bootstrap 3** — both from 2014. Swapping for plain CSS/JS or Bootstrap 5 would reduce page weight and remove the jQuery dependency.
- **Add OG meta tags** — missing `og:title`, `og:image`, `og:description` so link previews on Slack/Twitter look bare.

### UX
- **"More" dropdown** — Wrestling and Blog are buried there. Promote Blog to top-level nav if active, otherwise remove it.
- **Pacman loader** — adds perceived latency for a static site that loads near-instantly. Consider removing.

### Priority
1. Remove skill bars (credibility)
2. Fix or remove GA (analytics are silently broken)
