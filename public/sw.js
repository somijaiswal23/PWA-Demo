var cacheName = 'CSv3';

var cachedFiles = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/*',
    '/image/*'
];

self.addEventListener('install', event =>{
    console.log('Service Worker Install Event');
    //Add files to cache
    event.waitUntil(
        caches.open(cacheName).then(cache=>{
            console.log('Caching Files');
            return cache.addAll(cachedFiles);
        }).then (()=>{
            return self.skipWaiting();
        }).catch(err=>{
            console.log(`Cache Failed ${err}`);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated');
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key=>{
                if(key !== cacheName){
                    console.log('Removing old cache', key);
                    return caches.delete(key)
                }
            }));
        })
    );
    return self.clients.claim();
})

self.addEventListener('fetch', event=>{
    console.log(`Fetch Event ${event.request.url}`);
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.response)
        })
    );
})

const closeNotification = (msg, evt) => {
    console.log(msg, evt.notification.data);
    evt.notification.close();
}

self.addEventListener('notificationclose', evt=>{
    closeNotification('Notification Closed', evt);
})

self.addEventListener('notificationclicked', evt =>{
    if(evt.action !== close){
        evt.waitUntil(
            self.clients.matchAll({type: 'window', includeUncontrolled:'true'}).then( allClients =>{
                console.log(allClients);
                for(var i=0; i< allClients.length; i++){
                    if(allClients[i].visibilityState === 'visible'){
                        console.log('Navigating');
                        allClients[i].navigate(evt.notification.data.loc);
                        break;
                    }
                }
            })
        )
    }
    closeNotification('Notification Clicked', evt);
})

self.addEventListener('push', evt=>{
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data
    "${evt.data.text()}"`);

  const title = 'Plotgress';
  const options = {
    body: 'Yay it works.',
    icon: 'image/icon.png',
    badge: 'image/badge.png'
  };

  evt.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://developers.google.com/web/')
  );
});