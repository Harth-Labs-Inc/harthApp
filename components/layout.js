import Head from "next/head";

const Layout = ({ children }) => {
    return (
        <>
            <Head>
                <title>Härth</title>
                <meta property="og:title" content="Härth" key="title" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1"
                />
                <link rel="manifest" href="/manifest.json" />

                <link rel="icon" type="image/x-icon" href="favicon.ico" />
                <link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-touch-icon-60x60.png" />
                <link rel="apple-touch-icon" sizes="64x64" href="/icons/apple-touch-icon-64x64.png" />
                <link rel="apple-touch-icon" sizes="76x76" href="/icons/apple-touch-icon-76x76.png" />
                <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" />
                <link rel="apple-touch-icon" sizes="128x128" href="/icons/apple-touch-icon-128x128.png" />
                <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
                <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon-167x167.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png"  />
                <link rel="apple-touch-icon" sizes="256x256" href="/icons/apple-touch-icon-256x256.png" />
                <link rel="apple-touch-icon" sizes="512x512" href="/icons/apple-touch-icon-512x512.png"  />
                <link rel="apple-touch-icon" sizes="1024x1024" href="/icons/apple-touch-icon-1024x1024.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="favicon.ico" />
                <link rel="icon" type="image/png" sizes="36x36" href="/icons/icon-36x36.png" />
                <link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48x48.png" />
                <link rel="icon" type="image/png" sizes="70x70" href="/icons/icon-70x70.png" />
                <link rel="icon" type="image/png" sizes="72x72" href="/icons/icon-72x72.png" />
                <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96x96.png" />
                <link rel="icon" type="image/png" sizes="128x128" href="/icons/icon-128x128.png" />
                <link rel="icon" type="image/png" sizes="144x144" href="/icons/icon-144x144.png"  />
                <link rel="icon" type="image/png" sizes="150x150" href="/icons/icon-150x150.png" />
                <link rel="icon" type="image/png" sizes="152x152" href="/icons/icon-152x152.png" />
                <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
                <link rel="icon" type="image/png" sizes="256x256" href="/icons/icon-256x256.png" />
                <link rel="icon" type="image/png" sizes="310x310" href="/icons/icon-310x310.png" />
                <link rel="icon" type="image/png" sizes="384x384" href="/icons/icon-384x384.png" />
                <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
                <link rel="icon" type="image/png" sizes="1024x1024" href="/icons/icon-1024x1024.png" />


                <meta name="theme-color" content="#f5f5f8" />

                <meta name="apple-mobile-web-app-title" content="Härth" />
                <meta name="apple-mobile-web-app-capable" content="yes" />

                
                <link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splashscreens/launch-640x1136.png" />
                <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splashscreens/launch-750x1334.png" />
                <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splashscreens/launch-1125x2436.png" />
                <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splashscreens/launch-828x1792.png" />
                <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splashscreens/launch-1242x2688.png" />
                <link rel="apple-touch-startup-image" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splashscreens/launch-1170x2532.png" />
                <link rel="apple-touch-startup-image" media="(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splashscreens/launch-1080x2340.png" />
                <link rel="apple-touch-startup-image" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splashscreens/launch-1284x2778.png" />
                <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 1) and (orientation: portrait)" href="/splashscreens/launch-768x1024.png" />
                <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splashscreens/launch-1536x2048.png" />
                <link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splashscreens/launch-2048x2732.png" />
                <link rel="apple-touch-startup-image" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splashscreens/launch-1290x2796.png" />
                <link rel="apple-touch-startup-image" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splashscreens/launch-1179x2556.png" />

            </Head>
            {children}
        </>
    );
};

export default Layout;
