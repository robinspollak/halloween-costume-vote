import { OTHER, matchGuests, nameKey } from "../lib/vote";

type Item = { label: string; value: string };

const OTHER_LABEL = "Other (please specify)";
const guests: string[] = JSON.parse(document.getElementById("guest-data")?.textContent ?? "[]");
const guestByKey = new Map(guests.map((g) => [g.toLowerCase(), g]));

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function highlight(label: string, query: string): string {
  const q = nameKey(query);
  const i = q ? label.toLowerCase().indexOf(q) : -1;
  if (i < 0) return escapeHtml(label);
  return (
    escapeHtml(label.slice(0, i)) +
    `<mark>${escapeHtml(label.slice(i, i + q.length))}</mark>` +
    escapeHtml(label.slice(i + q.length))
  );
}

function setupCombo(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>("input[role=combobox]")!;
  const list = root.querySelector<HTMLUListElement>(".combo-list")!;
  const hidden = root.querySelector<HTMLInputElement>("input[type=hidden]")!;
  const specify = root.querySelector<HTMLInputElement>(".specify")!;
  const caret = root.querySelector<HTMLElement>(".combo-caret")!;
  const error = root.parentElement!.querySelector<HTMLElement>("[data-error]")!;
  let items: Item[] = [];
  let active = 0;
  let query = "";

  function setPicked(value: string) {
    hidden.value = value;
    root.classList.toggle("picked", Boolean(value));
    caret.textContent = value ? "✓" : "▼";
    const other = value === OTHER;
    specify.hidden = !other;
    specify.required = other;
    if (value) error.hidden = true;
  }

  function render() {
    const matches = matchGuests(guests, query, Infinity);
    items = [...matches.map((g) => ({ label: g, value: g })), { label: OTHER_LABEL, value: OTHER }];
    active = Math.min(active, items.length - 1);
    list.innerHTML = items
      .map(
        (item, i) =>
          `<li role="option" id="${list.id}-${i}" data-i="${i}" class="${item.value === OTHER ? "other" : ""}" aria-selected="${i === active}">${
            item.value === OTHER ? escapeHtml(item.label) : highlight(item.label, query)
          }</li>`,
      )
      .join("");
    input.setAttribute("aria-activedescendant", `${list.id}-${active}`);
  }

  function open() {
    render();
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function close() {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }

  function move(delta: number) {
    active = (active + delta + items.length) % items.length;
    render();
    list.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }

  function pick(item: Item) {
    close();
    if (item.value === OTHER) {
      input.value = OTHER_LABEL;
      if (!specify.value && query.trim()) specify.value = query.trim();
      setPicked(OTHER);
      specify.focus();
    } else {
      input.value = item.label;
      setPicked(item.value);
    }
  }

  input.addEventListener("focus", () => {
    // Re-focusing a picked answer shows the whole list again; typing replaces it.
    query = hidden.value ? "" : input.value;
    active = 0;
    if (hidden.value) input.select();
    open();
  });

  input.addEventListener("input", () => {
    query = input.value;
    active = 0;
    setPicked("");
    open();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      list.hidden ? open() : move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter" && !list.hidden) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Escape") {
      close();
    }
  });

  input.addEventListener("blur", () => {
    close();
    // Typing a full guest name without tapping it still counts.
    if (!hidden.value) {
      const exact = guestByKey.get(nameKey(input.value));
      if (exact) pick({ label: exact, value: exact });
    }
  });

  // mousedown (not click) so the input doesn't blur and close the list first.
  list.addEventListener("mousedown", (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>("li[data-i]");
    if (!li) return;
    e.preventDefault();
    pick(items[Number(li.dataset.i)]);
  });

  return {
    validate(): boolean {
      const ok = hidden.value === OTHER ? specify.value.trim() !== "" : hidden.value !== "";
      if (!ok) {
        error.textContent =
          hidden.value === OTHER ? "Type their name." : "Pick a name from the list, or choose Other.";
        error.hidden = false;
      }
      return ok;
    },
    focus() {
      (hidden.value === OTHER ? specify : input).focus();
    },
  };
}

const form = document.querySelector<HTMLFormElement>("form[data-vote]");
if (form) {
  const combos = [...form.querySelectorAll<HTMLElement>("[data-combo]")].map(setupCombo);
  form.addEventListener("submit", (e) => {
    const bad = combos.filter((c) => !c.validate());
    if (bad.length) {
      e.preventDefault();
      bad[0].focus();
    }
  });
}
