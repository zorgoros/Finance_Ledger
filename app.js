const DB_NAME = "money-ledger-db";
const STORE_NAME = "transactions";
const AUDIT_STORE_NAME = "auditLog";
const DB_VERSION = 2;

const form = document.querySelector("#transactionForm");
const transactionId = document.querySelector("#transactionId");
const nameInput = document.querySelector("#name");
const personSuggestions = document.querySelector("#personSuggestions");
const amountInput = document.querySelector("#amount");
const transactionCurrencyInput = document.querySelector("#transactionCurrency");
const dateInput = document.querySelector("#date");
const iranianDateInput = document.querySelector("#iranianDate");
const noteInput = document.querySelector("#note");
const saveButton = document.querySelector("#saveButton");
const resetButton = document.querySelector("#resetButton");
const searchInput = document.querySelector("#search");
const statusFilter = document.querySelector("#statusFilter");
const peopleList = document.querySelector("#peopleList");
const recordsTable = document.querySelector("#recordsTable");
const peopleCount = document.querySelector("#peopleCount");
const totalOwedToMeToman = document.querySelector("#totalOwedToMeToman");
const totalOwedToMeUsd = document.querySelector("#totalOwedToMeUsd");
const totalIOweToman = document.querySelector("#totalIOweToman");
const totalIOweUsd = document.querySelector("#totalIOweUsd");
const netBalanceToman = document.querySelector("#netBalanceToman");
const netBalanceUsd = document.querySelector("#netBalanceUsd");
const rateInput = document.querySelector("#usdToTomanRate");
const ratePreview = document.querySelector("#ratePreview");
const convertAmountInput = document.querySelector("#convertAmount");
const convertFromInput = document.querySelector("#convertFrom");
const conversionResult = document.querySelector("#conversionResult");
const exportButton = document.querySelector("#exportButton");
const importButton = document.querySelector("#importButton");
const importFileInput = document.querySelector("#importFile");
const clearAllButton = document.querySelector("#clearAllButton");
const selectedPersonTitle = document.querySelector("#selectedPersonTitle");
const selectedPersonHint = document.querySelector("#selectedPersonHint");
const selectedPersonStatus = document.querySelector("#selectedPersonStatus");
const selectedPersonBalanceToman = document.querySelector("#selectedPersonBalanceToman");
const selectedPersonBalanceUsd = document.querySelector("#selectedPersonBalanceUsd");
const selectedPersonCount = document.querySelector("#selectedPersonCount");
const clearPersonButton = document.querySelector("#clearPersonButton");
const quickAmountInput = document.querySelector("#quickAmount");
const quickCurrencyInput = document.querySelector("#quickCurrency");
const quickNoteInput = document.querySelector("#quickNote");
const quickDebtButton = document.querySelector("#quickDebtButton");
const quickRepaymentButton = document.querySelector("#quickRepaymentButton");
const settleTomanButton = document.querySelector("#settleTomanButton");
const settleUsdButton = document.querySelector("#settleUsdButton");
const emptyStateTemplate = document.querySelector("#emptyStateTemplate");
const toast = document.querySelector("#toast");

let db;
let transactions = [];
let selectedPersonName = "";
let toastTimer;

const SEED_KEY = "money-ledger-farsi-notes-2026-06-19-v1";
const RATE_KEY = "money-ledger-usd-toman-rate";
const BACKUP_APP_NAME = "money-ledger";

