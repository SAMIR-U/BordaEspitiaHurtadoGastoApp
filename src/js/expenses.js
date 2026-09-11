document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const alertBox = document.getElementById('alert-box');

    if (!expenseForm) return; // Seguridad si no estamos en la página correcta

    document.getElementById('date').valueAsDate = new Date();

    renderExpenses();

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // VALIDACIÓN 1: Obtener y limpiar valores
        const date = document.getElementById('date').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value.trim(); // Quitar espacios
        const amountInput = document.getElementById('amount').value;
        const amount = parseFloat(amountInput);

        // VALIDACIÓN 2: Campos vacíos
        if (!date || !category || description === '' || isNaN(amount)) {
            showAlert('Por favor, complete todos los campos correctamente.', 'danger');
            return;
        }

        // VALIDACIÓN 3: Valores numéricos válidos
        if (amount <= 0) {
            showAlert('El monto debe ser mayor a 0.', 'danger');
            return;
        }

        // VALIDACIÓN 4: Longitud de texto
        if (description.length > 100) {
            showAlert('La descripción no puede tener más de 100 caracteres.', 'danger');
            return;
        }

        // Obtener datos seguros de LocalStorage
        const budget = getSafeLocalStorage('budget', { general: 0, categories: {} });
        const expenses = getSafeLocalStorage('expenses', []);

        const currentTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Verificar si excede el presupuesto general
        if (budget.general > 0 && (currentTotal + amount) > budget.general) {
            showAlert('¡Advertencia! Este gasto excede tu presupuesto general mensual.', 'danger');
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

    // Renderizar lista de gastos (CORREGIDO: Prevención de XSS)
    function renderExpenses() {
        const expenses = getSafeLocalStorage('expenses', []);
        expenseList.innerHTML = '';

        // Mostrar los últimos 5 gastos
        expenses.slice(-5).reverse().forEach(exp => {
            const li = document.createElement('li');
            
            const divInfo = document.createElement('div');
            
            const strongDesc = document.createElement('strong');
            strongDesc.textContent = exp.description; // SEGURO: No interpreta HTML
            
            const smallInfo = document.createElement('small');
            smallInfo.textContent = `${exp.date} - ${exp.category}`;
            
            divInfo.appendChild(strongDesc);
            divInfo.appendChild(document.createElement('br'));
            divInfo.appendChild(smallInfo);

            const spanAmount = document.createElement('span');
            spanAmount.className = 'amount';
            spanAmount.textContent = `-$${exp.amount.toFixed(2)}`;

            li.appendChild(divInfo);
            li.appendChild(spanAmount);
            expenseList.appendChild(li);
        });
    }

    // Función auxiliar para parseo seguro de JSON
    function getSafeLocalStorage(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error al leer ${key} de LocalStorage:`, error);
            return defaultValue;
        }
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