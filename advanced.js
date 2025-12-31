class CUSIPValidator {
  constructor() {
    this.validationHistory = this.loadHistory();
    this.charts = {};
    this.lastBatchResults = [];
    this.isInitialized = false;

    // Ensure DOM is fully loaded before initialization
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    if (this.isInitialized) return;

    console.log("Initializing CUSIP Validator Pro...");

    this.setupEventListeners();
    this.initializeCharts();
    this.updateStats();
    this.startPerformanceMonitoring();

    this.isInitialized = true;
    console.log("CUSIP Validator Pro initialized successfully!");
  }

  /**
   * Core CUSIP Validation Algorithm
   */
  validateCUSIP(cusip) {
    if (!cusip || typeof cusip !== "string") {
      return { valid: false, error: "Invalid input type" };
    }

    cusip = cusip.trim().toUpperCase();

    if (cusip.length !== 9) {
      return { valid: false, error: "CUSIP must be exactly 9 characters" };
    }

    const validChars = /^[0-9A-Z*@#]+$/;
    if (!validChars.test(cusip)) {
      return { valid: false, error: "Invalid characters in CUSIP" };
    }

    let sum = 0;

    for (let i = 0; i < 8; i++) {
      const char = cusip[i];
      let value;

      if (char >= "0" && char <= "9") {
        value = parseInt(char);
      } else if (char >= "A" && char <= "Z") {
        value = char.charCodeAt(0) - "A".charCodeAt(0) + 10;
      } else if (char === "*") {
        value = 36;
      } else if (char === "@") {
        value = 37;
      } else if (char === "#") {
        value = 38;
      } else {
        return {
          valid: false,
          error: `Invalid character at position ${i + 1}`
        };
      }

      if ((i + 1) % 2 === 0) {
        value *= 2;
      }

      sum += Math.floor(value / 10) + (value % 10);
    }

    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    const providedCheckDigit = parseInt(cusip[8]);
    const isValid = calculatedCheckDigit === providedCheckDigit;

    return {
      valid: isValid,
      providedCheckDigit,
      calculatedCheckDigit,
      sum,
      error: isValid ? null : "Check digit validation failed"
    };
  }

  /**
   * Fixed Event Listeners Setup
   */
  setupEventListeners() {
    console.log("Setting up event listeners...");

    // Navigation buttons - Fixed with proper event delegation
    this.setupNavigation();

    // Single validation - Fixed with proper element checking
    this.setupSingleValidation();

    // Batch processing - Fixed with proper button states
    this.setupBatchProcessing();

    // Example buttons - Fixed with proper selection
    this.setupExampleButtons();

    // Keyboard shortcuts
    this.setupKeyboardShortcuts();

    console.log("Event listeners setup complete!");
  }

  setupNavigation() {
    const navButtons = document.querySelectorAll(".nav__btn");
    console.log(`Found ${navButtons.length} navigation buttons`);

    navButtons.forEach((btn) => {
      // Remove any existing listeners to prevent duplicates
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const view = newBtn.dataset.view;
        console.log(`Switching to view: ${view}`);
        this.switchView(view);

        // Update active state
        navButtons.forEach((b) => b.classList.remove("active"));
        newBtn.classList.add("active");
      });
    });
  }

  setupSingleValidation() {
    const input = document.getElementById("cusipInput");
    const validateBtn = document.getElementById("validateBtn");
    const clearBtn = document.getElementById("clearInput");
    const resultPanel = document.getElementById("resultPanel");

    if (!input || !validateBtn || !clearBtn || !resultPanel) {
      console.error("Single validation elements not found!");
      return;
    }

    // Real-time validation
    let debounceTimer;
    input.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      const value = e.target.value.trim();

      // Show/hide clear button
      clearBtn.classList.toggle("visible", value.length > 0);

      debounceTimer = setTimeout(() => {
        if (value.length === 9) {
          this.displayValidationResult(value, resultPanel);
        } else if (value.length > 0) {
          this.displayPartialResult(value, resultPanel);
        } else {
          this.displayPlaceholder(resultPanel);
        }
      }, 300);

      this.updateInputStyling(input, value);
    });

    // Validate button
    validateBtn.addEventListener("click", () => {
      const value = input.value.trim();
      if (value.length === 9) {
        this.displayValidationResult(value, resultPanel);
      } else {
        this.showToast(
          "Invalid Input",
          "Please enter a 9-character CUSIP",
          "warning"
        );
      }
    });

    // Clear button
    clearBtn.addEventListener("click", () => {
      input.value = "";
      input.focus();
      this.displayPlaceholder(resultPanel);
      clearBtn.classList.remove("visible");
    });
  }

  setupBatchProcessing() {
    const textarea = document.getElementById("batchInput");
    const processBtn = document.getElementById("processBatch");
    const loadSampleBtn = document.getElementById("loadSample");
    const exportBtn = document.getElementById("exportResults");

    if (!textarea || !processBtn || !loadSampleBtn || !exportBtn) {
      console.error("Batch processing elements not found!");
      return;
    }

    // Textarea input
    textarea.addEventListener("input", (e) => {
      const count = e.target.value.split("\n").filter((line) => line.trim())
        .length;
      const countText = document.querySelector(".batch-count");
      if (countText) {
        countText.textContent = `${count} CUSIP${
          count !== 1 ? "s" : ""
        } entered`;
      }

      // Enable/disable process button
      const hasContent = e.target.value.trim().length > 0;
      processBtn.disabled = !hasContent;
      processBtn.classList.toggle("disabled", !hasContent);
    });

    // Process button
    processBtn.addEventListener("click", () => {
      this.processBatch();
    });

    // Load sample button
    loadSampleBtn.addEventListener("click", () => {
      this.loadSampleData();
    });

    // Export button
    exportBtn.addEventListener("click", () => {
      this.exportResults();
    });

    // Initial button state
    processBtn.disabled = true;
    processBtn.classList.add("disabled");
  }

  setupExampleButtons() {
    const exampleButtons = document.querySelectorAll(".example-btn");
    console.log(`Found ${exampleButtons.length} example buttons`);

    exampleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const cusip = btn.dataset.cusip;
        console.log(`Example button clicked: ${cusip}`);

        const input = document.getElementById("cusipInput");
        if (input) {
          input.value = cusip;
          input.dispatchEvent(new Event("input"));
          input.focus();
          this.animateExampleSelection(btn);
        }
      });
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + K to focus input
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("cusipInput");
        if (input) input.focus();
      }

      // Escape to clear input
      if (e.key === "Escape") {
        const input = document.getElementById("cusipInput");
        if (input && document.activeElement === input) {
          input.value = "";
          input.dispatchEvent(new Event("input"));
        }
      }
    });
  }

  /**
   * Single Validation Functions
   */
  updateInputStyling(input, value) {
    input.classList.remove("valid", "invalid");

    if (value.length === 9) {
      const result = this.validateCUSIP(value);
      input.classList.add(result.valid ? "valid" : "invalid");
    }
  }

  displayValidationResult(cusip, container) {
    const startTime = performance.now();
    const result = this.validateCUSIP(cusip);
    const validationTime = performance.now() - startTime;

    this.addToHistory(cusip, result, validationTime);

    const resultHTML = `
            <div class="result-card ${result.valid ? "valid" : "invalid"}">
                <div class="result-icon">
                    <i class="fas ${
                      result.valid ? "fa-check-circle" : "fa-times-circle"
                    }"></i>
                </div>
                <div class="result-title">${
                  result.valid ? "Valid CUSIP" : "Invalid CUSIP"
                }</div>
                <div class="result-subtitle">${cusip}</div>
                <div class="result-details">
                    <div class="detail-item">
                        <div class="detail-label">Check Digit</div>
                        <div class="detail-value">${
                          result.providedCheckDigit
                        }</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Calculated</div>
                        <div class="detail-value">${
                          result.calculatedCheckDigit
                        }</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Validation Time</div>
                        <div class="detail-value">${validationTime.toFixed(
                          2
                        )}ms</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Algorithm Sum</div>
                        <div class="detail-value">${result.sum}</div>
                    </div>
                </div>
            </div>
        `;

    container.innerHTML = resultHTML;
    this.updateAnalytics(result, validationTime);

    this.showToast(
      result.valid ? "Validation Complete" : "Validation Failed",
      result.valid ? `${cusip} is a valid CUSIP` : result.error,
      result.valid ? "success" : "error"
    );
  }

  displayPartialResult(value, container) {
    const remaining = 9 - value.length;
    container.innerHTML = `
            <div class="result-card">
                <div class="result-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="result-title">Enter more characters</div>
                <div class="result-subtitle">${remaining} more character${
      remaining > 1 ? "s" : ""
    } needed</div>
            </div>
        `;
  }

  displayPlaceholder(container) {
    container.innerHTML = `
            <div class="result-placeholder">
                <i class="fas fa-keyboard"></i>
                <p>Enter a CUSIP above to validate</p>
            </div>
        `;
  }

  /**
   * Batch Processing Functions
   */
  async processBatch() {
    const textarea = document.getElementById("batchInput");
    const processBtn = document.getElementById("processBatch");
    const resultsContainer = document.getElementById("batchResults");

    if (!textarea || !processBtn || !resultsContainer) return;

    const cusips = textarea.value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (cusips.length === 0) {
      this.showToast(
        "No Data",
        "Please enter some CUSIPs to process",
        "warning"
      );
      return;
    }

    if (cusips.length > 1000) {
      this.showToast("Too Many Items", "Maximum 1000 CUSIPs allowed", "error");
      return;
    }

    // Show loading state
    processBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Processing...';
    processBtn.disabled = true;
    resultsContainer.innerHTML = '<div class="loading"></div>';

    // Process in chunks
    const chunkSize = 50;
    const results = [];

    for (let i = 0; i < cusips.length; i += chunkSize) {
      const chunk = cusips.slice(i, i + chunkSize);
      const chunkResults = await this.processChunk(chunk);
      results.push(...chunkResults);

      const progress = (((i + chunk.length) / cusips.length) * 100).toFixed(0);
      resultsContainer.innerHTML = `<div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>`;
    }

    this.displayBatchResults(results);
    this.updateBatchSummary(results);

    processBtn.innerHTML = '<i class="fas fa-play"></i> Process All';
    processBtn.disabled = false;

    this.lastBatchResults = results;
    this.showToast(
      "Batch Complete",
      `Processed ${results.length} CUSIPs`,
      "success"
    );
  }

  async processChunk(cusips) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = cusips.map((cusip) => {
          const startTime = performance.now();
          const result = this.validateCUSIP(cusip);
          const validationTime = performance.now() - startTime;

          return { cusip, ...result, validationTime };
        });
        resolve(results);
      }, 0);
    });
  }

  displayBatchResults(results) {
    const container = document.getElementById("batchResults");
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No results to display</p>
                </div>
            `;
      return;
    }

    const resultsHTML = results
      .map(
        (result) => `
            <div class="batch-item ${result.valid ? "valid" : "invalid"}">
                <span class="batch-item__code">${result.cusip}</span>
                <span class="batch-item__status">
                    <i class="fas ${
                      result.valid ? "fa-check" : "fa-times"
                    }"></i>
                    ${result.valid ? "Valid" : "Invalid"}
                </span>
            </div>
        `
      )
      .join("");

    container.innerHTML = resultsHTML;
  }

  updateBatchSummary(results) {
    const valid = results.filter((r) => r.valid).length;
    const invalid = results.filter((r) => !r.valid).length;

    const validCount = document.querySelector(".summary-item.valid .count");
    const invalidCount = document.querySelector(".summary-item.invalid .count");
    const pendingCount = document.querySelector(".summary-item.pending .count");

    if (validCount) validCount.textContent = valid;
    if (invalidCount) invalidCount.textContent = invalid;
    if (pendingCount) pendingCount.textContent = 0;
  }

  loadSampleData() {
    const sampleData = [
      "037833100", // Apple
      "17275R102", // Cisco
      "38259P508", // Google
      "68389X105", // Oracle
      "68389X106", // Oracle (invalid)
      "594918104", // Microsoft
      "037833101", // Apple (invalid)
      "INVALID01", // Invalid format
      "123456789", // Invalid check digit
      "987654321" // Invalid check digit
    ];

    const textarea = document.getElementById("batchInput");
    if (textarea) {
      textarea.value = sampleData.join("\n");
      textarea.dispatchEvent(new Event("input"));
      this.showToast(
        "Sample Loaded",
        "Sample CUSIPs have been loaded for testing",
        "success"
      );
    }
  }

  exportResults() {
    if (!this.lastBatchResults || this.lastBatchResults.length === 0) {
      this.showToast("No Data", "No batch results to export", "warning");
      return;
    }

    const csvContent = [
      [
        "CUSIP",
        "Valid",
        "Check Digit",
        "Calculated",
        "Validation Time (ms)",
        "Error"
      ],
      ...this.lastBatchResults.map((r) => [
        r.cusip,
        r.valid ? "Yes" : "No",
        r.providedCheckDigit,
        r.calculatedCheckDigit,
        r.validationTime.toFixed(2),
        r.error || ""
      ])
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cusip-validation-results-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast(
      "Export Complete",
      "Results exported as CSV file",
      "success"
    );
  }

  /**
   * View Management
   */
  switchView(viewName) {
    console.log(`Switching to view: ${viewName}`);

    document.querySelectorAll(".view").forEach((view) => {
      view.classList.remove("active");
    });

    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
      targetView.classList.add("active");

      if (viewName === "analytics") {
        this.refreshAnalytics();
      }
    } else {
      console.error(`View not found: ${viewName}View`);
    }
  }

  /**
   * Analytics Functions
   */
  initializeCharts() {
    // Wait for charts to be available
    if (typeof Chart === "undefined") {
      setTimeout(() => this.initializeCharts(), 1000);
      return;
    }

    this.setupDistributionChart();
    this.setupTimelineChart();
  }

  setupDistributionChart() {
    const ctx = document.getElementById("distributionChart");
    if (!ctx) return;

    this.charts.distribution = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Valid", "Invalid"],
        datasets: [
          {
            data: [0, 0],
            backgroundColor: [
              "rgba(16, 185, 129, 0.8)",
              "rgba(239, 68, 68, 0.8)"
            ],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--text-primary"),
              padding: 20
            }
          }
        }
      }
    });
  }

  setupTimelineChart() {
    const ctx = document.getElementById("timelineChart");
    if (!ctx) return;

    this.charts.timeline = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Validation Time (ms)",
            data: [],
            borderColor: "rgba(37, 99, 235, 1)",
            backgroundColor: "rgba(37, 99, 235, 0.1)",
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--text-secondary")
            },
            grid: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--border-color")
            }
          },
          y: {
            ticks: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--text-secondary")
            },
            grid: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--border-color")
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--text-primary")
            }
          }
        }
      }
    });
  }

  updateAnalytics(result, validationTime) {
    const history = this.validationHistory;
    const validCount = history.filter((h) => h.result.valid).length;
    const invalidCount = history.filter((h) => !h.result.valid).length;

    const totalValid = document.getElementById("totalValid");
    const totalInvalid = document.getElementById("totalInvalid");
    const avgValidationTime = document.getElementById("avgValidationTime");
    const successRate = document.getElementById("successRate");

    if (totalValid) totalValid.textContent = validCount;
    if (totalInvalid) totalInvalid.textContent = invalidCount;

    const avgTime =
      history.length > 0
        ? history.reduce((sum, h) => sum + h.validationTime, 0) / history.length
        : 0;
    if (avgValidationTime)
      avgValidationTime.textContent = `${avgTime.toFixed(1)}ms`;

    const rate =
      history.length > 0 ? ((validCount / history.length) * 100).toFixed(1) : 0;
    if (successRate) successRate.textContent = `${rate}%`;

    // Update charts
    if (this.charts.distribution) {
      this.charts.distribution.data.datasets[0].data = [
        validCount,
        invalidCount
      ];
      this.charts.distribution.update();
    }

    if (this.charts.timeline) {
      const labels = this.charts.timeline.data.labels;
      const data = this.charts.timeline.data.datasets[0].data;

      labels.push(new Date().toLocaleTimeString());
      data.push(validationTime);

      if (labels.length > 20) {
        labels.shift();
        data.shift();
      }

      this.charts.timeline.update();
    }

    this.updateActivityLog(result, validationTime);
  }

  updateActivityLog(result, validationTime) {
    const log = document.getElementById("activityLog");
    if (!log) return;

    const item = document.createElement("div");
    item.className = "activity-item";
    item.innerHTML = `
            <div class="activity-icon ${result.valid ? "valid" : "invalid"}">
                <i class="fas ${result.valid ? "fa-check" : "fa-times"}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${
                  result.valid ? "Valid CUSIP" : "Invalid CUSIP"
                }</div>
                <div class="activity-time">${new Date().toLocaleTimeString()} - ${validationTime.toFixed(
      1
    )}ms</div>
            </div>
        `;

    log.insertBefore(item, log.firstChild);

    while (log.children.length > 10) {
      log.removeChild(log.lastChild);
    }

    const emptyState = log.querySelector(".empty-state");
    if (emptyState) {
      emptyState.remove();
    }
  }

  refreshAnalytics() {
    Object.values(this.charts).forEach((chart) => {
      if (chart && typeof chart.update === "function") {
        chart.update();
      }
    });
  }

  /**
   * Utility Functions
   */
  showToast(title, message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${this.getToastIcon(type)}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "toastOut 0.3s ease-in";
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  getToastIcon(type) {
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle"
    };
    return icons[type] || icons.info;
  }

  animateExampleSelection(button) {
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "";
    }, 150);
  }

  updateStats() {
    const history = this.validationHistory;
    const totalChecks = document.getElementById("totalChecks");
    if (totalChecks) {
      totalChecks.textContent = history.length;
    }
  }

  startPerformanceMonitoring() {
    let slowValidations = 0;
    const originalValidate = this.validateCUSIP.bind(this);

    this.validateCUSIP = function (cusip) {
      const start = performance.now();
      const result = originalValidate(cusip);
      const duration = performance.now() - start;

      if (duration > 10) {
        slowValidations++;
        console.warn(
          `Slow CUSIP validation: ${duration.toFixed(2)}ms for ${cusip}`
        );
      }

      return result;
    };

    setInterval(() => {
      if (slowValidations > 0) {
        console.log(
          `Performance: ${slowValidations} slow validations detected`
        );
        slowValidations = 0;
      }
    }, 60000);
  }

  /**
   * History Management
   */
  addToHistory(cusip, result, validationTime) {
    const entry = {
      cusip,
      result,
      validationTime,
      timestamp: Date.now()
    };

    this.validationHistory.unshift(entry);

    if (this.validationHistory.length > 1000) {
      this.validationHistory = this.validationHistory.slice(0, 1000);
    }

    this.saveHistory();
  }

  saveHistory() {
    try {
      localStorage.setItem(
        "cusipValidationHistory",
        JSON.stringify(this.validationHistory)
      );
    } catch (error) {
      console.warn("Failed to save history:", error);
    }
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem("cusipValidationHistory");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn("Failed to load history:", error);
      return [];
    }
  }
}

/**
 * Initialize application with proper error handling
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded - Initializing application...");

  try {
    window.cusipValidator = new CUSIPValidator();
    document.body.classList.add("loaded");
    console.log("Application initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize application:", error);
    alert("Failed to initialize CUSIP Validator. Please refresh the page.");
  }
});

/**
 * Add CSS animation for toast removal
 */
const style = document.createElement("style");
style.textContent = `
    @keyframes toastOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
`;
document.head.appendChild(style);
