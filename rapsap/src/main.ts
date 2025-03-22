import './style.css';
import 'animate.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
        <nav class="navbar">
        <img src="/logo.svg" />
      </nav>

      <main class="content">
      <canvas id="rive-canvas" width="900" height="900"></canvas>
        <p class="title">Essentials delivered,</p>

        <p class="animate__animated animate__lightSpeedInLeft animate__faster brand-name">rapsap.</p>

        <p class="description">
          Helping you discover recipes, order fresh ingredients<br />
          instantly and get them delivered in no time.
        </p>

        <p class="highlight">
          <span>Smooth</span> ordering <span>Fast</span> delivery.
        </p>

        <button class="cta">launching soon</button>

      </main>

      
      
`




// <div class="nav-items">
//           <ul>
//             <li>About</li>
//             <li>Franchise</li>
//             <li>Stores</li>
//           </ul>
//         </div>