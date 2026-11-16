/**
 * End-to-end checks for the MITSU Crntzz site.
 * Usage: start the production server (e.g. `npx next start -p 3100`) then run
 *   node scripts/e2e-check.mjs http://localhost:3100
 */
const base = process.argv[2] ?? "http://localhost:3100";
const results = [];
const check = (name, condition, extra = "") => {
  results.push({ name, pass: Boolean(condition), extra });
  console.log(`${condition ? "PASS" : "FAIL"} · ${name}${extra ? " · " + extra : ""}`);
};
const json = (path, body) =>
  fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const text = (html) => html.replace(/<[^>]+>/g, " ");

// --- health -----------------------------------------------------------------
const health = await fetch(`${base}/api/health`).then((r) => r.json());
check("Health endpoint", health.ok === true);

// --- cart -> WhatsApp order flow -------------------------------------------
const orderPayload = {
  customer: {
    name: "Test Customer",
    phone: "+91 98765 43210",
    address: "12 Test Lane, Indiranagar, Bengaluru, Karnataka 560038",
    notes: "Please gift wrap & add a small note.\nThank you!",
  },
  items: [
    { slug: "rangoli-art", tier: "premium", quantity: 2 },
    { slug: "greeting-cards", tier: "basic", quantity: 3 },
    { slug: "customised-diaries", tier: "customise", quantity: 1 },
  ],
};
const orderRes = await json("/api/orders", orderPayload);
const order = await orderRes.json();
check("Order API responds 200", orderRes.status === 200, String(orderRes.status));
check("Order saved to database", order.persisted === true);
check("Reference generated", /^MC-\d{4}-[A-Z0-9]{4}$/.test(order.reference || ""), order.reference);
check("Server-side subtotal is correct (priced lines only)", order.subtotal === 899 * 2 + 99 * 3, `₹${order.subtotal}`);
check("Customise lines counted as quoted", order.quotedCount === 1, String(order.quotedCount));
check("Item count correct", order.itemCount === 6, String(order.itemCount));
check("WhatsApp link uses business number", order.whatsappUrl?.startsWith("https://wa.me/919531983688?text="));
check("No false confirmation wording", !/order (has been|was) (placed|confirmed)/i.test(order.notice || ""));
const decoded = decodeURIComponent(order.whatsappUrl.split("?text=")[1] || "");
check("Message includes customer name", decoded.includes("Test Customer"));
check("Message includes delivery address", decoded.includes("Indiranagar"));
check("Message includes phone", decoded.includes("9876543210"));
check("Message includes product names, levels & quantities", decoded.includes("Rangoli Art — Premium") && decoded.includes("Qty 2") && decoded.includes("Greeting Cards — Basic") && decoded.includes("Customised Diaries — Customise"));
check("Message includes prices and subtotal", decoded.includes("₹899") && decoded.includes("₹99") && decoded.includes("Subtotal (5 priced items): ₹2,095"));
check("Message flags Customise line as quoted", decoded.includes("price to be quoted") && decoded.includes("Customise item to be quoted: 1"));
check("Message includes order notes", decoded.includes("gift wrap"));
check("Encoded link has no raw spaces/newlines", !/[\s\n]/.test(order.whatsappUrl));
check("Message has no unencoded ampersands", !/(?<!%26)&(?!text=)/.test(order.whatsappUrl.slice(order.whatsappUrl.indexOf("?text="))));

const tampered = await json("/api/orders", { ...orderPayload, items: [{ slug: "rangoli-art", tier: "basic", quantity: 500 }] });
const badTier = await json("/api/orders", { ...orderPayload, items: [{ slug: "rangoli-art", tier: "gold", quantity: 1 }] });
check("Rejects unknown level", badTier.status === 400, String(badTier.status));
check("Rejects impossible quantity", tampered.status === 400, String(tampered.status));
const badPhone = await json("/api/orders", { ...orderPayload, customer: { ...orderPayload.customer, phone: "abc" } });
const badPhoneBody = await badPhone.json();
check("Rejects invalid phone", badPhone.status === 422 && Boolean(badPhoneBody.fieldErrors?.phone), String(badPhone.status));
const emptyBag = await json("/api/orders", { ...orderPayload, items: [] });
check("Rejects empty bag", emptyBag.status === 400, String(emptyBag.status));
const unknown = await json("/api/orders", { ...orderPayload, items: [{ slug: "not-a-real-piece", quantity: 1 }] });
check("Rejects unknown product slug", unknown.status === 400, String(unknown.status));

