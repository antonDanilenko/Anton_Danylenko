document.addEventListener('DOMContentLoaded', function(){
    const applyOrderBtn = document.querySelector('.btn-check');
    const goods = Array.from(document.getElementsByClassName('product-box__item'))
        .map(htmlElement => new Good(htmlElement));
    const cart = new CartInfo(document.querySelector('.top-cart-info__item'));

    // Filters
    const categoryFilter = new Filter(document.querySelector('.select-box .select-control'));
    const priceFilter = new Filter(document.querySelector('.price-select-box .select-control'));

    // Popup
    const popup = new OrderPopup();

    function onGoodsQtyChanged(event) {
        const totalGoodsQty = goods.reduce((acc, item) => {
            acc += item.qty;
            return acc;
        }, 0);
        const totalOrder = goods.reduce((acc, item) => {
            acc += item.getTotal();
            return acc
        }, 0);

        cart.updateCart(totalGoodsQty, totalOrder);
    }

    function filterByCategory(item) {
        return categoryFilter.current && item.category !== categoryFilter.current;
    }

    function filterByPrice(item) {
        return priceFilter.current * 1 && item.price > priceFilter.current * 1;
    }

    function onFilterChanged(event) {
        goods.forEach(good => good.show());
        goods.filter(good => filterByCategory(good) || filterByPrice(good)).forEach(good => good.hide());
    }

    function sendOrder() {
        if (popup.validate()) {
            cart.clear();
            alert('Thanks for order!');
            popup.close();
            return;
        }

        alert('Name or Email is invalid');
    }

    // Add event listeners
    goods.forEach( good => good.addEventListener('input', onGoodsQtyChanged));
    priceFilter.addEventListener('change', onFilterChanged);
    categoryFilter.addEventListener('change', onFilterChanged);
    applyOrderBtn.addEventListener('click', popup.open.bind(popup));
    popup.addSendEventListener('click', sendOrder.bind(popup));
})

// Good class
function Good(htmlElement) {
    this.container = htmlElement;
    this.qty = htmlElement.querySelector('.qty__item').value * 1;
    this.price = htmlElement.querySelector('p').innerHTML.split(" ")[0] * 1;
    this.category = htmlElement.dataset.category * 1;

    htmlElement.querySelector('.qty__item')
        .addEventListener('input', (event) => {
            this.qty = this.sanitaizeValue(event.target.value * 1);
            event.target.value = this.sanitaizeValue(event.target.value);
        });
}

Good.prototype.getTotal = function() {
    return this.price * this.qty;
}

Good.prototype.sanitaizeValue = function(value) {
    return value > 0 ? value * 1 : 0
}

Good.prototype.show = function() {
    this.container.classList.remove('hidden');
}

Good.prototype.hide = function() {
    this.container.classList.add('hidden');
}

Good.prototype.addEventListener = function(event, cb) {
    this.container.addEventListener(event, cb);
}

// Cart class
function CartInfo(htmlElement) {
    this.container = htmlElement;
    this.totalGoodsContainer = htmlElement.querySelector('.top-cart-info__item span');
    this.totalOrderContainer = htmlElement.querySelector('.top-cart-info__item span:last-of-type');
}

CartInfo.prototype.setTotalGoods = function (total) {
    this.totalGoodsContainer.innerHTML = total;
}

CartInfo.prototype.setTotalOrder = function (total) {
    this.totalOrderContainer.innerHTML = total;
}

CartInfo.prototype.updateCart = function (totalGoods, totalOrder) {
    this.setTotalGoods(totalGoods);
    this.setTotalOrder(totalOrder);
}

CartInfo.prototype.clear = function() {
    this.totalGoodsContainer.innerHTML = 'XXX';
    this.totalOrderContainer.innerHTML = 'XXX';
}

// Filter class
function Filter(htmlElement) {
    this.container = htmlElement;
    this.current = htmlElement.value;

    htmlElement.addEventListener('change', (event) => {
        this.current = event.target.value * 1;
    });
}

Filter.prototype.addEventListener = function(event, cb) {
    this.container.addEventListener(event, cb);
}

// Popup class
function OrderPopup() {
    this.template = `
        <div id="popup" class="hidden">
            <form>
                <input type="text" id="popup__name" placeholder="Name" required>
                <input type="email" id="popup__email" placeholder="Email" required>
                <button id="send">Отправить</button>
            </form>
        </div>
    `;

    this.init();
}

OrderPopup.prototype.init = function() {
    const body = document.body || document.querySelector('body');
    body.insertAdjacentHTML('beforeend', this.template);
    this.container = document.getElementById('popup');
    this.button = document.getElementById('send');
}

OrderPopup.prototype.open = function() {
    this.container.classList.remove('hidden');
}

OrderPopup.prototype.close = function () {
    this.container.classList.add('hidden');
}

OrderPopup.prototype.validate = function () {
    const inputName = document.getElementById('popup__name');
    const inputEmail = document.getElementById('popup__email');

    return !!inputName.value.trim() && !!inputEmail.value.trim();
}

OrderPopup.prototype.addSendEventListener = function(event, cb) {
    this.button.addEventListener(event, cb);
}