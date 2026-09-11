document.addEventListener('DOMContentLoaded', () => {
  const expenseForm = document.getElementById('expense-form');
  const expenseList = document.getElementById('expense-list');
  const alertBox = document.getElementById('alert-box');

  document.getElementById('date').valueAsDate = new Date();

  renderExpenses();

  expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);

    const budget = JSON.parse(localStorage.getItem('budget')) || { general: 0, categories: {} };
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    const currentTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Verificar si excede el presupuesto
    if (budget.general > 0 && (currentTotal + amount) > budget.general) {
      showAlert('¡Advertencia! Este gasto excede tu presupuesto general mensual.', 'danger');
      // No bloqueamos el guardado, solo advertimos (según lo solicitado: "Muestre una validación")
    }

    // Verificar presupuesto por categoría
    if (budget.categories && budget.categories[category]) {
      const catTotal = expenses.filter(exp => exp.category === category).reduce((sum, exp) => sum + exp.amount, 0);
      if ((catTotal + amount) > budget.categories[category]) {
        showAlert(`¡Advertencia! Excedes el presupuesto para ${category}.`, 'danger');
      }
    }

    // Crear objeto gasto
    const newExpense = {
      id: Date.now(),
      date,
      category,
      description,
      amount
    };

    // Guardar en LocalStorage
    expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    // Limpiar formulario y recargar lista
    expenseForm.reset();
    document.getElementById('date').valueAsDate = new Date();
    renderExpenses();

    if (alertBox.style.display !== 'block') {
      showAlert('Gasto registrado exitosamente.', 'success');
    }
  });

  // Renderizar lista de gastos
  function renderExpenses() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenseList.innerHTML = '';

    // Mostrar los últimos 5 gastos
    expenses.slice(-5).reverse().forEach(exp => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <strong>${exp.description}</strong><br>
          <small>${exp.date} - ${exp.category}</small>
        </div>
        <span class="amount">-$${exp.amount.toFixed(2)}</span>
      `;
      expenseList.appendChild(li);
    });
  }

  // Función para mostrar alertas
  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = 'block';

    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 4000);
  }
});