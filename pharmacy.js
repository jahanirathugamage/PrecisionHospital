console.log("testing");

let body = document.querySelector("body"); 

let listProductHTML = document.querySelector(".listProduct"); // contains the HTML from the container that has all the items
let listCartHTML = document.querySelector("tbody"); // contains the HTML from the container that has items in the cart
let iconCartSpan = document.querySelector(".cart-icon span"); // contains the HTML to manipulate the number of items in the cart
let cartTotalHTML = document.querySelector(".total"); // contains the HTML for the cart's total

let listProducts = []; // contains all the product info from the json as list
let carts = []; // contains the temp list of the products added to the cart

// displaying all the products from the json file by overwriting the HTML
const addDataToHTML = () => {
    // Clearing the existing HTML
    listProductHTML.innerHTML = ``;

    // Defining the drug categories
    const categories = [
        { name: "Analgesics", products: [] },
        { name: "Antibiotics", products: [] },
        { name: "Antidepressants", products: [] },
        { name: "Antihistamines", products: [] },
        { name: "Antihypertensives", products: [] }
    ];

    // Grouping the products by category
    listProducts.forEach(product => {
        // Validating if the current category matches the product's category
        const category = categories.find(catNum => catNum.name === product.category);
        if (category) {
            category.products.push(product);
        }
    });

    // Creating sections
    categories.forEach(category => {
        if (category.products.length > 0) {
            // Creating sections
            const section = document.createElement("div");
            section.classList.add("category-section");

            // Adding category headings
            const heading = document.createElement("h4");
            heading.textContent = category.name;
            heading.style.textAlign = "center";
            heading.style.marginBottom = "40px";
            section.appendChild(heading);

            // Creating a container for products
            const productContainer = document.createElement("div");
            productContainer.classList.add("product-container");
            productContainer.style.display = "grid";
            productContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
            productContainer.style.gap = "20px";

            // Adding responsive behavior
            productContainer.style.margin = "0 auto"; 
            productContainer.style.padding = "10px";

            // Adding products
            category.products.forEach(product => {
                let newProduct = document.createElement("div");
                newProduct.classList.add("item");
                newProduct.dataset.id = product.id;

                newProduct.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <h5>${product.name}</h5>
                    <div class="price">LKR${product.price.toFixed(2)}</div>
                    <button class="addCart">
                        Add To Cart
                    </button>
                `;

                // Adding the product card to the container
                productContainer.appendChild(newProduct);
            });

            // Adding the container to the section
            section.appendChild(productContainer);

            // Adding the section to the main container
            listProductHTML.appendChild(section);
        }
    });

    // media responsivity
    const adjustGridForResponsivity = () => {
        const width = window.innerWidth;
        const productContainers = document.querySelectorAll('.product-container');

        productContainers.forEach(container => {
            if (width < 500) {
                container.style.gridTemplateColumns = "repeat(1, 1fr)"; 
            } else if (width < 700) {
                container.style.gridTemplateColumns = "repeat(2, 1fr)"; 
            } else {
                container.style.gridTemplateColumns = "repeat(3, 1fr)"; 
            }
        });
    };

    adjustGridForResponsivity();

    // adjusting based on screen resize
    window.addEventListener('resize', adjustGridForResponsivity);
};

// getting the item id and price to add it to the cart list
listProductHTML.addEventListener("click", (event) => {
    let positionClick = event.target;
    if(positionClick.classList.contains("addCart")){
        let product_id = positionClick.parentElement.dataset.id;

        addToCart(product_id);
    }
});


// the function that adds an item to the cart
const addToCart = (product_id) => {
    let positionThisProductInCart = carts.findIndex((value) => value.product_id == product_id);

    // temp storage of the items added to the cart
    if(positionThisProductInCart < 0 ){
        carts.push({
            product_id: product_id,
            quantity: 1
        });
    }

    // if the user clicks the same product more than once, the quantity is increased by one
    else{
        carts[positionThisProductInCart].quantity += 1;
    }

    addCartToHTML();
    updateCartTotal();
    addCartToMemory();
};



// manipulating the HTML of the cart to add the appearance of the products to the cart
const addCartToHTML = () => {
    // clearing all the HTML in the listCart container
    listCartHTML.innerHTML = ``;

    let totalQuantity = 0;

    // validating that the cart contains no items before executing this part
    if(carts.length > 0){
        carts.forEach(cart => {
            // Incrementing the total quantity
            totalQuantity += cart.quantity;

            let newCart = document.createElement("tr");
            newCart.classList.add("product");

            // adding an id for each cart item
            newCart.dataset.id = cart.product_id;

            // getting the product id
            let positionProduct = listProducts.findIndex((value) => value.id == cart.product_id);
            // getting the product information from the json file by comparing the product id
            let info = listProducts[positionProduct];

            newCart.innerHTML = `
            <td data-label="Product">
                <div class="product-info">
                    <img src="${info.image}" alt="${info.name}" loading="lazy">
                    <div class="name">${info.name}</div>
                </div>
            </td>
            <td data-label="Price"><div class="price" value ="${info.price.toFixed(2)}">LKR${info.price.toFixed(2)}</div></td>
            <td data-label="Quantity">
                <div class="quantity">
                    <span class="decrease" title="Decrease Quantity"><svg class="minus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11V13H19V11H5Z"></path></svg></span>
                    <input id="inQuantity" type="number" value="${cart.quantity}" required> 
                    <span class="increase" title="Increase Quantity"><svg  class="plus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg></span>
                </div>
            </td>

            <td data-label="Total">LKR${(info.price * cart.quantity).toFixed(2)}</td>
            <td data-label="Remove">
                <div class="remove-btn" title="Remove Item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
                    </svg>
                </div>
            </td>
            `;

            listCartHTML.appendChild(newCart);
        });
    }

    // changing the displayed number of items in the cart icon
    iconCartSpan.innerText = totalQuantity;
};

// changing the quantity of the product based on which quantity manipulation icon was clicked
const changeQuantity = (product_id, type) => {
    let positionItemInCart = carts.findIndex((value) => value.product_id === product_id);

    if(positionItemInCart >= 0){
        // a switch case for the icon clicked
        switch (type){
            case "plus":
                carts[positionItemInCart].quantity += 1;
                break;
            case "minus":
                // validating to make sure that the minus icon can only work if the quantity is more than 0
                let valueChange = carts[positionItemInCart].quantity - 1;
                if(valueChange > 0){
                    carts[positionItemInCart].quantity = valueChange;
                }
                else{
                    carts.splice(positionItemInCart, 1); // removing the item from the cart
                }
                break;
        }
    }

    addCartToMemory();
    addCartToHTML();
    updateCartTotal();
};

// changing the quantity of the product based on what the user inputs in the input field
const inputQuantity = (product_id, newQuantity) => {
    let positionItemInCart = carts.findIndex((value) => value.product_id === product_id);

    if(positionItemInCart >= 0){
        if (newQuantity > 0){
            // validating the quantity input in order to update the quantity
            carts[positionItemInCart].quantity = newQuantity;
        }
        else{
            // removing the product if the new quantity is 0
            carts.splice(positionItemInCart, 1);
        }
    }

    addCartToMemory();
    addCartToHTML();
    updateCartTotal();
};


// finding out which quantity manipulation icon was clicked and calling the function that will change the quantity
listCartHTML.addEventListener("click", (event) => {
    let positionClick = event.target;

    if(positionClick.classList.contains("minus") || positionClick.classList.contains("plus")){
        
        // finding the closest table row <tr> containing the data-id attribute
        let parentRow = positionClick.closest("tr");

        // accessing the product id and which quantity manipulation icon was clicked
        if(parentRow && parentRow.dataset.id){
            let product_id = parentRow.dataset.id;

            // determining if the clicked icon is a plus or minus
            if(positionClick.classList.contains("plus")){
                type = "plus";
            }
            else{
                type = "minus";
            }

            // calling the function if the product id is valid
            changeQuantity(product_id, type);
        } 
        else{
            console.log("Product ID was not found when item was clicked.")
        }
    }
});

// finding out the quantity that was manually input into the input field by the user
listCartHTML.addEventListener("input", (event) => {
    let positionInput = event.target;

    // validating that the event was caused because of a change in the input field
    if(positionInput.id === "inQuantity"){
        let parentRow = positionInput.closest("tr");

        if(parentRow && parentRow.dataset.id){
            let product_id = parentRow.dataset.id;

            // storing the new quantity as a number
            let newQuantity = parseInt(positionInput.value, 10);

            // error handling
            if(!isNaN(newQuantity) && newQuantity >= 0){
                inputQuantity(product_id, newQuantity);
            }
            else{
                console.log("Invalid input quantity"); 
            }
        }
    }
});

// removing an item from the cart if the remove button was clicked
listCartHTML.addEventListener("click", (event) => {

    // makes sure that the event is targetted at the icon
    let positionClick = event.target.closest(".remove-btn");

    if(positionClick){
        
        // finding the closest table row <tr> containing the data-id attribute
        let parentRow = positionClick.closest("tr");

        // accessing the product id and which quantity manipulation icon was clicked
        if(parentRow && parentRow.dataset.id){
            let product_id = parentRow.dataset.id;
            let positionItemInCart = carts.findIndex((value) => value.product_id === product_id);
            
            if(positionItemInCart >= 0){
                // removing the product if the new quantity is 0
                carts.splice(positionItemInCart, 1);
            }

            addCartToMemory();
            addCartToHTML();
            updateCartTotal();
        }
    }
});

// saving the current cart items as favorite
const saveFavorites = () => {
    if(carts.length !== 0){
        localStorage.setItem("favorites", JSON.stringify(carts));
        alert("Saved to favorites!");
    }
    else{
        alert("Error! Unable to add an empty cart to favorites!")
    }
};

// applying the saved favorites to the cart
const applyFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites"));

    if(favorites){
        // applying the items in the favorites to the cart
        favorites.forEach(favorite => {
            let positionThisProductInCart = carts.findIndex((cart) => cart.product_id == favorite.product_id);
            if(positionThisProductInCart < 0){
                carts.push({
                    product_id: favorite.product_id,
                    quantity: favorite.quantity
                });
            } 
            else{
                carts[positionThisProductInCart].quantity += favorite.quantity;
            }

        });

        addCartToHTML();
        updateCartTotal();
        addCartToMemory();

    }
    else{
        alert("Error! No Saved Favorites!");
    }
};

document.querySelector(".addFav").addEventListener("click", saveFavorites);
document.querySelector(".applyFav").addEventListener("click", applyFavorites);

// to change the total of the cart
const updateCartTotal = () => {

    // verifying the existence of the listProducts
    if(listProducts.length === 0){
        console.log("Product list is empty.")
        return;
    }

    let total = 0;

    // calculating the total price
    carts.forEach(cart => {

        // making usre that the product_id is the same data type as item id in the listProducts
        let positionProduct = listProducts.findIndex((product) => product.id === Number(cart.product_id));
        
        if(positionProduct !== -1){
            let info = listProducts[positionProduct];
            total += info.price * cart.quantity;
            
        }
        else{
            console.warn(`Product id ${cart.product_id} not found.`);
        }
    });

    // updating the cart total in the html
    cartTotalHTML.querySelector("b").textContent = `LKR${total.toFixed(2)}`;

    // showing the total as 0 if the cart is empty
    if(carts.length === 0){
        cartTotalHTML.querySelector("b").textContent = `LKR00.00`;
    }
};

// Function to handle the checkout process
const handleCheckout = () => {
    // checking if the cart is not empty
    if (carts.length > 0) {
        // if the cart is populated, it will redirect to the checkout page
        window.location.href = "checkout.html"; 
    } else {
        // alert the user that the cart is empty
        alert("The cart is empty. Please add items.");
    }
};

// when the checkout button is clicked, it will check if the cart is empty, if it isn't then it will redirect the user to the checkout page
document.getElementById("buy-btn").addEventListener("click", handleCheckout);

// the function that stores the cart item added into a json format or as local storage
const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(carts));
};

// the function that is involved with the json files

const initApp = () => {
    // getting the data from the json 
    fetch("pharmacy.json")
    .then(response => response.json())
    .then(data => {
        // accessing the "product" array from the json file
        listProducts = data.product;

        // Save the product list to local storage
        localStorage.setItem('listProducts', JSON.stringify(listProducts));

        addDataToHTML();

        // getting the cart from the local memory
        if(localStorage.getItem('cart')){
            carts = JSON.parse(localStorage.getItem('cart'));
            addCartToHTML();
        }

        updateCartTotal();
    });
};

initApp();
