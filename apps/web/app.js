const API_BASE = "/api";

const form = document.querySelector("#transactionForm");
const transactionId = document.querySelector("#transactionId");
const nameInput = document.querySelector("#name");
const personSuggestions = document.querySelector("#personSuggestions");
const amountInput = document.querySelector("#amount");
const transactionCurrencyInput = document.querySelector("#transactionCurrency");
const dateModeInput = document.querySelector("#dateMode");
const gregorianDatePanel = document.querySelector("#gregorianDatePanel");
const dateInput = document.querySelector("#date");
const persianPicker = document.querySelector("#persianPicker");
const persianYearInput = document.querySelector("#persianYear");
const persianMonthInput = document.querySelector("#persianMonth");
const persianDayInput = document.querySelector("#persianDay");
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
const languageSelect = document.querySelector("#languageSelect");
const themeToggle = document.querySelector("#themeToggle");
const themeToggleLabel = document.querySelector("#themeToggleLabel");
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

let transactions = [];
let selectedPersonName = "";
let toastTimer;
let currentLanguage = "en";
let currentTheme = "light";

const RATE_KEY = "money-ledger-usd-toman-rate";
const LANGUAGE_KEY = "money-ledger-language";
const THEME_KEY = "money-ledger-theme";
const BACKUP_APP_NAME = "money-ledger";

const persianMonthNames = {
  en: ["Farvardin", "Ordibehesht", "Khordad", "Tir", "Mordad", "Shahrivar", "Mehr", "Aban", "Azar", "Dey", "Bahman", "Esfand"],
  fa: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"],
};

