# DevBF — Web Development for Businesses in Burkina Faso

**A live, independently developed website for a web studio focused on practical, affordable digital solutions for small businesses in Burkina Faso.**

[**View Live Website**](https://devbf.pages.dev/) · **Status:** Deployed · **Role:** Solo Developer · **Primary Language:** French (website)

## Overview

DevBF is a web development initiative I created to help local businesses establish a professional online presence without unnecessary complexity. The project focuses on an everyday business problem: potential customers need a simple way to discover a business, explore its offerings, and start a conversation.

The website presents DevBF's services, showcases illustrative website concepts, explains the project process, and gives prospective customers clear ways to make an inquiry. It is built for a market where mobile browsing, straightforward interfaces, and WhatsApp-based communication are especially relevant.

The **website is launched and deployed**. DevBF's service offerings are a business initiative; examples on the site should not be interpreted as completed, paid client projects.

## Features Implemented

- **Responsive, mobile-first interface:** Layouts and navigation designed for phones as well as larger screens.
- **Interactive homepage:** Industry-themed hero content and visual previews that introduce potential website use cases.
- **Service and pricing presentation:** Clear sections explaining available services, packages, and the development process.
- **Interactive concept showcase:** Portfolio-style previews presented as demonstrations of possible client solutions.
- **Project inquiry experience:** A contact form interface, package-selection interactions, and prominent WhatsApp contact entry points.
- **Accessible navigation details:** Semantic sections, descriptive labels, a skip-to-content link, and mobile navigation controls.
- **Discoverability foundations:** Page metadata, social-sharing tags, structured data, and sitemap/robots files.

## Technology Stack

| Area | Technology |
| --- | --- |
| Structure | HTML5 |
| Styling | CSS3 |
| Interactivity | Vanilla JavaScript |
| Deployment | Cloudflare Pages |
| Discoverability | SEO metadata, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt` |

The site uses a **lightweight static-site approach** rather than a large application framework. This keeps the architecture understandable, makes the front end easy to maintain, and suits a focused business website.

## Project Structure

```text
.
├── index.html          # Site content, structure, and metadata
├── css/
│   └── style.css       # Responsive styling and visual design
├── js/
│   └── main.js         # Navigation and interactive behaviors
├── favicon.svg         # Site icon
├── og-devbf.jpg        # Social sharing image
├── robots.txt          # Crawler instructions
└── sitemap.xml         # Sitemap
```

## Run Locally

This is a static frontend project. No framework installation or database setup is needed to view the site locally.

1. Clone or download the repository.
2. Open a terminal in the project root.
3. Start a local server:

   ```bash
   python -m http.server 8000
   ```

4. Visit `http://localhost:8000` in your browser.

## Development Approach

Building DevBF gave me a chance to work across **product thinking, interface design, frontend implementation, and deployment** rather than treating the website as a purely visual exercise.

My main priorities were:

- **Solve a real problem:** Make it easier for small businesses to explain what they offer and for customers to reach them.
- **Design around local usage:** Keep the experience mobile-friendly, with a straightforward path to WhatsApp.
- **Maintain clarity:** Organize services, concepts, pricing, FAQs, and contact information into a coherent experience.
- **Keep the code approachable:** Use HTML, CSS, and JavaScript with a clear separation between structure, styling, and behavior.
- **Ship the product:** Publish the site through Cloudflare Pages so the project can be viewed and evaluated outside a local development environment.

## Current Scope and Next Steps

**Currently available:** The public-facing DevBF website, its interactive UI, service information, example concepts, and project inquiry interface.

**Future directions:** Continue refining the website based on feedback, develop more specialized examples for businesses such as restaurants and event-service providers, and explore reusable solutions for catalogs, quotations, and customer inquiries.

**Important distinction:** The website is DevBF's own marketing and portfolio experience. Features such as customer e-commerce systems or Mobile Money payment integrations are potential **client-project services**, not features that should be assumed to operate on the DevBF website itself. Portfolio concepts are demonstrations, not claims of completed client contracts.

## About the Project

DevBF is a **solo software and entrepreneurship project** built by a Computer Science student with an interest in creating useful technology for Burkina Faso and, over time, other African markets.

**Live site:** https://devbf.pages.dev/  
**Market focus:** Burkina Faso  
**Website language:** French  
**Repository documentation:** English

---

*DevBF — Practical websites for local businesses.*