function formatCurrency(amount, currency) {
  if (currency === "TOMAN") {
    return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(amount)} T`;
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function getRate() {
  return Number(rateInput.value) || 0;
}

function createCurrencyTotals() {
  return { USD: 0, TOMAN: 0 };
}

function normalizeCurrency(currency) {
  return currency === "TOMAN" ? "TOMAN" : "USD";
}

function addCurrencyAmount(totals, currency, amount) {
  totals[normalizeCurrency(currency)] += amount;
}

function getSignedAmount(transaction) {
  return transaction.direction === "theyOwe" ? transaction.amount : -transaction.amount;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(AUDIT_STORE_NAME)) {
        database.createObjectStore(AUDIT_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function createAuditEntry(action, details = {}) {
  return {
    id: crypto.randomUUID(),
    action,
    details,
    createdAt: Date.now(),
  };
}

function writeAuditEntry(store, action, details) {
  if (!action) return;
  store.put(createAuditEntry(action, details));
}

function storeTransaction(mode, value, audit = {}) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, AUDIT_STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const auditStore = tx.objectStore(AUDIT_STORE_NAME);

    if (mode === "put") store.put(value);
    if (mode === "delete") store.delete(value);
    if (mode === "clear") store.clear();
    writeAuditEntry(auditStore, audit.action, audit.details);

    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function storeTransactions(records, options = {}) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, AUDIT_STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const auditStore = tx.objectStore(AUDIT_STORE_NAME);

    if (options.clearExisting) store.clear();
    records.forEach((record) => store.put(record));
    writeAuditEntry(auditStore, options.audit?.action, options.audit?.details);

    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function getAllTransactions() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function normalizeName(value) {
  return value.trim().replace(/\s+/g, " ");
}

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function showToast(message) {
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
}

function renderFatalError(error) {
  const main = document.createElement("main");
  main.className = "shell";

  const panel = document.createElement("div");
  panel.className = "panel module-card";

  const title = document.createElement("h1");
  title.textContent = "Storage failed";

  const message = document.createElement("p");
  message.textContent = getErrorMessage(error, "The browser could not open local storage for this ledger.");

  panel.append(title, message);
  main.append(panel);
  document.body.replaceChildren(main);
}

function getDirectionLabel(direction) {
  return direction === "theyOwe" ? "I gave" : "I received";
}

function getStatusText(status) {
  if (status === "settled") return "Settled";
  if (status === "mixed") return "Mixed balance";
  if (status === "theyOwe") return "They owe you";
  return "You owe them";
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function renderRateTools() {
  const rate = getRate();
  ratePreview.textContent = rate ? formatCurrency(rate, "TOMAN") : "not set";

  const amount = Number(convertAmountInput.value);
  if (!rate || !amount) {
    conversionResult.textContent = rate ? "Enter an amount" : "Set a rate first";
    return;
  }

  if (convertFromInput.value === "USD") {
    conversionResult.textContent = formatCurrency(amount * rate, "TOMAN");
    return;
  }

  conversionResult.textContent = formatCurrency(amount / rate, "USD");
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isValidAmountForCurrency(amount, currency) {
  return Number.isFinite(amount) && amount > 0 && (normalizeCurrency(currency) !== "TOMAN" || Number.isInteger(amount));
}

function normalizeDateValue(value) {
  const date = typeof value === "string" ? value.trim() : "";
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

function normalizeRecordId(value) {
  const id = typeof value === "string" ? value.trim() : "";
  return /^[A-Za-z0-9._:-]+$/.test(id) ? id : crypto.randomUUID();
}

function normalizeImportedTransactions(backup) {
  if (!backup || typeof backup !== "object" || !Array.isArray(backup.transactions)) {
    throw new Error("Backup file must include a transactions array.");
  }

  const ids = new Set();
  return backup.transactions.map((transaction, index) => {
    const label = `Record ${index + 1}`;
    if (!transaction || typeof transaction !== "object" || Array.isArray(transaction)) {
      throw new Error(`${label} is not a valid transaction.`);
    }

    if (transaction.currency !== "USD" && transaction.currency !== "TOMAN") {
      throw new Error(`${label} has an unsupported currency.`);
    }

    if (transaction.direction !== "theyOwe" && transaction.direction !== "iOwe") {
      throw new Error(`${label} has an unsupported direction.`);
    }

    const name = normalizeName(String(transaction.name || ""));
    const amount = Number(transaction.amount);
    if (!name) throw new Error(`${label} is missing a name.`);
    if (!isValidAmountForCurrency(amount, transaction.currency)) {
      throw new Error(`${label} has an invalid amount for ${transaction.currency}.`);
    }

    const id = normalizeRecordId(transaction.id);
    if (ids.has(id)) throw new Error(`${label} repeats another transaction id.`);
    ids.add(id);

    const createdAt = Number(transaction.createdAt);
    return {
      id,
      name,
      amount,
      direction: transaction.direction,
      currency: transaction.currency,
      date: normalizeDateValue(transaction.date),
      iranianDate: typeof transaction.iranianDate === "string" ? transaction.iranianDate.trim() : "",
      note: typeof transaction.note === "string" ? transaction.note.trim() : "",
      createdAt: Number.isFinite(createdAt) ? createdAt : Date.now() + index,
    };
  });
}

function normalizeImportedRate(backup) {
  if (!Object.prototype.hasOwnProperty.call(backup, "usdToTomanRate")) return undefined;

  const value = String(backup.usdToTomanRate || "").trim();
  if (!value) return "";

  const rate = Number(value);
  if (!Number.isFinite(rate) || rate < 1) throw new Error("Backup rate must be at least 1 Toman.");
  return String(Math.round(rate));
}

function saveRate(value) {
  if (value) {
    localStorage.setItem(RATE_KEY, value);
    return;
  }

  localStorage.removeItem(RATE_KEY);
}

function updateAmountInputForCurrency() {
  const isToman = transactionCurrencyInput.value === "TOMAN";
  amountInput.step = isToman ? "1" : "0.01";
  amountInput.inputMode = isToman ? "numeric" : "decimal";
  amountInput.placeholder = isToman ? "1000000" : "250";
}

function updateQuickInputForCurrency() {
  const isToman = quickCurrencyInput.value === "TOMAN";
  quickAmountInput.step = isToman ? "1" : "0.01";
  quickAmountInput.inputMode = isToman ? "numeric" : "decimal";
  quickAmountInput.placeholder = isToman ? "1000000" : "Amount";
}

function buildBackup() {
  return {
    app: BACKUP_APP_NAME,
    version: 1,
    exportedAt: new Date().toISOString(),
    usdToTomanRate: rateInput.value.trim(),
    transactions,
  };
}

function exportBackup() {
  const backup = JSON.stringify(buildBackup(), null, 2);
  const blob = new Blob([backup], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `money-ledger-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function importBackupFile(file) {
  let backup;
  try {
    backup = JSON.parse(await file.text());
  } catch {
    throw new Error("Choose a valid JSON backup file.");
  }

  const importedTransactions = normalizeImportedTransactions(backup);
  const importedRate = normalizeImportedRate(backup);
  const recordLabel = importedTransactions.length === 1 ? "record" : "records";
  const confirmed = confirm(
    `Import ${importedTransactions.length} ${recordLabel} and replace every current record? This cannot be undone.`,
  );
  if (!confirmed) return false;

  await storeTransactions(importedTransactions, {
    clearExisting: true,
    audit: {
      action: "backup-imported",
      details: {
        importedCount: importedTransactions.length,
        replacedCount: transactions.length,
      },
    },
  });
  if (importedRate !== undefined) {
    rateInput.value = importedRate;
    saveRate(importedRate);
  }
  localStorage.setItem(SEED_KEY, "imported");
  selectedPersonName = "";
  searchInput.value = "";
  resetForm();
  await refresh();
  showToast(`Imported ${importedTransactions.length} ${recordLabel}`);
  return true;
}

function getFilteredTransactions() {
  const search = searchInput.value.trim().toLowerCase();
  const statusByName = new Map(groupByPerson(transactions).map((person) => [person.name, person.status]));

  return transactions.filter((transaction) => {
    const matchesSearch =
      !search ||
      transaction.name.toLowerCase().includes(search) ||
      (transaction.iranianDate || "").toLowerCase().includes(search) ||
      (transaction.note || "").toLowerCase().includes(search);

    if (!matchesSearch) return false;
    if (statusFilter.value === "all") return true;

    return statusByName.get(transaction.name) === statusFilter.value;
  });
}

function groupByPerson(records) {
  const people = new Map();

  records.forEach((transaction) => {
    const current = people.get(transaction.name) || {
      name: transaction.name,
      balances: createCurrencyTotals(),
      count: 0,
      lastDate: transaction.date,
    };

    addCurrencyAmount(current.balances, transaction.currency, getSignedAmount(transaction));
    current.count += 1;
    if (transaction.date && (!current.lastDate || transaction.date > current.lastDate)) {
      current.lastDate = transaction.date;
    }
    people.set(transaction.name, current);
  });

  return [...people.values()]
    .map((person) => {
      const hasPositive = person.balances.USD > 0 || person.balances.TOMAN > 0;
      const hasNegative = person.balances.USD < 0 || person.balances.TOMAN < 0;

      return {
        ...person,
        status: hasPositive && hasNegative ? "mixed" : hasPositive ? "theyOwe" : hasNegative ? "iOwe" : "settled",
      };
    })
    .sort(
      (a, b) =>
        Math.abs(b.balances.TOMAN) - Math.abs(a.balances.TOMAN) ||
        Math.abs(b.balances.USD) - Math.abs(a.balances.USD),
      );
}

function getPersonNames() {
  return groupByPerson(transactions).map((person) => person.name);
}

function getPersonSummary(name) {
  const person = groupByPerson(transactions).find((item) => item.name === name);
  if (person) return person;

  return {
    name,
    balances: createCurrencyTotals(),
    count: 0,
    lastDate: "",
    status: "settled",
  };
}

function renderTotals() {
  const current = groupByPerson(transactions).reduce(
    (acc, person) => {
      ["TOMAN", "USD"].forEach((currency) => {
        const amount = person.balances[currency];
        if (amount > 0) acc.owed[currency] += amount;
        if (amount < 0) acc.overpaid[currency] += Math.abs(amount);
        acc.net[currency] += amount;
      });
      return acc;
    },
    { owed: createCurrencyTotals(), overpaid: createCurrencyTotals(), net: createCurrencyTotals() },
  );

  totalOwedToMeToman.textContent = formatCurrency(current.owed.TOMAN, "TOMAN");
  totalOwedToMeUsd.textContent = formatCurrency(current.owed.USD, "USD");
  totalIOweToman.textContent = formatCurrency(current.overpaid.TOMAN, "TOMAN");
  totalIOweUsd.textContent = formatCurrency(current.overpaid.USD, "USD");
  netBalanceToman.textContent = formatCurrency(current.net.TOMAN, "TOMAN");
  netBalanceUsd.textContent = formatCurrency(current.net.USD, "USD");
}

function renderPersonSuggestions() {
  personSuggestions.replaceChildren();
  getPersonNames().forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    personSuggestions.append(option);
  });
}