const translations = {
  en: {
    addDebt: "Add debt",
    addRecord: "Add record",
    allBalances: "All balances",
    allRecords: "All records",
    amount: "Amount",
    amountGreaterThanZero: "Enter an amount greater than 0",
    amountPlaceholder: "Amount",
    appTitle: "Money Ledger",
    backupRateInvalid: "Backup rate must be at least 1 Toman.",
    balances: "Balances",
    choosePerson: "Choose a person",
    choosePersonHint: "Click a person from the list to work without typing their name again.",
    clear: "Clear",
    convert: "Convert",
    converter: "Converter",
    couldNotDeleteRecord: "Could not delete record",
    couldNotDeleteRecords: "Could not delete records",
    couldNotExportBackup: "Could not export backup",
    couldNotImportBackup: "Could not import backup",
    couldNotSaveQuickRecord: "Could not save quick record",
    couldNotSaveRecord: "Could not save record",
    couldNotSettleBalance: "Could not settle balance",
    currency: "Currency",
    darkTheme: "Dark",
    datePicker: "Date picker",
    debtAdded: "Debt added",
    delete: "Delete",
    deleteAll: "Delete all",
    deleteAllConfirm: "Delete every saved record? This cannot be undone.",
    deleteRecordConfirm: "Delete the record for {name}? This cannot be undone.",
    direction: "Direction",
    dollarBalanceSettled: "Dollar balance settled",
    edit: "Edit",
    emptyHint: "Add a person and record the first money movement.",
    enterAmount: "Enter an amount",
    enterName: "Enter a name",
    entry: "Entry",
    export: "Export",
    exportedRecords: "Exported {count} {label}",
    from: "From",
    fullSettlementNote: "Full {currency} settlement",
    gregorianCalendar: "Gregorian",
    iGave: "I gave",
    iOweOverpaid: "I owe / overpaid",
    iReceived: "I received",
    import: "Import",
    importedRecords: "Imported {count} {label}",
    importConfirm: "Import {count} {label} and replace every current record? This cannot be undone.",
    importFormat: "Import file format",
    importFormatHint: "Import accepts a JSON backup and replaces every current record after confirmation. Files exported from this dashboard already match this format.",
    internationalDate: "International date",
    invalidBackupJson: "Choose a valid JSON backup file.",
    invalidRecordAmount: "{label} has an invalid amount for {currency}.",
    invalidRecordCurrency: "{label} has an unsupported currency.",
    invalidRecordDirection: "{label} has an unsupported direction.",
    invalidTransaction: "{label} is not a valid transaction.",
    iranianDate: "Iranian date",
    language: "Language",
    lightTheme: "Light",
    localLedger: "Local ledger",
    manage: "Manage",
    manyPeople: "{count} people",
    manyRecords: "{count} records",
    missingName: "{label} is missing a name.",
    mixed: "Mixed",
    mixedBalance: "Mixed balance",
    name: "Name",
    namePlaceholder: "Pick or type a person",
    netBalance: "Net balance",
    noPersonSelected: "No person selected",
    noRecordsYet: "No records yet",
    notSet: "not set",
    note: "Note",
    notePlaceholder: "Reason or detail",
    onePerson: "1 person",
    oneRecord: "1 record",
    optionalNote: "Optional note",
    people: "People",
    peopleHint: "Click a name to open that person, then add debt, record a partial repayment, or settle fully.",
    personMeta: "{records} - last {date}",
    persianCalendar: "Persian",
    persianDay: "Persian day",
    persianMonth: "Persian month",
    persianYear: "Persian year",
    quickAmount: "Quick amount",
    quickDebtNote: "Quick debt",
    quickNote: "Quick note",
    quickRepaymentNote: "Quick repayment",
    rate: "Rate",
    recordDeleted: "Record deleted",
    recordRepayment: "Record repayment",
    recordSaved: "Record saved",
    recordsCleared: "All records deleted",
    recordUpdated: "Record updated",
    repeatedId: "{label} repeats another transaction id.",
    repaymentRecorded: "Repayment recorded",
    result: "Result",
    saveRecord: "Save record",
    saving: "Saving...",
    searchPlaceholder: "Search people or notes",
    selectedPerson: "Selected person",
    selectedPersonActiveHint: "Use quick actions here for partial repayment, new debt, or full settlement.",
    settleAmount: "Settle {amount}",
    settleDollar: "Settle Dollar",
    settleToman: "Settle Toman",
    settleConfirm: "Settle {amount} for {name}?",
    setRateFirst: "Set a rate first",
    settled: "Settled",
    storageFailed: "Storage failed",
    storageFailedMessage: "The local ledger database could not be reached.",
    switchToDark: "Switch to dark theme",
    switchToLight: "Switch to light theme",
    theyOweMe: "They owe me",
    theyOweYou: "They owe you",
    timeline: "Timeline",
    tomanAmountWhole: "Toman amounts must be whole numbers. Remove decimals.",
    tomanOption: "Toman (T)",
    tomanShort: "Toman",
    tomanUnit: "T",
    tomanWholeQuick: "Enter a whole Toman amount. Remove decimals.",
    tomanBalanceSettled: "Toman balance settled",
    unsupportedBackup: "Backup file must include a transactions array.",
    updateRecord: "Update record",
    updating: "Updating...",
    usdOption: "Dollar ($)",
    youOweOverpaid: "You owe / overpaid",
    youOweThem: "You owe them",
    zeroPeople: "0 people",
    zeroRecords: "0 records",
  },
  fa: {
    addDebt: "افزایش بدهی",
    addRecord: "ثبت رکورد",
    allBalances: "همه مانده‌ها",
    allRecords: "همه رکوردها",
    amount: "مبلغ",
    amountGreaterThanZero: "مبلغی بیشتر از صفر وارد کنید",
    amountPlaceholder: "مبلغ",
    appTitle: "دفتر حساب",
    backupRateInvalid: "نرخ فایل باید حداقل ۱ تومان باشد.",
    balances: "مانده‌ها",
    choosePerson: "یک شخص را انتخاب کنید",
    choosePersonHint: "روی نام یک شخص بزنید تا بدون تایپ دوباره نام، حساب او را ویرایش کنید.",
    clear: "پاک کردن",
    convert: "تبدیل",
    converter: "مبدل",
    couldNotDeleteRecord: "حذف رکورد انجام نشد",
    couldNotDeleteRecords: "حذف رکوردها انجام نشد",
    couldNotExportBackup: "خروجی گرفتن انجام نشد",
    couldNotImportBackup: "ورود داده انجام نشد",
    couldNotSaveQuickRecord: "ثبت سریع انجام نشد",
    couldNotSaveRecord: "ذخیره رکورد انجام نشد",
    couldNotSettleBalance: "تسویه انجام نشد",
    currency: "ارز",
    darkTheme: "تاریک",
    datePicker: "تقویم",
    debtAdded: "بدهی اضافه شد",
    delete: "حذف",
    deleteAll: "حذف همه",
    deleteAllConfirm: "همه رکوردهای ذخیره‌شده حذف شوند؟ این کار قابل برگشت نیست.",
    deleteRecordConfirm: "رکورد مربوط به {name} حذف شود؟ این کار قابل برگشت نیست.",
    direction: "جهت",
    dollarBalanceSettled: "مانده دلار تسویه شد",
    edit: "ویرایش",
    emptyHint: "یک شخص اضافه کنید و اولین جابه‌جایی پول را ثبت کنید.",
    enterAmount: "مبلغ را وارد کنید",
    enterName: "نام را وارد کنید",
    entry: "ثبت",
    export: "خروجی",
    exportedRecords: "{count} {label} خروجی گرفته شد",
    from: "از",
    fullSettlementNote: "تسویه کامل {currency}",
    gregorianCalendar: "میلادی",
    iGave: "پول دادم",
    iOweOverpaid: "بدهی من / اضافه پرداخت",
    iReceived: "پول گرفتم",
    import: "ورود داده",
    importedRecords: "{count} {label} وارد شد",
    importConfirm: "{count} {label} وارد شود و همه رکوردهای فعلی جایگزین شوند؟ این کار قابل برگشت نیست.",
    importFormat: "فرمت فایل ورود داده",
    importFormatHint: "ورود داده یک فایل پشتیبان JSON را می‌پذیرد و بعد از تایید، همه رکوردهای فعلی را جایگزین می‌کند. فایل‌های خروجی همین داشبورد آماده ورود هستند.",
    internationalDate: "تاریخ میلادی",
    invalidBackupJson: "یک فایل JSON معتبر انتخاب کنید.",
    invalidRecordAmount: "{label} مبلغ معتبر برای {currency} ندارد.",
    invalidRecordCurrency: "{label} ارز پشتیبانی‌نشده دارد.",
    invalidRecordDirection: "{label} جهت پشتیبانی‌نشده دارد.",
    invalidTransaction: "{label} تراکنش معتبر نیست.",
    iranianDate: "تاریخ شمسی",
    language: "زبان",
    lightTheme: "روشن",
    localLedger: "دفتر محلی",
    manage: "مدیریت",
    manyPeople: "{count} نفر",
    manyRecords: "{count} رکورد",
    missingName: "{label} نام ندارد.",
    mixed: "ترکیبی",
    mixedBalance: "مانده ترکیبی",
    name: "نام",
    namePlaceholder: "انتخاب یا تایپ نام",
    netBalance: "مانده خالص",
    noPersonSelected: "شخصی انتخاب نشده",
    noRecordsYet: "هنوز رکوردی نیست",
    notSet: "تنظیم نشده",
    note: "یادداشت",
    notePlaceholder: "دلیل یا توضیح",
    onePerson: "۱ نفر",
    oneRecord: "۱ رکورد",
    optionalNote: "یادداشت اختیاری",
    people: "اشخاص",
    peopleHint: "روی نام بزنید؛ سپس بدهی اضافه کنید، پرداخت جزئی ثبت کنید یا کامل تسویه کنید.",
    personMeta: "{records} - آخرین {date}",
    persianCalendar: "شمسی",
    persianDay: "روز شمسی",
    persianMonth: "ماه شمسی",
    persianYear: "سال شمسی",
    quickAmount: "مبلغ سریع",
    quickDebtNote: "بدهی سریع",
    quickNote: "یادداشت سریع",
    quickRepaymentNote: "پرداخت سریع",
    rate: "نرخ",
    recordDeleted: "رکورد حذف شد",
    recordRepayment: "ثبت پرداختی",
    recordSaved: "رکورد ذخیره شد",
    recordsCleared: "همه رکوردها حذف شدند",
    recordUpdated: "رکورد به‌روزرسانی شد",
    repeatedId: "{label} شناسه تکراری دارد.",
    repaymentRecorded: "پرداخت ثبت شد",
    result: "نتیجه",
    saveRecord: "ذخیره رکورد",
    saving: "در حال ذخیره...",
    searchPlaceholder: "جستجوی شخص یا یادداشت",
    selectedPerson: "شخص انتخاب‌شده",
    selectedPersonActiveHint: "برای پرداخت جزئی، بدهی جدید یا تسویه کامل از دکمه‌های سریع استفاده کنید.",
    settleAmount: "تسویه {amount}",
    settleDollar: "تسویه دلار",
    settleToman: "تسویه تومان",
    settleConfirm: "{amount} برای {name} تسویه شود؟",
    setRateFirst: "اول نرخ را وارد کنید",
    settled: "تسویه شده",
    storageFailed: "خطای ذخیره‌سازی",
    storageFailedMessage: "پایگاه داده محلی این دفتر در دسترس نیست.",
    switchToDark: "تغییر به حالت تاریک",
    switchToLight: "تغییر به حالت روشن",
    theyOweMe: "بدهکارند",
    theyOweYou: "طلب شما",
    timeline: "تاریخچه",
    tomanAmountWhole: "مبلغ تومان باید عدد صحیح باشد. اعشار را حذف کنید.",
    tomanOption: "تومان (T)",
    tomanShort: "تومان",
    tomanUnit: "تومان",
    tomanWholeQuick: "مبلغ تومان را به صورت عدد صحیح وارد کنید. اعشار را حذف کنید.",
    tomanBalanceSettled: "مانده تومان تسویه شد",
    unsupportedBackup: "فایل پشتیبان باید آرایه transactions داشته باشد.",
    updateRecord: "به‌روزرسانی رکورد",
    updating: "در حال به‌روزرسانی...",
    usdOption: "دلار ($)",
    youOweOverpaid: "بدهی / اضافه پرداخت",
    youOweThem: "شما بدهکارید",
    zeroPeople: "۰ نفر",
    zeroRecords: "۰ رکورد",
  },
};