// --- custom order enquiry -----------------------------------------------------
const custom = await json("/api/enquiries", {
  name: "Priya Nair",
  phone: "9812345678",
  email: "priya@example.com",
  requestType: "Rangoli — festive or event",
  occasion: "Diwali 2026",
  budget: "₹4,000 – ₹6,000",
  deadline: "Before 5 November",
  description: "Two rangoli plates in blush and sage for our Diwali table, with our family name on the back.",
});
const customBody = await custom.json();
check("Custom enquiry API responds 200", custom.status === 200, String(custom.status));
check("Custom enquiry saved", customBody.persisted === true);
check("Custom enquiry WhatsApp link ready", customBody.whatsappUrl?.startsWith("https://wa.me/919531983688?text="));
check("Custom enquiry email fallback uses business email", customBody.emailLink?.startsWith("mailto:meetalij24@gmail.com?subject="));
check("Custom enquiry does not claim delivery", customBody.emailDelivery?.delivered === false);
const customInvalid = await json("/api/enquiries", { name: "x", phone: "123", requestType: "", description: "hi" });
check("Custom enquiry validation works", customInvalid.status === 422, String(customInvalid.status));

// --- contact form -------------------------------------------------------------
const contactRes = await json("/api/contact", {
  name: "Test Visitor",
  email: "visitor@example.com",
  phone: "9876500000",
  subject: "Delivery question",
  message: "Do you deliver the crochet tote to Pune, and what would delivery cost?",
});
const contact = await contactRes.json();
check("Contact API responds 200", contactRes.status === 200, String(contactRes.status));
check("Contact enquiry saved", contact.persisted === true);
check("Contact reports email NOT delivered honestly", contact.emailDelivery?.delivered === false, JSON.stringify(contact.emailDelivery));
check("Contact offers WhatsApp alternative", contact.whatsappUrl?.startsWith("https://wa.me/919531983688?text="));
const badContact = await json("/api/contact", { name: "A", email: "nope", subject: "", message: "short" });
check("Contact validation works", badContact.status === 422, String(badContact.status));

// --- pages: every nav item and every tab has its own route -----------------------
const pages = [
  "/", "/about", "/shop", "/shop/rangoli-art", "/creations", "/blog", "/blog/basic-premium-or-customise",
  "/contact", "/cart", "/custom-orders", "/collections/art-and-crafts", "/collections/giftables",
  "/collections/lifestyle", "/diy-ideas", "/diy-ideas/simple-alpona-motif", "/more", "/offers", "/faq", "/search", "/search?q=alpona",
];
const htmlCache = new Map();
for (const page of pages) {
  const res = await fetch(base + page);
  const html = await res.text();
  htmlCache.set(page, html);
  check(`Page renders ${page}`, res.status === 200 && html.includes("MITSU"));
}
const missing = await fetch(base + "/collections/does-not-exist");
check("Unknown collection returns 404", missing.status === 404, String(missing.status));
const redirect = await fetch(base + "/products/rangoli-art", { redirect: "manual" });
check("Old /products URLs redirect to /shop", [301, 307, 308].includes(redirect.status) && (redirect.headers.get("location") || "").endsWith("/shop/rangoli-art"), `${redirect.status} -> ${redirect.headers.get("location")}`);

