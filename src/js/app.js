// ==========================================
// REGISTRO DEL SERVICE WORKER
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Detectar si estamos en la raíz o en la carpeta pages
        const swPath = window.location.pathname.includes('/pages/') ? '../sw.js' : './sw.js';
        
        navigator.serviceWorker.register(swPath)
            .then(registration => console.log('SW registrado con éxito:', registration))
            .catch(error => console.log('Error al registrar SW:', error));
    });
}

// Utilidad para parseo seguro
function getSafeLocalStorage(key, defaultValue) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error al leer ${key}:`, error);
        return defaultValue;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('dashboard.html')) loadDashboard();
    if (path.includes('profile.html')) loadProfile();
    if (path.includes('budget.html')) loadBudgetForm();
});

// --- LÓGICA DEL DASHBOARD ---
function loadDashboard() {
    const expenses = getSafeLocalStorage('expenses', []);
    const budget = getSafeLocalStorage('budget', { general: 0 });
    
    // Validar que budget.general sea un número
    const generalBudget = typeof budget.general === 'number' ? budget.general : 0;

    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const remaining = generalBudget - totalExpenses;

    const budgetDisplay = document.getElementById('budget-display');
    if (budgetDisplay) budgetDisplay.textContent = `$${generalBudget.toFixed(2)}`;
    
    const totalExpensesEl = document.getElementById('total-expenses');
    if (totalExpensesEl) totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
    
    const remainingEl = document.getElementById('remaining-budget');
    if (remainingEl) remainingEl.textContent = `$${remaining.toFixed(2)}`;

    // Gráfica con Chart.js
    const chartCanvas = document.getElementById('budgetChart');
    if (chartCanvas) {
        const ctx = chartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Presupuesto', 'Gasto Real'],
                datasets: [{
                    label: 'Monto ($)',
                    data: [generalBudget, totalExpenses],
                    backgroundColor: ['#1abc9c', '#e74c3c'],
                    borderWidth: 1
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } },
                plugins: { legend: { display: false } }
            }
        });
    }
}

// --- LÓGICA DEL PERFIL ---
function loadProfile() {
    const expenses = getSafeLocalStorage('expenses', []);
    const budget = getSafeLocalStorage('budget', { general: 0 });
    const generalBudget = typeof budget.general === 'number' ? budget.general : 0;

    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
    // Validación para evitar división por cero
    const percentage = generalBudget > 0 ? ((totalExpenses / generalBudget) * 100).toFixed(1) : 0;
    const remainingPercentage = Math.max(0, (100 - percentage)).toFixed(1);

    const spentEl = document.getElementById('profile-spent');
    if (spentEl) spentEl.textContent = `$${totalExpenses.toFixed(2)}`;
    
    const percEl = document.getElementById('profile-percentage');
    if (percEl) percEl.textContent = `${remainingPercentage}%`;

    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = `${Math.min(percentage, 100)}%`;
        if (percentage > 100) progressBar.style.backgroundColor = '#e74c3c';
    }

    const resetBtn = document.getElementById('reset-data');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de borrar todos los datos?')) {
                localStorage.clear();
                window.location.href = '../index.html';
            }
        });
    }
}

// --- LÓGICA DEL PRESUPUESTO ---
function loadBudgetForm() {
    const budget = getSafeLocalStorage('budget', { general: 0, categories: {} });

    const generalInput = document.getElementById('general-budget');
    if (generalInput) generalInput.value = budget.general || '';

    if (budget.categories) {
        const catComida = document.getElementById('cat-comida');
        const catTransporte = document.getElementById('cat-transporte');
        const catOcio = document.getElementById('cat-ocio');
        const catOtros = document.getElementById('cat-otros');
        
        if (catComida) catComida.value = budget.categories['Comida'] || '';
        if (catOtros) catOtros.value = budget.categories['otros'] || '';
        if (catTransporte) catTransporte.value = budget.categories['Transporte'] || '';
        if (catOcio) catOcio.value = budget.categories['Ocio'] || '';
    }

    const budgetForm = document.getElementById('budget-form');
    if (budgetForm) {
        budgetForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // VALIDACIÓN: Leer y comprobar valores numéricos
            const generalVal = parseFloat(document.getElementById('general-budget').value);
            const comidaVal = parseFloat(document.getElementById('cat-comida').value) || 0;
            const transporteVal = parseFloat(document.getElementById('cat-transporte').value) || 0;
            const ocioVal = parseFloat(document.getElementById('cat-ocio').value) || 0;
            const otrosVal = parseFloat(document.getElementById('cat-otros').value) || 0;

            if (isNaN(generalVal) || generalVal <= 0) {
                alert('El presupuesto general debe ser un número mayor a 0.');
                return;
            }
            if (comidaVal < 0 || transporteVal < 0 || ocioVal < 0 || otrosVal < 0) {
                alert('Los presupuestos por categoría no pueden ser negativos.');
                return;
            }

            const newBudget = {
                general: generalVal,
                categories: {
                    'Comida': comidaVal,
                    'Transporte': transporteVal,
                    'Ocio': ocioVal,
                    'otros': otrosVal
                }
            };

            localStorage.setItem('budget', JSON.stringify(newBudget));
            alert('Presupuesto guardado correctamente.');
            window.location.href = 'dashboard.html';
        });
    }
}