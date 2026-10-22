// JNetwork site configuration. This is the ONLY file you need to edit to wire up services.
// Everything marked TODO is a placeholder; the site works without them but the feature stays off.
window.JNETWORK_CONFIG = {
  siteName: "JNetwork",

  // Base path. Project pages on GitHub Pages live at /<repo-name>/ ; custom domains and
  // user pages live at "/". Leave "" to auto-detect (recommended).
  basePath: "",

  // Contact form backend. Create a free form at https://web3forms.com (or Formspree) and paste
  // the endpoint + access key. Until then the form shows a "not switched on yet" message. No email address is stored in this public repo.
  contact: {
    endpoint: "https://api.web3forms.com/submit", // TODO: keep for Web3Forms, change for Formspree
    accessKey: ""                                 // TODO: paste your Web3Forms access key (the form stays off until then)
  },

  // Click + page analytics. GoatCounter is free, cookie-less and works on static hosting.
  // Create a site at https://www.goatcounter.com and put the code (the subdomain) here.
  analytics: {
    goatcounterCode: "" // TODO: e.g. "jnetwork" -> https://jnetwork.goatcounter.com/count
  },

  // Newsletter / follow action on the content page. Any form-POST endpoint works.
  subscribe: {
    endpoint: "",       // TODO: e.g. Buttondown, Formspree, Web3Forms
    method: "POST"
  },

  // Audience switcher: the "not what you're looking for?" links shown on every inner page.
  audiences: [
    { id: "business", label: "I need a website or consulting", href: "business.html" },
    { id: "employer", label: "I want to hire or review Jessey", href: "employer.html" },
    { id: "content",  label: "I want to learn Articulate",     href: "content.html" }
  ]
};
