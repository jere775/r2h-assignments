// Budget Controller
const budgetController = (() => {
	const Expense = function(id, desc, value) {
		this.id = id;
		this.desc = desc;
		this.value = value;
	};
// create a function constructor for income and expense types
	const Income = function(id, desc, value) {
		this.id = id;
		this.desc = desc;
		this.value = value;
	};

	const calculateTotal = type => {
		let total = data.items[type].reduce((sum, item) => sum + item.value, 0);
		data.totals[type] = total;
	};

	const data = {
		items: {
			expenses: [],
			income: []
		},
		totals: {
			expenses: 0,
			income: 0
		},
		budget: 0,
		percent: -1
	};
// create public method to allow other modules to add new items to the data structure
	return {
		addItem: (type, desc, value) => {
			let newItem, id;
			//Random ID
			id = (
				Date.now().toString(36) +
				Math.random()
					.toString(36)
					.substr(2, 5)
			).toUpperCase();
			type === 'expenses'
				? (newItem = new Expense(id, desc, value))
				: (newItem = new Income(id, desc, value));

			// // push to data structure
			// data.items[type].push(newItem);
			// return newItem;
		},
		deleteItem: attr => {
			const type = attr.split('-')[0];
			const id = attr.split('-')[1];
			const removeIndex = data.items[type].map(item => item.id).indexOf(id);

			data.items[type].splice(removeIndex, 1);
		},
		calculateBudget: () => {
			// this will calculate income and expenses
			calculateTotal('expenses');
			calculateTotal('income');
			// this is income - expenses
			data.budget = data.totals.income - data.totals.expenses;
			// % income spent
			if (data.totals.income > 0) {
				data.percent = Math.round(
					(data.totals.expenses / data.totals.income) * 100
				);
			} else {// display nothing
				data.percent = -1;
			}
		},
		getBudget: () => {
			return {
				budget: data.budget,
				totalIncome: data.totals.income,
				totalExpenses: data.totals.expenses,
				percent: data.percent
			};
		},
		testing: () => {
			console.log(data);
		}
	};
})();

// the app view
const UIController = (() => {
	const elements = {// create private variable/object to store DOM strings
		inputType: '.add__type',
		inputDesc: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		budgetLbl: '.budget__value',
		incomeLbl: '.budget__income--value',
		expensesLbl: '.budget__expenses--value',
		percentLbl: '.budget__expenses--percentage',
		container: '.container',
		expenseListItems: '.expenses__list > div',
		dateLbl: '.budget__title--month'
	};

	const formatNumber = num => {
		return num.toLocaleString(undefined, {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});
	};
console.log(formatNumber(1234567890))
	return {
		getInput: () => {
			return {
				type: document.querySelector(elements.inputType).value, 
				desc: document.querySelector(elements.inputDesc).value,
				value: parseFloat(document.querySelector(elements.inputValue).value)
			};
		},
		addListItem: (item, type) => {
			// create HTML string for income / expense item
			let html = `
			<div class="item clearfix" id="${type}-${item.id}">
				<div class="item__description">${item.desc}</div>
				<div class="right clearfix">
					<div class="item__value" data-value="${item.value}">${formatNumber(
				item.value
			)}</div>
					${type === 'expenses' ? '<div class="item__percentage">0%</div>' : ''}
					<div class="item__delete">
						<button class="item__delete--btn">
							<i class="ion-ios-close-outline" data-item="${type}-${item.id}">
							</i>
						</button>
					</div>
				</div>
			</div>
			`;
			// HTML into DOM
			document
				.querySelector(`.${type}__list`)
				.insertAdjacentHTML('beforeend', html);
		},
		displayBudget: obj => {
			document.querySelector(elements.budgetLbl).textContent = formatNumber(
				obj.budget
			);
			document.querySelector(elements.incomeLbl).textContent = formatNumber(
				obj.totalIncome
			);
			document.querySelector(elements.expensesLbl).textContent = formatNumber(
				obj.totalExpenses
			);
			let percent = document.querySelector(elements.percentLbl);
			if (obj.percent >= 0) {
				percent.textContent = obj.percent + '%';
			} else {
				percent.textContent = '---';
			}
		},
		displayPercents: totalIncome => {
			const listItems = document.querySelectorAll(elements.expenseListItems);
			listItems.forEach(item => {
				const expense = item.querySelector('.item__value');
				const percent = item.querySelector('.item__percentage');
				if (totalIncome > 0) {
					percent.textContent =
						Math.round((expense.dataset.value / totalIncome) * 100) + '%';
				} else {
					percent.textContent = '---';
				}
			});
		},
		deleteListItem: id => {
			document.getElementById(id).remove();
		},
		getElements: () => {
			return elements;
		},
		displayMonth: () => {
			const monthNames = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			];
			const dateElement = document.querySelector(elements.dateLbl);
			const date = new Date();
			dateElement.textContent =
				monthNames[date.getMonth()] + ' ' + date.getFullYear();
		},
		changedType: () => {
			const inputs = document.querySelectorAll(
				elements.inputType +
					', ' +
					elements.inputDesc +
					', ' +
					elements.inputValue
			);

			inputs.forEach(input => {
				input.classList.toggle('red-focus');
			});

			document.querySelector(elements.inputBtn).classList.toggle('red');
		},
		clearInputs: () => {
			// Converted node list into an array to demonstrate using the call method on the Array prototype
			const inputs = document.querySelectorAll(
				elements.inputDesc + ', ' + elements.inputValue
			);
			const inputsArr = Array.prototype.slice.call(inputs);
			inputsArr.forEach(input => {
				input.value = '';
			});
			// Set focus on first input element
			inputsArr[0].focus();
		}
	};
})();

