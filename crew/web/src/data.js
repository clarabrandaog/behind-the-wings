// data.js — async data layer.
// Single responsibility: fetch and parse the crew JSON. Returns a pure value
// (a Map keyed by person `id`) so the rest of the app never has to re-parse
// or look up by index.

const DEFAULT_URL = "crew.json";

/**
 * Fetch the crew roster.
 *
 * @param {string} [url] - Path or URL to a crew JSON file.
 * @returns {Promise<Map<number, Person>>} People keyed by their `id`.
 * @throws  {Error} On network or parse failures.
 *
 * @typedef {Object} Person
 * @property {number}   id
 * @property {string}   name
 * @property {string}   function
 * @property {string}  [location]
 * @property {string}  [description]
 * @property {string}  [social]
 * @property {string[]}[pastWork]
 * @property {string}  [color]
 * @property {string}  [photo]
 * @property {string}  [audio]
 */
export async function loadCrew(url = DEFAULT_URL) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  }
  const payload = await res.json();
  if (!payload || !Array.isArray(payload.people)) {
    throw new Error(`crew.json malformed — expected { people: [...] }`);
  }
  const byId = new Map();
  for (const person of payload.people) {
    if (typeof person.id !== "number") continue;
    byId.set(person.id, person);
  }
  return byId;
}