function setQuickControlsEnabled(enabled) {
  [quickAmountInput, quickCurrencyInput, quickNoteInput, quickDebtButton, quickRepaymentButton].forEach((control) => {
    control.disabled = !enabled;
  });
}

function renderSelectedPerson() {
  if (!selectedPersonName) {
    selectedPersonTitle.textContent = "Choose a person";
    selectedPersonHint.textContent = "Click a person from the list to work without typing their name again.";
    selectedPersonStatus.textContent = "No person selected";
    selectedPersonBalanceToman.textContent = formatCurrency(0, "TOMAN");
    selectedPersonBalanceUsd.textContent = formatCurrency(0, "USD");
    selectedPersonCount.textContent = "0 records";
    settleTomanButton.disabled = true;
    settleUsdButton.disabled = true;
    settleTomanButton.textContent = "Settle Toman";
    settleUsdButton.textContent = "Settle Dollar";
    setQuickControlsEnabled(false);
    return;
  }

  const person = getPersonSummary(selectedPersonName);
  const tomanBalance = person.balances.TOMAN;
  const usdBalance = person.balances.USD;

  selectedPersonTitle.textContent = person.name;
  selectedPersonHint.textContent = "Use quick actions here for partial repayment, new debt, or full settlement.";
  selectedPersonStatus.textContent = getStatusText(person.status);
  selectedPersonBalanceToman.textContent = `${tomanBalance < 0 ? "-" : ""}${formatCurrency(Math.abs(tomanBalance), "TOMAN")}`;
  selectedPersonBalanceUsd.textContent = `${usdBalance < 0 ? "-" : ""}${formatCurrency(Math.abs(usdBalance), "USD")}`;
  selectedPersonCount.textContent = `${person.count} ${person.count === 1 ? "record" : "records"}`;
  settleTomanButton.disabled = tomanBalance === 0;
  settleUsdButton.disabled = usdBalance === 0;
  settleTomanButton.textContent = tomanBalance ? `Settle ${formatCurrency(Math.abs(tomanBalance), "TOMAN")}` : "Settle Toman";
  settleUsdButton.textContent = usdBalance ? `Settle ${formatCurrency(Math.abs(usdBalance), "USD")}` : "Settle Dollar";
  setQuickControlsEnabled(true);
}

