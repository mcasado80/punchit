/**
 * @file icons.js
 * @description Contains SVG icon strings for the application's UI controls.
 * This approach keeps the HTML clean and centralizes icon management.
 */

export const ICONS = {
  LOOP_MODE: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3.05 11A9 9 0 0 1 12 3v2.4a.6.6 0 0 0 1 .45l4.2-4.2a.6.6 0 0 0 0-.9L13 0.3a.6.6 0 0 0-1 .45V3A11 11 0 0 0 1 12h2.05Z"/>
      <path d="M20.95 13A9 9 0 0 1 12 21v-2.4a.6.6 0 0 0-1-.45l-4.2 4.2a.6.6 0 0 0 0 .9L11 23.7a.6.6 0 0 0 1-.45V21A11 11 0 0 0 23 12h-2.05Z"/>
    </svg>`,

  NEXT_BANK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 32 32" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
  </svg>`,

  PREVIOUS_BANK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 32 32" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
  </svg>`,

  BEAT_LENGTH_4: `<svg width="30" height="30" viewBox="0 0 30 30"><rect class="beat-indicator" x="4" y="13" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="10" y="13" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="16" y="13" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="22" y="13" width="4" height="4" rx="1" fill="#fff"/></svg>`,
  BEAT_LENGTH_8: `<svg width="30" height="30" viewBox="0 0 30 30"><rect class="beat-indicator" x="4" y="10" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="10" y="10" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="16" y="10" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="22" y="10" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="4" y="16" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="10" y="16" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="16" y="16" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="22" y="16" width="4" height="4" rx="1" fill="#fff"/></svg>`,
  BEAT_LENGTH_16: `<svg width="30" height="30" viewBox="0 0 30 30"><rect class="beat-indicator" x="4" y="4" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="10" y="4" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="16" y="4" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="22" y="4" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="4" y="10" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="10" y="10" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="16" y="10" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="22" y="10" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="4" y="16" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="10" y="16" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="16" y="16" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="22" y="16" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="4" y="22" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="10" y="22" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="16" y="22" width="4" height="4" rx="1" fill="#fff"/><rect class="beat-indicator" x="22" y="22" width="4" height="4" rx="1" fill="#fff"/></svg>`,

  STOP_ALL: `
    <svg width="30" height="30" viewBox="0 0 30 30">
      <rect x="7" y="7" width="16" height="16" rx="2" fill="#fff"/>
    </svg>`,
  TRASH: `
    <svg fill="#FFFFFF" height="30" width="30"
      viewBox="0 0 612 612" xml:space="preserve">
    <g>
      <g>
        <g>
          <path d="M510.812,85.933c-29.254-14.929-58.367-16.325-59.592-16.375c-0.246-0.012-0.492-0.017-0.737-0.017H404.18
            c0.003-0.139,0.022-0.273,0.022-0.415c0-26.812-12.761-48.09-35.931-59.913c-16.138-8.234-31.876-9.122-33.618-9.194
            C334.409,0.006,334.163,0,333.917,0h-55.832c-0.246,0-0.492,0.006-0.737,0.017c-1.741,0.074-17.48,0.96-33.616,9.194
            C220.56,21.035,207.8,42.313,207.8,69.124c0,0.142,0.017,0.276,0.022,0.415h-46.303c-0.246,0-0.492,0.006-0.737,0.017
            c-1.226,0.051-30.337,1.446-59.593,16.375c-28.241,14.41-61.905,44.075-61.905,103.548c0,9.581,7.767,17.35,17.35,17.35h15.245
            l67.087,390.755c1.43,8.328,8.65,14.416,17.099,14.416h299.873c8.449,0,15.67-6.088,17.099-14.416l67.087-390.755h15.245
            c9.581,0,17.35-7.768,17.35-17.35C572.718,130.006,539.053,100.341,510.812,85.933z M75.398,172.13
            c4.22-24.493,17.846-42.891,40.665-54.828c21.272-11.123,43.329-12.888,45.936-13.063h288.005
            c2.585,0.172,24.08,1.906,45.034,12.6c23.361,11.922,37.29,30.475,41.562,55.29L75.398,172.13L75.398,172.13z M242.5,69.125
            c0-13.566,5.156-22.656,16.226-28.599c8.889-4.773,18.372-5.701,19.886-5.825h54.742c1.736,0.142,11.12,1.102,19.92,5.825
            c11.07,5.944,16.228,15.033,16.228,28.599c0,0.142,0.017,0.276,0.022,0.415H242.48C242.482,69.401,242.5,69.265,242.5,69.125z
            M441.312,577.301H170.688l-63.605-370.472h397.834L441.312,577.301z"/>
          <path d="M306,519.57c9.581,0,17.35-7.768,17.35-17.35V257.909c0-9.581-7.768-17.35-17.35-17.35c-9.583,0-17.35,7.768-17.35,17.35
            V502.22C288.65,511.802,296.419,519.57,306,519.57z"/>
          <path d="M203.782,503.754c0.801,9.022,8.373,15.816,17.261,15.816c0.513,0,1.032-0.023,1.553-0.068
            c9.545-0.847,16.596-9.273,15.749-18.816l-21.687-244.311c-0.847-9.545-9.265-16.609-18.817-15.749
            c-9.545,0.847-16.595,9.27-15.748,18.816L203.782,503.754z"/>
          <path d="M389.404,519.502c0.52,0.045,1.04,0.068,1.553,0.068c8.889,0,16.462-6.794,17.263-15.816l21.687-244.313
            c0.847-9.545-6.202-17.968-15.748-18.816c-9.544-0.856-17.968,6.204-18.817,15.749l-21.687,244.311
            C372.808,510.229,379.859,518.655,389.404,519.502z"/>
        </g>
      </g>
    </g>
    </svg>`,
};
