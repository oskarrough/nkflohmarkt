const stripe = Stripe('pk_test_mZkntVL2ik2gfHlTjm3JbHuK006E6ncmTT', {
	betas: ['checkout_beta_4']
});

const individualButtonCheckout = document.querySelector('.BookingContainer-box');
individualButtonCheckout.addEventListener('click', function () {
    	// When the customer clicks on the button, redirect
    	// them to Checkout.
	stripe.redirectToCheckout({
		items: [{sku: 'sku_EonihanvlPqdvu', quantity: 1}],

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
