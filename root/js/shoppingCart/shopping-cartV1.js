const parentElement = document.querySelector('#buyItems');
const cartSumPrice = document.querySelector('#sum-prices');
const checkoutButton = document.querySelector('.checkout');
let productsInCart = [];

const countTheSumPrice = () => {
    let sum = 0;
    productsInCart.forEach(item => {
        sum += item.price;
    });
    return sum;
};

const updateShoppingCartHTML = () => {
    if (productsInCart.length > 0) {
        let result = productsInCart.map(product => {
            return `
        <li class="buyItem">
          <img src="${product.image}">
          <div>
            <h5>${product.name}</h5>
            <h6>$${product.price}</h6>
            <div>
              <button class="button-minus" data-id=${product.id}>-</button>
              <span class="countOfProduct">${product.count}</span>
              <button class="button-plus" data-id=${product.id}>+</button>
            </div>
          </div>
        </li>`;
        });
        parentElement.innerHTML = result.join('');
        document.querySelector('.checkout').classList.remove('hidden');
        cartSumPrice.innerHTML = '$' + countTheSumPrice();
    } else {
        document.querySelector('.checkout').classList.add('hidden');
        parentElement.innerHTML = '<h4 class="empty">Your shopping cart is empty</h4>';
        cartSumPrice.innerHTML = '';
    }
};

const updateProductsInCart = (product) => {
    if (!Array.isArray(productsInCart)) {
        productsInCart = [];
    }

    for (let i = 0; i < productsInCart.length; i++) {
        if (productsInCart[i].id == product.id && productsInCart[i].categoryId == product.categoryId) {
            productsInCart[i].count += 1;
            productsInCart[i].price = productsInCart[i].basePrice * productsInCart[i].count;
            console.log("Item Added");
            return;
        }
    }

    console.log("Item Added");
    productsInCart.push(product);
};

const saveCartDataToLocal = () => {
    localStorage.clear(); // Clear the local storage
    localStorage.setItem('productsInCart', JSON.stringify(productsInCart));
};

const loadCartDataFromLocal = () => {
    const cartData = localStorage.getItem('productsInCart');
    if (cartData) {
        productsInCart = JSON.parse(cartData);
        updateShoppingCartHTML();
    }
};

const sendCartData = (cartData) => {
    fetch('/Home/ReceiveCartData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cartData)
    })
        .then(response => {
            if (response.ok) {
                console.log('Cart data sent successfully');
                return response.text();
            } else {
                throw new Error('Error sending cart data');
            }
        })
        .then(responseText => {
            console.log('Order created:', responseText);
            showOrderCreatedMessage();
        })
        .catch(error => {
            console.error('Error sending cart data:', error);
        });
};

const showOrderCreatedMessage = () => {
    alert('Order Created!');
};

parentElement.addEventListener('click', (e) => {
    const isPlusButton = e.target.classList.contains('button-plus');
    const isMinusButton = e.target.classList.contains('button-minus');
    if (isPlusButton || isMinusButton) {
        for (let i = 0; i < productsInCart.length; i++) {
            if (productsInCart[i].id == e.target.dataset.id) {
                if (isPlusButton) {
                    productsInCart[i].count += 1;
                } else if (isMinusButton) {
                    productsInCart[i].count -= 1;
                }
                productsInCart[i].price = productsInCart[i].basePrice * productsInCart[i].count;
            }
            if (productsInCart[i].count <= 0) {
                productsInCart.splice(i, 1);
            }
        }
        updateShoppingCartHTML();
        saveCartDataToLocal(); // Save cart data to local storage after updating
    }
});

const addToCartButtons = document.querySelectorAll('.addToCart');
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const product = {
            id: button.dataset.id,
            categoryId: button.dataset.categoryId,
            name: button.dataset.name,
            price: Number(button.dataset.price),
            basePrice: Number(button.dataset.price),
            count: 1,
            image: button.dataset.image
        };
        updateProductsInCart(product);
        updateShoppingCartHTML();
        saveCartDataToLocal(); // Save cart data to local storage after updating
    });
});

checkoutButton.addEventListener('click', () => {
    if (productsInCart.length > 0) {
        sendCartData(productsInCart);
        productsInCart = [];
        updateShoppingCartHTML();
        localStorage.removeItem('productsInCart'); // Clear cart data from local storage after checkout
    } else {
        console.log('Your shopping cart is empty');
    }
});

loadCartDataFromLocal();
