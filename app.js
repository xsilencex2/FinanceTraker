class FinancialTracker {
    constructor() {
        this.data = this.loadData();
        this.categories = {
            expense: ['Продукты', 'Транспорт', 'Развлечения', 'Коммунальные услуги', 'Одежда', 'Здоровье', 'Другое'],
            savings: ['Машина', 'Обучение']
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCategoryOptions();
        this.updateUI();
        this.renderCharts();
    }

    loadData() {
        const defaultData = {
            monthlyBalance: 0,
            transactions: [],
            currentMonth: new Date().getMonth(),
            currentYear: new Date().getFullYear()
        };
        
        const savedData = localStorage.getItem('financialTracker');
        if (savedData) {
            const data = JSON.parse(savedData);
            // Обновляем текущий месяц и год, но НЕ очищаем транзакции
            data.currentMonth = new Date().getMonth();
            data.currentYear = new Date().getFullYear();
            return data;
        }
        
        return defaultData;
    }

    saveData() {
        localStorage.setItem('financialTracker', JSON.stringify(this.data));
    }

    bindEvents() {
        // Форма добавления транзакции
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Смена типа операции
        document.getElementById('type').addEventListener('change', () => {
            this.updateCategoryOptions();
        });

        // Установка баланса
        document.getElementById('setBalanceBtn').addEventListener('click', () => {
            this.setMonthlyBalance();
        });

        // Уменьшение баланса
        document.getElementById('decreaseBalanceBtn').addEventListener('click', () => {
            this.decreaseMonthlyBalance();
        });
    }

    decreaseMonthlyBalance() {
        const amount = parseFloat(document.getElementById('monthlyBalance').value);
        
        if (!amount || amount < 0) {
            this.showError('Введите корректную сумму для уменьшения');
            return;
        }

        if (amount > this.data.monthlyBalance) {
            this.showError('Сумма уменьшения не может быть больше текущего баланса');
            return;
        }

        this.data.monthlyBalance -= amount;
        this.saveData();
        this.updateUI();
        this.renderCharts();
        document.getElementById('monthlyBalance').value = '';
        this.showSuccess('Месячный баланс уменьшен!');
    }

    updateCategoryOptions() {
        const typeSelect = document.getElementById('type');
        const categorySelect = document.getElementById('category');
        const selectedType = typeSelect.value;

        categorySelect.innerHTML = '<option value="">Выберите категорию</option>';

        if (selectedType && this.categories[selectedType]) {
            this.categories[selectedType].forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
    }

    addTransaction() {
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const category = document.getElementById('category').value;

        if (!amount || amount <= 0 || !type || !category) {
            this.showError('Пожалуйста, заполните все поля корректно');
            return;
        }

        const transaction = {
            id: Date.now(),
            amount: amount,
            type: type,
            category: category,
            date: new Date().toISOString()
        };

        this.data.transactions.push(transaction);
        this.saveData();
        this.updateUI();
        this.renderCharts();
        this.clearForm();
        this.showSuccess('Операция успешно добавлена!');
    }

    setMonthlyBalance() {
        const balance = parseFloat(document.getElementById('monthlyBalance').value);
        
        if (!balance || balance < 0) {
            this.showError('Введите корректную сумму баланса');
            return;
        }

        this.data.monthlyBalance = balance;
        this.saveData();
        this.updateUI();
        this.renderCharts();
        document.getElementById('monthlyBalance').value = '';
        this.showSuccess('Месячный баланс установлен!');
    }

    clearForm() {
        document.getElementById('transactionForm').reset();
        this.updateCategoryOptions();
    }

    showError(message) {
        // Простое уведомление об ошибке
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #ef4444, #dc2626);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    showSuccess(message) {
        // Простое уведомление об успехе
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #10b981, #059669);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    updateUI() {
        this.updateSummary();
        this.renderTransactionHistory();
    }

    updateSummary() {
        const totalExpenses = this.getTotalExpenses();
        const totalSavings = this.getTotalSavings();
        const remainingBalance = this.data.monthlyBalance - totalExpenses;

        document.getElementById('totalBalance').textContent = `${this.data.monthlyBalance.toFixed(2)} с.`;
        document.getElementById('totalExpenses').textContent = `${totalExpenses.toFixed(2)} с.`;
        document.getElementById('totalSavings').textContent = `${totalSavings.toFixed(2)} с.`;
        document.getElementById('remainingBalance').textContent = `${remainingBalance.toFixed(2)} с.`;
    }

    getTotalExpenses() {
        return this.data.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    getTotalSavings() {
        return this.data.transactions
            .filter(t => t.type === 'savings')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    getExpensesByCategory() {
        const expenses = this.data.transactions.filter(t => t.type === 'expense');
        const byCategory = {};
        
        expenses.forEach(expense => {
            if (byCategory[expense.category]) {
                byCategory[expense.category] += expense.amount;
            } else {
                byCategory[expense.category] = expense.amount;
            }
        });
        
        return byCategory;
    }

    renderTransactionHistory() {
        const container = document.getElementById('transactionsList');
        
        if (this.data.transactions.length === 0) {
            container.innerHTML = '<div class="empty-state">Нет операций</div>';
            return;
        }

        // Группируем транзакции по датам
        const groupedByDate = {};
        this.data.transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
            const displayDate = date.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
            
            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = {
                    displayDate: displayDate,
                    transactions: []
                };
            }
            groupedByDate[dateKey].transactions.push(transaction);
        });

        // Сортируем даты по убыванию (новые сверху)
        const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

        const html = sortedDates.map(dateKey => {
            const group = groupedByDate[dateKey];
            const transactionsHtml = group.transactions.map(transaction => {
                const typeText = transaction.type === 'expense' ? 'Расход' : 'Сбережения';
                return `
                    <div class="transaction-item">
                        <div class="transaction-details">
                            <div class="transaction-type">${typeText}</div>
                            <div class="transaction-category">${transaction.category}</div>
                        </div>
                        <div class="transaction-amount ${transaction.type}">
                            ${transaction.amount.toFixed(2)} с.
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="date-group">
                    <div class="date-header" onclick="this.parentElement.querySelector('.date-transactions').classList.toggle('expanded'); this.querySelector('.date-toggle').classList.toggle('expanded');">
                        <h3>${group.displayDate}</h3>
                        <span class="date-toggle">▼</span>
                    </div>
                    <div class="date-transactions">
                        ${transactionsHtml}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    renderCharts() {
        this.renderExpenseChart();
        this.renderBalanceChart();
    }

    renderExpenseChart() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        const expensesByCategory = this.getExpensesByCategory();
        
        // Уничтожаем предыдущий график если существует
        if (this.expenseChart) {
            this.expenseChart.destroy();
        }

        const categories = Object.keys(expensesByCategory);
        const amounts = Object.values(expensesByCategory);

        if (categories.length === 0) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#64748b';
            ctx.textAlign = 'center';
            ctx.fillText('Нет данных для отображения', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        this.expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: [
                        '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
                        '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#f1f5f9'
                        }
                    }
                }
            }
        });
    }

    renderBalanceChart() {
        const ctx = document.getElementById('balanceChart').getContext('2d');
        
        // Уничтожаем предыдущий график если существует
        if (this.balanceChart) {
            this.balanceChart.destroy();
        }

        // Создаем данные для линейного графика баланса
        const totalExpenses = this.getTotalExpenses();
        const totalSavings = this.getTotalSavings();
        const remainingBalance = this.data.monthlyBalance - totalExpenses;

        this.balanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Баланс', 'Расходы', 'Сбережения', 'Остаток'],
                datasets: [{
                    label: 'Сомони',
                    data: [this.data.monthlyBalance, totalExpenses, totalSavings, remainingBalance],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ],
                    borderColor: [
                        '#3b82f6',
                        '#ef4444',
                        '#10b981',
                        '#f59e0b'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#f1f5f9'
                        },
                        grid: {
                            color: 'rgba(59, 130, 246, 0.2)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#f1f5f9'
                        },
                        grid: {
                            color: 'rgba(59, 130, 246, 0.2)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new FinancialTracker();
});