# appletv-autoplay
> Tired of the "are you still watching" prompt?

Apple TV Autoplay connects to your Apple TV as a remote. It then watches the video status (playing vs paused) and will send a click when the video has been paused. So far I've confirmed this works with Netflix and Hulu.

## Usage

Install with npm:

```
npm install -g appletv-autoplay
```

Then run `appletv-autoplay`:

```
> appletv-autoplay
Which Apple TV would you like to pair with? Bedroom
Already paired!
Connected!
Adventure Time | S1 E7 - Ricardio the Heart Guy (3.58%) | Hulu (com.hulu.plus) | paused
Paused, pressing play
Adventure Time | S1 E7 - Ricardio the Heart Guy (3.58%) | Hulu (com.hulu.plus) | playing
```

## Tips

I've noticed that you'll lose connection to the Apple TV over long periods of time so you should run appletv-autoplay using a process manager like [pm2](https://github.com/Unitech/pm2). You can pass the UUID of the Apple TV to appletv-autoplay to bypass the Apple TV selection and connect to that Apple TV directly.
