import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {

  var installEvt;
      window.addEventListener('beforeinstallprompt', evt => {
        console.log('Before Install Prompt');
        installEvt = evt;
        evt.preventDefault();
        document.getElementById('addToHomeScreen').style.display= 'block';
      });

  const hidePrompt = () =>{document.getElementById('addToHomeScreen').style.display = 'none'};

  const installApp = () =>{
        hidePrompt()
        installEvt.prompt();
        installEvt.userChoice.then(result => {
            if(result.outcome === 'accepted'){
                console.log('App Installed');
            } else{
                console.log('App not Installed');
            }
        })
  };

//  window.addEventListener('appinstalled', event=>{
//    console.log('App Installed Event');
//  })

  return (
    <div>

     <section id="addToHomeScreen">
           <h1>Install App</h1>
           <img src="favicon-32x32.png" alt="Plotgress"/>
           Add our app to home screen <br/>
           <a href="javascript:void(0)" onClick={hidePrompt}>
             No, thanks
           </a>
           <button onClick={installApp}>Yes Please!</button>
         </section>

     </div>

  );
}

export default App;