function t(key, values = {}) {
  const phrase = translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;
  return phrase.replace(/\{(\w+)\}/g, (_, valueKey) => values[valueKey] ?? "");
}

function getLocale() {
  return currentLanguage === "fa" ? "fa-IR" : undefined;
}

function getRecordLabel(count) {
  return t(count === 1 ? "oneRecord" : "manyRecords", { count });
}

function getPeopleLabel(count) {
  return t(count === 1 ? "onePerson" : "manyPeople", { count });
}

function updateStaticText() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
}

function updateSaveButtonLabel() {
  saveButton.textContent = transactionId.value ? t("updateRecord") : t("saveRecord");
}

function applyTheme(theme, options = {}) {
  currentTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = currentTheme;
  themeToggle.setAttribute("aria-pressed", String(currentTheme === "dark"));
  themeToggle.setAttribute("aria-label", t(currentTheme === "dark" ? "switchToLight" : "switchToDark"));
  themeToggleLabel.textContent = t(currentTheme === "dark" ? "lightTheme" : "darkTheme");

  if (options.save !== false) setSetting(THEME_KEY, currentTheme).catch((error) => showToast(getErrorMessage(error, "Could not save theme.")));
}

function applyLanguage(language, options = {}) {
  currentLanguage = language === "fa" ? "fa" : "en";
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "fa" ? "rtl" : "ltr";
  languageSelect.value = currentLanguage;
  updateStaticText();
  updateSaveButtonLabel();
  if (dateInput.value) setPersianPickerFromDate(dateInput.value);
  else populatePersianPicker();
  applyTheme(currentTheme, { save: false });

  if (options.save !== false) setSetting(LANGUAGE_KEY, currentLanguage).catch((error) => showToast(getErrorMessage(error, "Could not save language.")));
  if (options.render !== false) render();
}

