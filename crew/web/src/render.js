// render.js — DOM rendering layer.
//
// Single responsibility: write profile data to the DOM and toggle the entry
// vs. profile views. Pure functions — no timers, no audio, no networking.
// The state machine in main.js decides *when* to call these.

let refs = null;

function getRefs() {
  if (refs) return refs;
  refs = {
    body: document.body,
    profile: document.querySelector(".profile"),
    avatar: document.getElementById("avatar"),
    name: document.getElementById("name"),
    role: document.getElementById("role"),
    location: document.getElementById("location"),
    description: document.getElementById("description"),
    social: document.getElementById("social"),
    pastList: document.getElementById("pastList"),
    status: document.getElementById("status"),
    cornerStatus: document.getElementById("cornerStatus"),
  };
  return refs;
}

/** Update the small status line shown on the entry page and over profiles. */
export function setStatus(msg) {
  const r = getRefs();
  if (r.status) r.status.textContent = msg;
  if (r.cornerStatus) r.cornerStatus.textContent = msg;
}

/**
 * Show a person's profile card. Sets every piece of text/image and flips the
 * page into "has-active" mode (the CSS handles the visual transition).
 *
 * @param {Object} person - A row from crew.json.
 */
export function showProfile(person) {
  if (!person) return;
  const r = getRefs();
  document.documentElement.style.setProperty(
    "--accent",
    person.color || "#5b21b6"
  );
  r.avatar.src = person.photo || "";
  r.avatar.alt = person.name || "";
  r.name.textContent = person.name || "";
  r.role.textContent = person.function || "";
  r.location.textContent = person.location || "";
  r.description.textContent = person.description || "";
  r.social.textContent = person.social || "";
  r.pastList.textContent = (person.pastWork || []).join(", ");
  r.profile.setAttribute("aria-hidden", "false");
  r.body.classList.add("has-active");
}

/** Hide the profile card and return to the entry view. */
export function hideProfile() {
  const r = getRefs();
  r.profile.setAttribute("aria-hidden", "true");
  r.body.classList.remove("has-active");
}