function formatBalanceLines(balances) {
  const lines = [];
  if (balances.TOMAN) lines.push(`${balances.TOMAN < 0 ? "-" : ""}${formatCurrency(Math.abs(balances.TOMAN), "TOMAN")}`);
  if (balances.USD) lines.push(`${balances.USD < 0 ? "-" : ""}${formatCurrency(Math.abs(balances.USD), "USD")}`);
  return lines.length ? lines : [formatCurrency(0, "TOMAN"), formatCurrency(0, "USD")];
}

function renderPeople(records) {
  const matchingNames = new Set(records.map((transaction) => transaction.name));
  const people = groupByPerson(transactions).filter((person) => matchingNames.has(person.name));
  peopleCount.textContent = `${people.length} ${people.length === 1 ? "person" : "people"}`;
  peopleList.replaceChildren();

  if (!people.length) {
    peopleList.append(emptyStateTemplate.content.cloneNode(true));
    return;
  }

  people.forEach((person) => {
    const card = document.createElement("article");
    card.className = `person-card status-${person.status}${person.name === selectedPersonName ? " is-selected" : ""}`;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${person.name}`);
    card.dataset.personName = person.name;

    const statusText = getStatusText(person.status);
    const balanceLines = formatBalanceLines(person.balances)
      .map((line) => `<strong>${line}</strong>`)
      .join("");

    card.innerHTML = `
      <div>
        <p class="person-name" dir="auto"></p>
        <p class="person-meta">${person.count} record${person.count === 1 ? "" : "s"} - last ${formatDate(person.lastDate)}</p>
      </div>
      <div class="person-status status-${person.status}">
        <span>${statusText}</span>
        <div class="amount-stack">${balanceLines}</div>
      </div>
    `;

    card.querySelector(".person-name").textContent = person.name;
    peopleList.append(card);
  });
}

function renderTable(records) {
  recordsTable.replaceChildren();

  if (!records.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="7"></td>`;
    row.querySelector("td").append(emptyStateTemplate.content.cloneNode(true));
    recordsTable.append(row);
    return;
  }

  records
    .slice()
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.createdAt - a.createdAt)
    .forEach((transaction) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="record-name" dir="auto"></td>
        <td class="record-direction"></td>
        <td class="record-amount">${formatCurrency(transaction.amount, normalizeCurrency(transaction.currency))}</td>
        <td>${formatDate(transaction.date)}</td>
        <td class="record-iranian-date" dir="auto"></td>
        <td class="record-note" dir="auto"></td>
        <td>
          <div class="row-actions"></div>
        </td>
      `;

      const tag = document.createElement("span");
      tag.className = `tag ${transaction.direction === "theyOwe" ? "theyOwe" : "iOwe"}`;
      tag.textContent = getDirectionLabel(transaction.direction);

      const editButton = document.createElement("button");
      editButton.className = "mini-btn";
      editButton.type = "button";
      editButton.dataset.action = "edit";
      editButton.dataset.id = transaction.id;
      editButton.textContent = "Edit";

      const deleteButton = document.createElement("button");
      deleteButton.className = "mini-btn";
      deleteButton.type = "button";
      deleteButton.dataset.action = "delete";
      deleteButton.dataset.id = transaction.id;
      deleteButton.textContent = "Delete";

      row.querySelector(".record-direction").append(tag);
      row.querySelector(".record-name").textContent = transaction.name;
      row.querySelector(".record-iranian-date").textContent = transaction.iranianDate || "-";
      row.querySelector(".record-note").textContent = transaction.note || "-";
      row.querySelector(".row-actions").append(editButton, deleteButton);
      recordsTable.append(row);
    });
}

function render() {
  const filtered = getFilteredTransactions();
  renderTotals();
  renderPersonSuggestions();
  renderPeople(filtered);
  renderTable(filtered);
  renderSelectedPerson();
  renderRateTools();
}

async function refresh() {
  transactions = await getAllTransactions();
  render();
}

function resetForm() {
  form.reset();
  transactionId.value = "";
  if (selectedPersonName) nameInput.value = selectedPersonName;
  dateInput.value = "";
  iranianDateInput.value = "";
  updateAmountInputForCurrency();
  saveButton.textContent = "Save record";
}

function selectPerson(name, options = {}) {
  selectedPersonName = normalizeName(name);
  nameInput.value = selectedPersonName;
  if (options.filter !== false) searchInput.value = selectedPersonName;
  render();

  if (options.scroll !== false) {
    document.querySelector("#selectedPersonPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function clearSelectedPerson() {
  selectedPersonName = "";
  searchInput.value = "";
  resetForm();
  render();
}

function clearQuickInputs() {
  quickAmountInput.value = "";
  quickNoteInput.value = "";
}

async function saveQuickTransaction(direction, amount, currency, note) {
  const record = {
    id: crypto.randomUUID(),
    name: selectedPersonName,
    amount,
    direction,
    currency,
    date: getTodayDate(),
    iranianDate: "",
    note,
    createdAt: Date.now(),
  };

  await storeTransaction("put", record, {
    action: "record-created",
    details: { record },
  });
  clearQuickInputs();
  await refresh();
}

async function handleQuickTransaction(direction) {
  if (!selectedPersonName) return;

  const currency = normalizeCurrency(quickCurrencyInput.value);
  const amount = Number(quickAmountInput.value);
  if (!isValidAmountForCurrency(amount, currency)) {
    showToast(currency === "TOMAN" ? "Enter a whole Toman amount" : "Enter an amount greater than 0");
    return;
  }

  const defaultNote = direction === "theyOwe" ? "Quick debt" : "Quick repayment";
  try {
    await saveQuickTransaction(direction, amount, currency, quickNoteInput.value.trim() || defaultNote);
    showToast(direction === "theyOwe" ? "Debt added" : "Repayment recorded");
  } catch (error) {
    showToast(getErrorMessage(error, "Could not save quick record"));
  }
}

async function settleSelectedPerson(currency) {
  if (!selectedPersonName) return;

  const person = getPersonSummary(selectedPersonName);
  const balance = person.balances[currency];
  if (!balance) return;

  const direction = balance > 0 ? "iOwe" : "theyOwe";
  const amount = Math.abs(balance);
  const confirmed = confirm(`Settle ${formatCurrency(amount, currency)} for ${selectedPersonName}?`);
  if (!confirmed) return;

  try {
    await saveQuickTransaction(direction, amount, currency, `Full ${currency} settlement`);
    showToast(`${currency === "TOMAN" ? "Toman" : "Dollar"} balance settled`);
  } catch (error) {
    showToast(getErrorMessage(error, "Could not settle balance"));
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = normalizeName(nameInput.value);
  const amount = Number(amountInput.value);
  const direction = new FormData(form).get("direction");
  const currency = normalizeCurrency(transactionCurrencyInput.value);

  if (!name) {
    showToast("Enter a name");
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    showToast("Enter an amount greater than 0");
    return;
  }

  if (!isValidAmountForCurrency(amount, currency)) {
    showToast("Toman amounts must be whole numbers");
    return;
  }

  const existing = transactions.find((item) => item.id === transactionId.value);
  saveButton.disabled = true;
  saveButton.textContent = existing ? "Updating..." : "Saving...";
  const record = {
    id: transactionId.value || crypto.randomUUID(),
    name,
    amount,
    direction,
    currency,
    date: dateInput.value,
    iranianDate: iranianDateInput.value.trim(),
    note: noteInput.value.trim(),
    createdAt: existing?.createdAt || Date.now(),
  };

  try {
    await storeTransaction("put", record, {
      action: existing ? "record-updated" : "record-created",
      details: {
        before: existing || null,
        after: record,
      },
    });
    selectedPersonName = name;
    searchInput.value = name;
    resetForm();
    await refresh();
    showToast(existing ? "Record updated" : "Record saved");
  } catch (error) {
    showToast(getErrorMessage(error, "Could not save record"));
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = transactionId.value ? "Update record" : "Save record";
  }
});

recordsTable.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const record = transactions.find((item) => item.id === button.dataset.id);
  if (!record) return;

  if (button.dataset.action === "delete") {
    const confirmed = confirm(`Delete the record for ${record.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await storeTransaction("delete", record.id, {
        action: "record-deleted",
        details: { record },
      });
      await refresh();
      showToast("Record deleted");
    } catch (error) {
      showToast(getErrorMessage(error, "Could not delete record"));
    }
    return;
  }

  transactionId.value = record.id;
  nameInput.value = record.name;
  amountInput.value = record.amount;
  transactionCurrencyInput.value = normalizeCurrency(record.currency);
  updateAmountInputForCurrency();
  dateInput.value = record.date || "";
  iranianDateInput.value = record.iranianDate || "";
  noteInput.value = record.note || "";
  form.elements.direction.value = record.direction;
  saveButton.textContent = "Update record";
  selectedPersonName = record.name;
  searchInput.value = record.name;
  render();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});