// Serves as the controller of the application
const controller = ((budgetCtrl, UICtrl) => {
	const setupEventListeners = () => {
		const UIElements = UICtrl.getElements();
		document
			.querySelector(UIElements.inputBtn)
			.addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', e => {
			// 'which' is used to support older browsers
			if (e.keyCode === 13 || e.which === 13) {
				ctrlAddItem();
			}
		});

		document
			.querySelector(UIElements.container)
			.addEventListener('click', ctrlDeleteItem);

		document
			.querySelector(UIElements.inputType)
			.addEventListener('change', UICtrl.changedType);
	};

	const updateBudget = () => {
		// recalculate the budget
		budgetCtrl.calculateBudget();
		// return the budget
		const budget = budgetCtrl.getBudget();
		// display the budget in the UI
		UICtrl.displayBudget(budget);
	};

	const updatePercents = () => {
		// get total income from budget
		const totalIncome = budgetCtrl.getBudget().totalIncome;
		// update UI with new percentages
		UICtrl.displayPercents(totalIncome);
	};

	const ctrlAddItem = () => {
		// get field input value
		const input = UICtrl.getInput();
		if (input.desc === '' || isNaN(input.value) || input.value === 0) {
			alert(
				'Please add description and add a valid amount before submitting.'
			);
			return false;
		}
		//  add item to the budget controller
		const newItem = budgetCtrl.addItem(input.type, input.desc, input.value);
		//  add item to the UI
		UICtrl.addListItem(newItem, input.type);
		//  clear input fields
		UICtrl.clearInputs();
		// calculate and update budget
		updateBudget();
		// calculate and update percentages
		updatePercents();
	};

	const ctrlDeleteItem = e => {
		if (e.target && e.target.nodeName === 'I') {
			// get ID stored in a data attribute on the delete icon element
			const attr = e.target.dataset.item;
			// delete node from the DOM
			UICtrl.deleteListItem(attr);
			// delete item from budget array then recalculate and update budget
			budgetCtrl.deleteItem(attr);
			updateBudget();
			// recalculate and update percentages
			updatePercents();
		}
	};

	return {
		init: () => {
      // console.log('Application has begun.');
			UICtrl.displayMonth();
			setupEventListeners();
		}
	};
})(budgetController, UIController);
// begin the app or nothing will ever run because the event listeners are in a private function
controller.init();