const applicationServerPublicKey = 'BD90rHy_o8pNBHDrEHNcYPpL6aYkseancX0S8Q6H_XPP8rUJ0G13Dw2Z7M3yjqvZnF6TZcNOxc1fH4CJC1pSSaE';

    const pushButton = document.querySelector('.js-push-btn');

    let swRegistration = null;

    let isSubscribed = false;

    function urlB64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('Service Worker and Push is supported');

      navigator.serviceWorker.register('/sw.js')
       .then(swReg => {
      console.log('Service Worker is registered', swReg);

      swRegistration = swReg;
      initializeUI();
    })
   .catch(error=> {
      console.error('Service Worker Error', error);
  });
  } else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
  }

    /*
    if('serviceWorker' in navigator && 'PushManager' in window){

    //register the service worker
    navigator.serviceWorker.register('/sw.js').then(result => {
    console.log('Service Worker Registered');
    console.log(`Scope ${result.scope}`);

        subscribeToPush();
    },
    error =>{
        console.log('Service Worker Registration Failed');
        console.log(error);
    });
    } else{
    console.log('Service Worker Not Supported');
    }

    const notify = (title, options) => {

        if(Notification.permission === 'granted'){
          navigator.serviceWorker.ready.then(reg =>{
            reg.showNotification(title, options);
           });
        }
      }*/

    const subscribeToPush= () => {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.subscribe({userVisibleOnly:true}).then(sub => {
          console.log(JSON.stringify(sub))
          console.log("Endpoint: "+ sub.endpoint);
          console.log('User Subscribed');
        })
      })
    }

  function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {
      console.log('User is subscribed');

      updateSubscriptionOnServer(subscription);

      isSubscribed = true;

      updateBtn();
    })
    .catch(function(err) {
      console.log('Failed to subscribe the user: ', err);
      updateBtn();
    });
  }

  function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server

    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails =
      document.querySelector('.js-subscription-details');

    if (subscription) {
      subscriptionJson.textContent = JSON.stringify(subscription);
      subscriptionDetails.classList.remove('is-invisible');
    } else {
      subscriptionDetails.classList.add('is-invisible');
    }
  }

  function initializeUI() {

  pushButton.addEventListener('click', function() {
      pushButton.disabled = true;
      if (isSubscribed) {
        unsubscribeUser();
      } else {
        subscribeUser();
      }
    });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }

    updateBtn();
  });
}

function updateBtn() {

    if (Notification.permission === 'denied') {
        pushButton.textContent = 'Push Messaging Blocked.';
        pushButton.disabled = true;
        updateSubscriptionOnServer(null);
        return;
      }

  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}