// --- theme + structure from the reference --------------------------------------
const homeHtml = htmlCache.get("/");
const homeText = text(homeHtml);
check("Home shows reference hero copy", /Welcome to/.test(homeText) && /Create/.test(homeText) && /Inspire/.test(homeText) && /Bloom/.test(homeText));
check("Home has the six arch tabs linking to separate pages", ["/collections/art-and-crafts", "/collections/giftables", "/collections/lifestyle", "/shop", "/diy-ideas", "/more"].every((h) => homeHtml.includes(`href="${h}"`)));
check("Header nav matches reference order", ["/about", "/shop", "/creations", "/blog", "/contact"].every((h) => homeHtml.includes(`href="${h}"`)) && /Follow Us/.test(homeText));
check("Home about teaser present", /About Us/.test(homeText) && /Premium Quality/.test(homeText) && /Eco-Friendly/.test(homeText) && /Made with Love/.test(homeText));
check("Home stays short (no FAQ / long sections)", !/Before you order/.test(homeText) && !/How ordering works/.test(homeText));
check("FAQ page lives on its own route", /How do I place an order/.test(htmlCache.get("/faq")));
check("Home shows the special offers band", /Special Offers/.test(homeText) && /HELLO100/.test(homeText) && /Little extras/.test(homeText));
const offersHtml = htmlCache.get("/offers");
const offersText = text(offersHtml);
check("Offers page lists live offers with codes and terms", /HELLO100/.test(offersText) && /CARD5/.test(offersText) && /LIGHTS/.test(offersText) && /Valid until/.test(offersText));
const offerWa = [...offersHtml.matchAll(/https:\/\/wa\.me\/(\d+)/g)].map((m) => m[1]);
check("Offer claim links use the business number", offerWa.length > 0 && offerWa.every((n) => n === "919531983688"), `${offerWa.length} links`);
check("More hub links to Special Offers", htmlCache.get("/more").includes('href="/offers"'));
check("Search finds alpona content", /Alpona Art/.test(htmlCache.get("/search?q=alpona")) && /alpona lotus/i.test(htmlCache.get("/search?q=alpona")));
check("Home lists the real offerings", ["Alpona", "Rangolis", "Fabric paintings", "Designing arts", "Festive gift hampers", "Greeting cards", "Customised diaries"].every((w) => homeText.includes(w)) && /polaroids/i.test(homeText));
check("Home explains the three levels + minimal prices", /Basic, Premium and Customise/.test(homeText) && /minimal prices/.test(homeText));
const productText = text(htmlCache.get("/shop/rangoli-art"));
check("Product page offers Basic / Premium / Customise levels", /Choose your level/.test(productText) && /Basic/.test(productText) && /Premium/.test(productText) && /Customise/.test(productText) && /Quoted to you/.test(productText));
check("Collection page explains the levels", /Three levels in/.test(text(htmlCache.get("/collections/giftables"))));
check("No crochet copy left over", !/crochet/i.test(homeText) && !/crochet/i.test(text(htmlCache.get("/about"))) && !/crochet/i.test(text(htmlCache.get("/shop"))));

// --- contact details are centralised ---------------------------------------------
const contactHtml = htmlCache.get("/contact");
const mailtoLinks = [...contactHtml.matchAll(/mailto:([^"'?\\]+)/g)].map((m) => m[1]);
check("All mailto links use the business email", mailtoLinks.length > 0 && mailtoLinks.every((e) => e === "meetalij24@gmail.com"), `${mailtoLinks.length} links`);
const waLinks = [...contactHtml.matchAll(/https:\/\/wa\.me\/(\d+)/g)].map((m) => m[1]);
check("Contact-page WhatsApp links use the business number", waLinks.length > 0 && waLinks.every((n) => n === "919531983688"), `${waLinks.length} links`);
const footerWa = [...homeHtml.matchAll(/https:\/\/wa\.me\/(\d+)/g)].map((m) => m[1]);
check("Homepage/footer WhatsApp links use the business number", footerWa.length >= 2 && footerWa.every((n) => n === "919531983688"), `${footerWa.length} links`);
check("Footer email is the business email", homeHtml.includes("meetalij24@gmail.com"));
check("Product page WhatsApp enquiry uses the business number", htmlCache.get("/shop/rangoli-art").includes("wa.me/919531983688"));

// --- checkout client bundle -------------------------------------------------------
const cartHtml = htmlCache.get("/cart");
check("Checkout page sets honest expectations", /press Send/i.test(cartHtml) && /no automatic checkout/i.test(cartHtml));
const chunkUrls = [...new Set([...cartHtml.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]))];
let bundle = "";
for (const url of chunkUrls) bundle += await fetch(base + url).then((r) => r.text());
check("Checkout client bundle collects all four required fields", ["Full name", "WhatsApp number", "Delivery address", "Order notes", "Continue on WhatsApp"].every((label) => bundle.includes(label)), `${chunkUrls.length} chunks scanned`);
check("Checkout submits to the secure order API", bundle.includes("/api/orders"));
check("No secrets in client bundles", !/RESEND_API_KEY|re_[A-Za-z0-9]{20,}/.test(bundle));

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("FAILURES:", failed);
  process.exit(1);
}
