// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('../sw.js')
            .then(registration => console.log('SW registrado:', registration))
            .catch(error => console.log('Error al registrar SW:', error));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Lógica para el Dashboard
    if (path.includes('dashboard.html')) {
        loadDashboard();
    }

    // Lógica para el Perfil
    if (path.includes('profile.html')) {
        loadProfile();
    }

    // Lógica para el formulario de Presupuesto
    if (path.includes('budget.html')) {
        loadBudgetForm();
    }
});

// --- LÓGICA DEL DASHBOARD ---
function loadDashboard() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const budget = JSON.parse(localStorage.getItem('budget')) || { general: 0 };

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = budget.general - totalExpenses;

    document.getElementById('budget-display').textContent = `$${budget.general.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
    document.getElementById('remaining-budget').textContent = `$${remaining.toFixed(2)}`;

    // Gráfica con Chart.js
    const ctx = document.getElementById('budgetChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Presupuesto', 'Gasto Real'],
            datasets: [{
                label: 'Monto ($)',
                data: [budget.general, totalExpenses],
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

// --- LÓGICA DEL PERFIL ---
function loadProfile() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const budget = JSON.parse(localStorage.getItem('budget')) || { general: 0 };

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = budget.general > 0 ? ((totalExpenses / budget.general) * 100).toFixed(1) : 0;
    const remainingPercentage = (100 - percentage).toFixed(1);

    document.getElementById('profile-spent').textContent = `$${totalExpenses.toFixed(2)}`;
    document.getElementById('profile-percentage').textContent = `${remainingPercentage > 0 ? remainingPercentage : 0}%`;

    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${Math.min(percentage, 100)}%`;
    if (percentage > 100) progressBar.style.backgroundColor = '#e74c3c';

    // Botón para borrar datos
    document.getElementById('reset-data').addEventListener('click', () => {
        if (confirm('¿Estás seguro de borrar todos los datos?')) {
            localStorage.clear();
            window.location.href = '../index.html';
        }
    });
}

// --- LÓGICA DEL PRESUPUESTO ---
function loadBudgetForm() {
    const budget = JSON.parse(localStorage.getItem('budget')) || { general: 0, categories: {} };

    document.getElementById('general-budget').value = budget.general || '';
    if (budget.categories) {
        document.getElementById('cat-comida').value = budget.categories['Comida'] || '';
        document.getElementById('cat-transporte').value = budget.categories['Transporte'] || '';
        document.getElementById('cat-ocio').value = budget.categories['Ocio'] || '';
    }

    document.getElementById('budget-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const newBudget = {
            general: parseFloat(document.getElementById('general-budget').value) || 0,
            categories: {
                'Comida': parseFloat(document.getElementById('cat-comida').value) || 0,
                'Transporte': parseFloat(document.getElementById('cat-transporte').value) || 0,
                'Ocio': parseFloat(document.getElementById('cat-ocio').value) || 0
            }
        };

        localStorage.setItem('budget', JSON.stringify(newBudget));
        alert('Presupuesto guardado correctamente.');
        window.location.href = 'dashboard.html';
    });
}