peopleList.addEventListener("click", (event) => {
  const card = event.target.closest(".person-card");
  if (!card) return;
  selectPerson(card.dataset.personName || "");
});

peopleList.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".person-card");
  if (!card) return;
  event.preventDefault();
  card.click();
});

clearAllButton.addEventListener("click", async () => {
  if (!transactions.length) return;
  const confirmed = confirm("Delete every saved record? This cannot be undone.");
  if (!confirmed) return;
  clearAllButton.disabled = true;
  try {
    await storeTransaction("clear", null, {
      action: "records-cleared",
      details: { clearedCount: transactions.length },
    });
    selectedPersonName = "";
    searchInput.value = "";
    resetForm();
    await refresh();
    showToast("All records deleted");
  } catch (error) {
    showToast(getErrorMessage(error, "Could not delete records"));
  } finally {
    clearAllButton.disabled = false;
  }
});

resetButton.addEventListener("click", resetForm);
transactionCurrencyInput.addEventListener("change", updateAmountInputForCurrency);
quickCurrencyInput.addEventListener("change", updateQuickInputForCurrency);
nameInput.addEventListener("change", () => {
  const name = normalizeName(nameInput.value);
  if (getPersonNames().includes(name)) selectPerson(name, { filter: false, scroll: false });
});
clearPersonButton.addEventListener("click", clearSelectedPerson);
quickDebtButton.addEventListener("click", () => handleQuickTransaction("theyOwe"));
quickRepaymentButton.addEventListener("click", () => handleQuickTransaction("iOwe"));
settleTomanButton.addEventListener("click", () => settleSelectedPerson("TOMAN"));
settleUsdButton.addEventListener("click", () => settleSelectedPerson("USD"));
searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);
rateInput.addEventListener("input", () => {
  saveRate(rateInput.value);
  render();
});
convertAmountInput.addEventListener("input", renderRateTools);
convertFromInput.addEventListener("change", renderRateTools);
exportButton.addEventListener("click", () => {
  try {
    exportBackup();
    showToast(`Exported ${transactions.length} ${transactions.length === 1 ? "record" : "records"}`);
  } catch (error) {
    showToast(getErrorMessage(error, "Could not export backup"));
  }
});
importButton.addEventListener("click", () => importFileInput.click());
importFileInput.addEventListener("change", async () => {
  const [file] = importFileInput.files || [];
  if (!file) return;

  importButton.disabled = true;
  try {
    await importBackupFile(file);
  } catch (error) {
    showToast(getErrorMessage(error, "Could not import backup"));
  } finally {
    importButton.disabled = false;
    importFileInput.value = "";
  }
});

async function init() {
  rateInput.value = localStorage.getItem(RATE_KEY) || "";
  updateAmountInputForCurrency();
  updateQuickInputForCurrency();
  db = await openDatabase();
  await importSeedTransactions();
  await refresh();
}

async function importSeedTransactions() {
  // Legacy flag only: personal seed records are intentionally no longer stored in source code.
  if (!localStorage.getItem(SEED_KEY)) localStorage.setItem(SEED_KEY, "disabled");
}

init().catch(renderFatalError);