function formatCurrency(amount, currency) {
  if (currency === "TOMAN") {
    return `${new Intl.NumberFormat(getLocale(), { maximumFractionDigits: 0 }).format(amount)} ${t("tomanUnit")}`;
  }

  return new Intl.NumberFormat(getLocale(), {
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

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

async function storeTransaction(mode, value, audit = {}) {
  if (mode === "put") {
    const isUpdate = audit.action === "record-updated";
    const path = isUpdate ? `/transactions/${encodeURIComponent(value.id)}` : "/transactions";
    const method = isUpdate ? "PUT" : "POST";
    await apiRequest(path, { method, body: JSON.stringify({ transaction: value, audit }) });
    return;
  }

  if (mode === "delete") {
    await apiRequest(`/transactions/${encodeURIComponent(value)}`, { method: "DELETE", body: JSON.stringify({ audit }) });
    return;
  }

  if (mode === "clear") {
    await apiRequest("/transactions", { method: "DELETE", body: JSON.stringify({ audit }) });
  }
}

async function storeTransactions(records, options = {}) {
  if (!options.clearExisting) {
    await Promise.all(records.map((record) => storeTransaction("put", record)));
    return;
  }

  await apiRequest("/import", {
    method: "POST",
    body: JSON.stringify({ transactions: records, audit: options.audit }),
  });
}

async function getAllTransactions() {
  const data = await apiRequest("/transactions");
  return data.transactions || [];
}

async function getSetting(key) {
  const data = await apiRequest(`/settings/${encodeURIComponent(key)}`);
  return data.value || "";
}

async function setSetting(key, value) {
  await apiRequest(`/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
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
  main.className = "app-shell";

  const panel = document.createElement("div");
  panel.className = "panel";

  const title = document.createElement("h1");
  const serverRequired = error instanceof Error && error.message.startsWith("SERVER_REQUIRED:");
  title.textContent = serverRequired ? "Open Money Ledger" : t("storageFailed");

  const message = document.createElement("p");
  message.textContent = serverRequired ? error.message.slice("SERVER_REQUIRED:".length).trim() : getErrorMessage(error, t("storageFailedMessage"));

  panel.append(title, message);
  main.append(panel);
  document.body.replaceChildren(main);
}

function getDirectionLabel(direction) {
  return direction === "theyOwe" ? t("iGave") : t("iReceived");
}

function getStatusText(status) {
  if (status === "settled") return t("settled");
  if (status === "mixed") return t("mixedBalance");
  if (status === "theyOwe") return t("theyOweYou");
  return t("youOweThem");
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function div(a, b) {
  return Math.trunc(a / b);
}

function mod(a, b) {
  return a - Math.trunc(a / b) * b;
}

function jalCal(jy) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm = breaks[1];
  let jump = jm - jp;

  if (jy < jp || jy >= breaks[bl - 1]) return null;

  for (let i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }

  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;

  return { leap, gy, march };
}

function g2d(gy, gm, gd) {
  return (
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408 -
    div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) +
    752
  );
}

function d2g(jdn) {
  let j = 4 * jdn + 139361631;
  j += div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function j2d(jy, jm, jd) {
  const r = jalCal(jy);
  if (!r) return null;
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function d2j(jdn) {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;

  if (k >= 0) {
    if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }

  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

function toGregorian(jy, jm, jd) {
  const jdn = j2d(jy, jm, jd);
  return jdn ? d2g(jdn) : null;
}

function toPersian(gy, gm, gd) {
  return d2j(g2d(gy, gm, gd));
}

function isLeapPersianYear(jy) {
  const r = jalCal(jy);
  return !!r && r.leap === 0;
}

function getPersianMonthLength(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapPersianYear(jy) ? 30 : 29;
}

function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return null;
  return { gy: Number(match[1]), gm: Number(match[2]), gd: Number(match[3]) };
}

function formatIsoDate(gy, gm, gd) {
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

function formatPersianDate(jy, jm, jd) {
  const numberFormat = new Intl.NumberFormat(getLocale(), { useGrouping: false });
  return `${numberFormat.format(jd)} ${persianMonthNames[currentLanguage][jm - 1]} ${numberFormat.format(jy)}`;
}

function renderRateTools() {
  const rate = getRate();
  ratePreview.textContent = rate ? formatCurrency(rate, "TOMAN") : t("notSet");

  const amount = Number(convertAmountInput.value);
  if (!rate || !amount) {
    conversionResult.textContent = rate ? t("enterAmount") : t("setRateFirst");
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

  return new Date(`${date}T00:00:00`).toLocaleDateString(getLocale(), {
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
    throw new Error(t("unsupportedBackup"));
  }

  const ids = new Set();
  return backup.transactions.map((transaction, index) => {
    const label = `Record ${index + 1}`;
    if (!transaction || typeof transaction !== "object" || Array.isArray(transaction)) {
      throw new Error(t("invalidTransaction", { label }));
    }

    if (transaction.currency !== "USD" && transaction.currency !== "TOMAN") {
      throw new Error(t("invalidRecordCurrency", { label }));
    }

    if (transaction.direction !== "theyOwe" && transaction.direction !== "iOwe") {
      throw new Error(t("invalidRecordDirection", { label }));
    }

    const name = normalizeName(String(transaction.name || ""));
    const amount = Number(transaction.amount);
    if (!name) throw new Error(t("missingName", { label }));
    if (!isValidAmountForCurrency(amount, transaction.currency)) {
      throw new Error(t("invalidRecordAmount", { label, currency: transaction.currency }));
    }

    const id = normalizeRecordId(transaction.id);
    if (ids.has(id)) throw new Error(t("repeatedId", { label }));
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
  if (!Number.isFinite(rate) || rate < 1) throw new Error(t("backupRateInvalid"));
  return String(Math.round(rate));
}

function saveRate(value) {
  setSetting(RATE_KEY, value || "").catch((error) => showToast(getErrorMessage(error, "Could not save rate.")));
}

function updateAmountInputForCurrency() {
  const isToman = transactionCurrencyInput.value === "TOMAN";
  amountInput.min = isToman ? "1" : "0.01";
  amountInput.step = isToman ? "1" : "0.01";
  amountInput.inputMode = isToman ? "numeric" : "decimal";
  amountInput.placeholder = isToman ? "1000000" : "250";
}

function updateQuickInputForCurrency() {
  const isToman = quickCurrencyInput.value === "TOMAN";
  quickAmountInput.min = isToman ? "1" : "0.01";
  quickAmountInput.step = isToman ? "1" : "0.01";
  quickAmountInput.inputMode = isToman ? "numeric" : "decimal";
  quickAmountInput.placeholder = isToman ? "1000000" : t("amountPlaceholder");
}

function createSelectOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function populatePersianYearOptions(selectedYear = "") {
  const parsedToday = parseIsoDate(getTodayDate());
  const currentPersianYear = toPersian(parsedToday.gy, parsedToday.gm, parsedToday.gd).jy;
  const years = new Set();
  for (let year = currentPersianYear - 20; year <= currentPersianYear + 10; year += 1) years.add(year);
  if (selectedYear) years.add(Number(selectedYear));

  persianYearInput.replaceChildren(createSelectOption("", "-"));
  [...years].sort((a, b) => b - a).forEach((year) => {
    persianYearInput.append(createSelectOption(String(year), new Intl.NumberFormat(getLocale(), { useGrouping: false }).format(year)));
  });
  persianYearInput.value = selectedYear ? String(selectedYear) : "";
}

function populatePersianMonthOptions(selectedMonth = "") {
  persianMonthInput.replaceChildren(createSelectOption("", "-"));
  persianMonthNames[currentLanguage].forEach((month, index) => {
    persianMonthInput.append(createSelectOption(String(index + 1), month));
  });
  persianMonthInput.value = selectedMonth ? String(selectedMonth) : "";
}

function populatePersianDayOptions(selectedDay = "") {
  const year = Number(persianYearInput.value);
  const month = Number(persianMonthInput.value);
  const maxDay = year && month ? getPersianMonthLength(year, month) : 31;
  const numberFormat = new Intl.NumberFormat(getLocale(), { useGrouping: false });

  persianDayInput.replaceChildren(createSelectOption("", "-"));
  for (let day = 1; day <= maxDay; day += 1) {
    persianDayInput.append(createSelectOption(String(day), numberFormat.format(day)));
  }
  persianDayInput.value = selectedDay && Number(selectedDay) <= maxDay ? String(selectedDay) : "";
}

function populatePersianPicker(values = {}) {
  populatePersianYearOptions(values.jy ? String(values.jy) : persianYearInput.value);
  populatePersianMonthOptions(values.jm ? String(values.jm) : persianMonthInput.value);
  populatePersianDayOptions(values.jd ? String(values.jd) : persianDayInput.value);
}

function clearPersianPicker() {
  populatePersianYearOptions("");
  populatePersianMonthOptions("");
  populatePersianDayOptions("");
}

function setPersianPickerFromDate(isoDate) {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    clearPersianPicker();
    return;
  }

  const persianDate = toPersian(parsed.gy, parsed.gm, parsed.gd);
  populatePersianPicker(persianDate);
  iranianDateInput.value = formatPersianDate(persianDate.jy, persianDate.jm, persianDate.jd);
}

function syncGregorianToPersianDate() {
  if (!dateInput.value) {
    clearPersianPicker();
    if (dateModeInput.value === "gregorian") iranianDateInput.value = "";
    return;
  }

  setPersianPickerFromDate(dateInput.value);
}

function syncPersianToGregorianDate() {
  const jy = Number(persianYearInput.value);
  const jm = Number(persianMonthInput.value);
  populatePersianDayOptions(persianDayInput.value);
  const jd = Number(persianDayInput.value);

  if (!jy || !jm || !jd) {
    dateInput.value = "";
    iranianDateInput.value = "";
    return;
  }

  const gregorianDate = toGregorian(jy, jm, jd);
  if (!gregorianDate) return;
  dateInput.value = formatIsoDate(gregorianDate.gy, gregorianDate.gm, gregorianDate.gd);
  iranianDateInput.value = formatPersianDate(jy, jm, jd);
}

function updateDateMode() {
  const isPersian = dateModeInput.value === "persian";
  gregorianDatePanel.hidden = isPersian;
  persianPicker.hidden = !isPersian;

  if (isPersian) {
    if (dateInput.value) setPersianPickerFromDate(dateInput.value);
    else clearPersianPicker();
    return;
  }

  syncGregorianToPersianDate();
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
    throw new Error(t("invalidBackupJson"));
  }

  const importedTransactions = normalizeImportedTransactions(backup);
  const importedRate = normalizeImportedRate(backup);
  const recordLabel = getRecordLabel(importedTransactions.length);
  const confirmed = confirm(
    t("importConfirm", { count: importedTransactions.length, label: recordLabel }),
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
  selectedPersonName = "";
  searchInput.value = "";
  resetForm();
  await refresh();
  showToast(t("importedRecords", { count: importedTransactions.length, label: recordLabel }));
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
    selectedPersonTitle.textContent = t("choosePerson");
    selectedPersonHint.textContent = t("choosePersonHint");
    selectedPersonStatus.textContent = t("noPersonSelected");
    selectedPersonBalanceToman.textContent = formatCurrency(0, "TOMAN");
    selectedPersonBalanceUsd.textContent = formatCurrency(0, "USD");
    selectedPersonCount.textContent = t("zeroRecords");
    settleTomanButton.disabled = true;
    settleUsdButton.disabled = true;
    settleTomanButton.textContent = t("settleToman");
    settleUsdButton.textContent = t("settleDollar");
    setQuickControlsEnabled(false);
    return;
  }

  const person = getPersonSummary(selectedPersonName);
  const tomanBalance = person.balances.TOMAN;
  const usdBalance = person.balances.USD;

  selectedPersonTitle.textContent = person.name;
  selectedPersonHint.textContent = t("selectedPersonActiveHint");
  selectedPersonStatus.textContent = getStatusText(person.status);
  selectedPersonBalanceToman.textContent = `${tomanBalance < 0 ? "-" : ""}${formatCurrency(Math.abs(tomanBalance), "TOMAN")}`;
  selectedPersonBalanceUsd.textContent = `${usdBalance < 0 ? "-" : ""}${formatCurrency(Math.abs(usdBalance), "USD")}`;
  selectedPersonCount.textContent = getRecordLabel(person.count);
  settleTomanButton.disabled = tomanBalance === 0;
  settleUsdButton.disabled = usdBalance === 0;
  settleTomanButton.textContent = tomanBalance
    ? t("settleAmount", { amount: formatCurrency(Math.abs(tomanBalance), "TOMAN") })
    : t("settleToman");
  settleUsdButton.textContent = usdBalance
    ? t("settleAmount", { amount: formatCurrency(Math.abs(usdBalance), "USD") })
    : t("settleDollar");
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
  peopleCount.textContent = getPeopleLabel(people.length);
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
    card.setAttribute("aria-label", person.name);
    card.dataset.personName = person.name;

    const statusText = getStatusText(person.status);
    const balanceLines = formatBalanceLines(person.balances)
      .map((line) => `<strong>${line}</strong>`)
      .join("");

    card.innerHTML = `
      <div>
        <p class="person-name" dir="auto"></p>
        <p class="person-meta">${t("personMeta", { records: getRecordLabel(person.count), date: formatDate(person.lastDate) })}</p>
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
      editButton.textContent = t("edit");

      const deleteButton = document.createElement("button");
      deleteButton.className = "mini-btn";
      deleteButton.type = "button";
      deleteButton.dataset.action = "delete";
      deleteButton.dataset.id = transaction.id;
      deleteButton.textContent = t("delete");

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
  dateModeInput.value = "gregorian";
  clearPersianPicker();
  updateDateMode();
  updateAmountInputForCurrency();
  updateSaveButtonLabel();
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
    showToast(currency === "TOMAN" ? t("tomanWholeQuick") : t("amountGreaterThanZero"));
    return;
  }

  const defaultNote = direction === "theyOwe" ? t("quickDebtNote") : t("quickRepaymentNote");
  try {
    await saveQuickTransaction(direction, amount, currency, quickNoteInput.value.trim() || defaultNote);
    showToast(direction === "theyOwe" ? t("debtAdded") : t("repaymentRecorded"));
  } catch (error) {
    showToast(getErrorMessage(error, t("couldNotSaveQuickRecord")));
  }
}

async function settleSelectedPerson(currency) {
  if (!selectedPersonName) return;

  const person = getPersonSummary(selectedPersonName);
  const balance = person.balances[currency];
  if (!balance) return;

  const direction = balance > 0 ? "iOwe" : "theyOwe";
  const amount = Math.abs(balance);
  const confirmed = confirm(t("settleConfirm", { amount: formatCurrency(amount, currency), name: selectedPersonName }));
  if (!confirmed) return;

  try {
    await saveQuickTransaction(direction, amount, currency, t("fullSettlementNote", { currency }));
    showToast(currency === "TOMAN" ? t("tomanBalanceSettled") : t("dollarBalanceSettled"));
  } catch (error) {
    showToast(getErrorMessage(error, t("couldNotSettleBalance")));
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = normalizeName(nameInput.value);
  const amount = Number(amountInput.value);
  const direction = new FormData(form).get("direction");
  const currency = normalizeCurrency(transactionCurrencyInput.value);
  if (dateModeInput.value === "persian") syncPersianToGregorianDate();
  else syncGregorianToPersianDate();

  if (!name) {
    showToast(t("enterName"));
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    showToast(t("amountGreaterThanZero"));
    return;
  }

  if (!isValidAmountForCurrency(amount, currency)) {
    showToast(t("tomanAmountWhole"));
    return;
  }

  const existing = transactions.find((item) => item.id === transactionId.value);
  saveButton.disabled = true;
  saveButton.textContent = existing ? t("updating") : t("saving");
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
    showToast(existing ? t("recordUpdated") : t("recordSaved"));
  } catch (error) {
    showToast(getErrorMessage(error, t("couldNotSaveRecord")));
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = transactionId.value ? t("updateRecord") : t("saveRecord");
  }
});

recordsTable.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const record = transactions.find((item) => item.id === button.dataset.id);
  if (!record) return;

  if (button.dataset.action === "delete") {
    const confirmed = confirm(t("deleteRecordConfirm", { name: record.name }));
    if (!confirmed) return;

    try {
      await storeTransaction("delete", record.id, {
        action: "record-deleted",
        details: { record },
      });
      await refresh();
      showToast(t("recordDeleted"));
    } catch (error) {
      showToast(getErrorMessage(error, t("couldNotDeleteRecord")));
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
  dateModeInput.value = record.date ? "gregorian" : "persian";
  updateDateMode();
  noteInput.value = record.note || "";
  form.elements.direction.value = record.direction;
  saveButton.textContent = t("updateRecord");
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
  const confirmed = confirm(t("deleteAllConfirm"));
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
    showToast(t("recordsCleared"));
  } catch (error) {
    showToast(getErrorMessage(error, t("couldNotDeleteRecords")));
  } finally {
    clearAllButton.disabled = false;
  }
});

resetButton.addEventListener("click", resetForm);
languageSelect.addEventListener("change", () => applyLanguage(languageSelect.value));
themeToggle.addEventListener("click", () => applyTheme(currentTheme === "dark" ? "light" : "dark"));
transactionCurrencyInput.addEventListener("change", updateAmountInputForCurrency);
quickCurrencyInput.addEventListener("change", updateQuickInputForCurrency);
dateModeInput.addEventListener("change", updateDateMode);
dateInput.addEventListener("change", syncGregorianToPersianDate);
persianYearInput.addEventListener("change", syncPersianToGregorianDate);
persianMonthInput.addEventListener("change", syncPersianToGregorianDate);
persianDayInput.addEventListener("change", syncPersianToGregorianDate);
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
    showToast(t("exportedRecords", { count: transactions.length, label: getRecordLabel(transactions.length) }));
  } catch (error) {
    showToast(getErrorMessage(error, t("couldNotExportBackup")));
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
    showToast(getErrorMessage(error, t("couldNotImportBackup")));
  } finally {
    importButton.disabled = false;
    importFileInput.value = "";
  }
});

async function init() {
  if (window.location.protocol === "file:") {
    throw new Error("SERVER_REQUIRED: Double-click `Money Ledger.app` in the project root, or run `npm run launch`, then visit http://localhost:8080/.");
  }

  const savedTheme = await getSetting(THEME_KEY);
  const savedLanguage = await getSetting(LANGUAGE_KEY);
  const preferredTheme = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(savedTheme || preferredTheme, { save: false });
  applyLanguage(savedLanguage || "en", { save: false, render: false });
  rateInput.value = await getSetting(RATE_KEY);
  updateAmountInputForCurrency();
  updateQuickInputForCurrency();
  updateDateMode();
  await refresh();
}

init().catch(renderFatalError);
