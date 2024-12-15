console.log("testing 2...");

let form = document.querySelector(".form"); // has the HTML for the billing information form
let confirmBtn = document.querySelector(".confirm"); // has the HTML for the confirm button under the form

// loading the cart items from the local storage
const getCartItems = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart;
};

// loading the product information from the local storage
const getProductList = async () => {
    const productData = localStorage.getItem('listProducts');
    return JSON.parse(productData);
};


// adding items and updating the summary of the order table
const updateOrderSummary = async () => {
    const summaryTableBody = document.querySelector('.summaryTable tbody');
    const cart = getCartItems();
    const productList = await getProductList();

    summaryTableBody.innerHTML = '';

    if (!productList || productList.length === 0) {
        console.warn('Product list is empty or not found.');
        return; // Exit early if no products exist
    }

    if (cart.length > 0) {
        cart.forEach(cartItem => {
            const product = productList.find(item => item.id === Number(cartItem.product_id));
            if (product) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="display: flex; align-items: center; padding: 10px 20px;">
                        <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                        <span>${product.name}</span>
                    </td>
                    <td style="text-align: center; padding: 10px 20px;">${cartItem.quantity}</td>
                    <td style="text-align: center; padding: 10px 20px;">LKR ${(product.price * cartItem.quantity).toFixed(2)}</td>
                `;
                summaryTableBody.appendChild(row);
            }
        });
    }
};

// calculating and updating the total price of the cart
const updateOrderTotal = async () => {
    const totalOrder = document.querySelector('.order-total b'); // contains the HTML for the total text area
    const cart = getCartItems();
    const productList = await getProductList();

    if (!productList || productList.length === 0) {
        console.warn('Product list is empty or not found.');
        totalOrder.textContent = 'LKR00.00';
        return;
    }

    let totalPrice = 0;

    if (cart.length > 0) {
        cart.forEach(cartItem => {
            const product = productList.find(item => item.id === Number(cartItem.product_id));
            if (product) {
                totalPrice += product.price * cartItem.quantity;
            }
        });
    }

    // updating the total price in the order-total section
    totalOrder.textContent = `LKR${totalPrice.toFixed(2)}`;
};

// updating the order summary and the total when cart changes
const refreshOrderDetails = async () => {
    await updateOrderSummary(); 
    await updateOrderTotal();   
};

// listening for any changes in the local storage of the cart item list
window.addEventListener('storage', (event) => {
    if (event.key === 'cart') {
        updateOrderSummary();
    }
});

// executing the functions when the document is fully loaded
document.addEventListener('DOMContentLoaded', updateOrderSummary);
// document.addEventListener('DOMContentLoaded', refreshOrderDetails);

document.addEventListener('DOMContentLoaded', async () => {
    // Wait a moment to ensure productList is available in localStorage
    await new Promise(resolve => setTimeout(resolve, 100));

    refreshOrderDetails();
});


// validating the form input data and saving it if they are correct and then displaying the confirmation of purchase message

const validateAndProcessPurchase = () => {
    // getting the input fields
    const nameInput = document.getElementById('in-name').value;
    const contactNumInput = document.getElementById('contact-num');
    const emailInput = document.getElementById('email-address');
    const addressInput = document.getElementById('in-address').value;
    const cityInput = document.getElementById('city').value;
    const cardNameInput = document.getElementById('card-name').value;
    const cardNumInput = document.getElementById('card-num');
    const expireInput = document.getElementById('expire');
    const cvvInput = document.getElementById('cvv');

    // getting the <p> elements that will display the error messages
    const contactNumError = document.getElementById('contact-error');
    const emailError = document.getElementById('email-error');
    const cardNumError = document.getElementById('card-error');
    const expireError = document.getElementById('expiry-error');
    const cvvError = document.getElementById('cvv-error');

    // clearing previous error messages
    contactNumError.textContent = '';
    emailError.textContent = '';
    cardNumError.textContent = '';
    expireError.textContent = '';
    cvvError.textContent = '';

    // the default for validation should be true
    let isValid = true;

    // validating the contact number - it should be 10 digits long
    const contactNum = contactNumInput.value;
    if (contactNum.length !== 10 || isNaN(contactNum)) {
        contactNumError.textContent = 'Contact number must be 10 digits long.';
        contactNumInput.value = ''; // clearing the invalid field
        isValid = false;
    }

    // validating the email address - it should end with "@gmail.com"
    const email = emailInput.value;
    if (!email.endsWith("@gmail.com")){
        emailError.textContent = 'Email address must end with @gmail.com.';
        emailInput.value = ''; 
        isValid = false;
    }

    // validating the card number - it should be 16 digits long
    const cardNum = cardNumInput.value;
    if (cardNum.length !== 16 || isNaN(cardNum)){
        cardNumError.textContent = 'Card number must be 16 digits long.';
        cardNumInput.value = ''; 
        isValid = false;
    }

    // validating the card expiry date - it should be in the format of MM/YYYY
    const expire = expireInput.value;
    if (!isValidExpireDate(expire)){
        expireError.textContent = 'Expiry must be in the format MM/YYYY.';
        expireInput.value = ''; 
        isValid = false;
    }

    // validating the cvv number - it should be 3 digits long
    const cvv = cvvInput.value;
    if (cvv.length !== 3 || isNaN(cvv)){
        cvvError.textContent = 'CVV must be 3 digits long.';
        cvvInput.value = ''; // Clear invalid field
        isValid = false;
    }

    // if all the validations pass, showing the confirmation message
    if (isValid) {
        const billingInfo = {
            fullName: nameInput,
            contactNumber: contactNum,
            email: email,
            address: addressInput,
            city: cityInput,
            cardName: cardNameInput,
            cardNumber: cardNum,
            expiry: expire,
            cvv: cvv,
        };

        // saving the billing information in a json format by stringifying it
        localStorage.setItem('billingInfo', JSON.stringify(billingInfo));

        // clearing the stored cart from local storage
        localStorage.removeItem('cart');

        // Overriding the main section content
        if (mainSection) {
            mainSection.innerHTML = `
                <div class="confirmation-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #f9f9f9;">
                    <div style="text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <h3>We've got your order.</h3>
                        <p style="font-size: 18px; margin: 20px 0;">Thank you for your purchase!</p>
                        <p style="font-size: 18px; margin: 15px 0; padding-bottom: 20px;">Your order will be delivered on ${getRandomDate()}</p>
                        <button style="padding: 10px 30px;">Confirm</button>
                    </div>
                </div>
            `;
        }
    }
};

// a function that checks for the format of the card expiry date
function isValidExpireDate(date){
    const parts = date.split("/"); 

    // checking if there's two parts after the split
    if (parts.length !== 2) return false; 

    // converting the specific data section into integer
    const month = parseInt(parts[0], 10); 
    const year = parts[1]; 

    // returning true if:
    // the month is between 1 to 12 and year number length is equal to 4
    return month >= 1 && month <= 12 && year.length === 4 && !isNaN(month) && !isNaN(parseInt(year, 10));
}

const mainSection = document.querySelector('main');
const purchaseBtn = document.getElementById('purchase');

// when the purchase button is clicked, it will validate the form and display the confirmation or errors that would need to be corrected
if (purchaseBtn) {
    purchaseBtn.addEventListener('click', (e) => {
        e.preventDefault(); // prevents any default button behavior
        validateAndProcessPurchase();
    });
}

// generating a random date in the year 2025
function getRandomDate() {
    // generating a random month (1 to 12)
    const randomMonth = Math.floor(Math.random() * 12) + 1;

    //dDetermining the number of days in the randomly chosen month
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][randomMonth - 1];

    // generating a random day (1 to days in the selected month)
    const randomDay = Math.floor(Math.random() * daysInMonth) + 1;

    // formating the date as DD/MM/YYYY
    const formattedDate = `${String(randomDay).padStart(2, '0')}/${String(randomMonth).padStart(2, '0')}/2025`;

    return formattedDate;
}