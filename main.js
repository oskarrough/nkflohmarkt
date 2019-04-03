const stripe = Stripe('pk_test_mZkntVL2ik2gfHlTjm3JbHuK006E6ncmTT', {
	betas: ['checkout_beta_4']
});

const bookingBoxes = document.querySelectorAll('.BookingContainer-box');
bookingBoxes.forEach(box => {
	box.addEventListener('click', function (event) {
    	// When the customer clicks on the button, redirect
    	// them to Checkout.
	const userChoice = event.target.className.split(' ')[1]; // individual or business box
	let skuCode = 'sku_EonihanvlPqdvu'; // individual product in dashboard
	if (userChoice === "BusinessBox") {
		skuCode = 'sku_EoniSO7y5sqZiX';
	}
		stripe.redirectToCheckout({
			items: [{sku: skuCode, quantity: 1}],

      			// Note that it is not guaranteed your customers will be redirected to this
      			// URL *100%* of the time, it's possible that they could e.g. close the
      			// tab between form submission and the redirect.
      			successUrl: 'https://ead9c19f.ngrok.io/success',
      			cancelUrl: 'https://ead9c19f.ngrok.io/canceled',
		})
		
			.then(function (result) {
    				if (result.error) {
	 				// If `redirectToCheckout` fails due to a browser or network
        				// error, display the localized error message to your customer.
        				const displayError = document.getElementById('error-message');
       					displayError.textContent = result.error.message;
      				}
    			});

	});
});
	
	
