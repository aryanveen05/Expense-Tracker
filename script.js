// ── State ──
// localStorage se data load karo, agar nahi hai toh empty array
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let currentFilter = 'All';
let chart = null;

// ── Category Colors (chart ke liye) ──
const categoryColors = {
  Food:          '#22c55e',
  Transport:     '#f97316',
  Shopping:      '#a855f7',
  Entertainment: '#ec4899',
  Other:         '#3b82f6'
};

// ── DOM Elements ──
const addBtn         = document.getElementById('addBtn');
const expenseList    = document.getElementById('expenseList');
const emptyMsg       = document.getElementById('emptyMsg');
const totalAmount    = document.getElementById('totalAmount');
const foodTotal      = document.getElementById('foodTotal');
const transportTotal = document.getElementById('transportTotal');
const otherTotal     = document.getElementById('otherTotal');
const filterBtns     = document.querySelectorAll('.filter-btn');

// ── Add Expense ──
addBtn.addEventListener('click', function () {
  const name     = document.getElementById('expenseName').value.trim();
  const amount   = parseFloat(document.getElementById('expenseAmount').value);
  const category = document.getElementById('expenseCategory').value;
  const date     = document.getElementById('expenseDate').value;

  // Validation
  if (!name || !amount || amount <= 0 || !date) {
    alert('Please fill all fields correctly!');
    return;
  }

  // Naya expense object banao
  const newExpense = {
    id: Date.now(),       // unique id — current timestamp
    name,
    amount,
    category,
    date
  };

  // Array mein push karo
  expenses.push(newExpense);

  // localStorage mein save karo
  saveToLocalStorage();

  // UI update karo
  renderAll();

  // Form clear karo
  clearForm();
});

// ── Delete Expense ──
function deleteExpense(id) {
  // Us expense ko filter out karo jiska id match kare
  expenses = expenses.filter(function (exp) {
    return exp.id !== id;
  });

  saveToLocalStorage();
  renderAll();
}

// ── Save to localStorage ──
function saveToLocalStorage() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

// ── Render All (list + summary + chart) ──
function renderAll() {
  renderList();
  renderSummary();
  renderChart();
}

// ── Render Expense List ──
function renderList() {
  // Filter apply karo
  const filtered = currentFilter === 'All'
    ? expenses
    : expenses.filter(exp => exp.category === currentFilter);

  // List clear karo
  expenseList.innerHTML = '';

  // Agar koi expense nahi hai
  if (filtered.length === 0) {
    expenseList.innerHTML = '<p class="empty-msg">No expenses found!</p>';
    return;
  }

  // Har expense ke liye ek card banao
  // Reverse karo taki latest upar dikhe
  filtered.slice().reverse().forEach(function (exp) {
    const item = document.createElement('div');
    item.classList.add('expense-item');

    item.innerHTML = `
      <div class="expense-left">
        <div class="category-dot dot-${exp.category}"></div>
        <div class="expense-info">
          <div class="name">${exp.name}</div>
          <div class="meta">${exp.category} &bull; ${formatDate(exp.date)}</div>
        </div>
      </div>
      <div class="expense-right">
        <span class="expense-amount">-₹${exp.amount.toLocaleString()}</span>
        <button class="delete-btn" onclick="deleteExpense(${exp.id})">✕</button>
      </div>
    `;

    expenseList.appendChild(item);
  });
}

// ── Render Summary Cards ──
function renderSummary() {
  // Total — sabka sum
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Category-wise total
  const food      = expenses.filter(e => e.category === 'Food').reduce((s, e) => s + e.amount, 0);
  const transport = expenses.filter(e => e.category === 'Transport').reduce((s, e) => s + e.amount, 0);
  const other     = expenses.filter(e => !['Food','Transport'].includes(e.category)).reduce((s, e) => s + e.amount, 0);

  totalAmount.textContent    = `₹${total.toLocaleString()}`;
  foodTotal.textContent      = `₹${food.toLocaleString()}`;
  transportTotal.textContent = `₹${transport.toLocaleString()}`;
  otherTotal.textContent     = `₹${other.toLocaleString()}`;
}

// ── Render Chart ──
function renderChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');

  // Category wise totals nikalo
  const categories = Object.keys(categoryColors);
  const data = categories.map(cat =>
    expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
  );

  // Agar sab zero hain toh chart mat dikhao
  const hasData = data.some(d => d > 0);

  // Purana chart destroy karo (warna duplicate banta hai)
  if (chart) chart.destroy();

  if (!hasData) return;

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data: data,
        backgroundColor: categories.map(c => categoryColors[c]),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            font: { size: 13 }
          }
        }
      }
    }
  });
}

// ── Filter Buttons ──
filterBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    // Active class hataao sab se
    filterBtns.forEach(b => b.classList.remove('active'));
    // Is button pe lagao
    btn.classList.add('active');
    // Filter set karo
    currentFilter = btn.dataset.filter;
    // List re-render karo
    renderList();
  });
});

// ── Helper: Date Format ──
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// ── Helper: Clear Form ──
function clearForm() {
  document.getElementById('expenseName').value   = '';
  document.getElementById('expenseAmount').value = '';
  document.getElementById('expenseDate').value   = '';
  document.getElementById('expenseCategory').value = 'Food';
}

// ── Initial Render (page load pe) ──
renderAll();
